import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaService } from '../src/prisma/prisma.service';
import { createE2eApp, processOutboxOnce } from './e2e-app.util';
import {
  cleanupPosFixture,
  E2E_PASSWORD,
  seedPosFixture,
} from './e2e-fixtures.util';
import { STALE_PROCESSING_MS } from '../src/outbox/outbox.constants';

const describeIfDatabase = process.env.DATABASE_URL ? describe : describe.skip;

async function waitForJournal(
  prisma: PrismaService,
  reference: string,
  attempts = 10,
) {
  for (let i = 0; i < attempts; i++) {
    const entry = await prisma.journalEntry.findUnique({
      where: { reference },
      include: { lines: true },
    });
    if (entry) return entry;
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  return null;
}

describeIfDatabase('Outbox recovery from a dead worker (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let fixture: Awaited<ReturnType<typeof seedPosFixture>>;

  beforeAll(async () => {
    jest.setTimeout(30000);
    app = await createE2eApp();
    prisma = app.get(PrismaService);
    fixture = await seedPosFixture(prisma);
  });

  afterAll(async () => {
    await cleanupPosFixture(prisma, fixture.email);
    await app?.close();
  });

  it('reclaims an event stranded in PROCESSING and posts its journal entry', async () => {
    const agent = request.agent(app.getHttpServer());
    await agent
      .post('/auth/login')
      .send({ email: fixture.email, password: E2E_PASSWORD })
      .expect(200);

    const orderRes = await agent
      .post('/orders')
      .send({
        branchId: fixture.branch.id,
        items: [{ productId: fixture.product.id, quantity: 1 }],
      })
      .expect(201);

    const orderId = orderRes.body.id as number;
    const reference = `ORD-${orderId}`;

    const event = await prisma.outboxEvent.findFirstOrThrow({
      where: { eventType: 'order.created', status: 'PENDING' },
      orderBy: { id: 'desc' },
    });

    await prisma.outboxEvent.update({
      where: { id: event.id },
      data: {
        status: 'PROCESSING',
        attempts: 1,
        claimedAt: new Date(Date.now() - STALE_PROCESSING_MS - 60_000),
      },
    });

    expect(
      await prisma.journalEntry.findUnique({ where: { reference } }),
    ).toBeNull();

    await processOutboxOnce(app);

    const recovered = await prisma.outboxEvent.findUniqueOrThrow({
      where: { id: event.id },
    });
    expect(recovered.status).toBe('COMPLETED');

    const journal = await waitForJournal(prisma, reference);
    expect(journal).not.toBeNull();
    expect(journal!.lines.length).toBeGreaterThan(0);
  });

  it('leaves a freshly claimed event alone', async () => {
    const event = await prisma.outboxEvent.create({
      data: {
        eventType: 'order.status.updated',
        payload: {
          orderId: 1,
          status: 'COMPLETED',
          branchId: fixture.branch.id,
        },
        status: 'PROCESSING',
        attempts: 1,
        claimedAt: new Date(),
      },
    });

    await processOutboxOnce(app);

    const untouched = await prisma.outboxEvent.findUniqueOrThrow({
      where: { id: event.id },
    });
    expect(untouched.status).toBe('PROCESSING');
    expect(untouched.attempts).toBe(1);

    await prisma.outboxEvent.delete({ where: { id: event.id } });
  });
});
