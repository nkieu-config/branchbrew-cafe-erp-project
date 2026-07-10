import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaService } from '../src/prisma/prisma.service';
import { createE2eApp } from './e2e-app.util';
import {
  cleanupPosFixture,
  E2E_PASSWORD,
  seedPosFixture,
} from './e2e-fixtures.util';

const describeIfDatabase = process.env.DATABASE_URL ? describe : describe.skip;

describeIfDatabase('Concurrent order reversal (e2e)', () => {
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

  async function loginAgent(email: string) {
    const agent = request.agent(app.getHttpServer());
    await agent
      .post('/auth/login')
      .send({ email, password: E2E_PASSWORD })
      .expect(200);
    return agent;
  }

  async function readStock() {
    const row = await prisma.branchInventory.findFirst({
      where: {
        branchId: fixture.branch.id,
        ingredientId: fixture.ingredient.id,
      },
    });
    return row!.stock;
  }

  it('restores stock exactly once when two voids race on the same order', async () => {
    const staffAgent = await loginAgent(fixture.email);
    const orderRes = await staffAgent
      .post('/orders')
      .send({
        branchId: fixture.branch.id,
        items: [{ productId: fixture.product.id, quantity: 2 }],
      })
      .expect(201);

    const orderId = orderRes.body.id as number;
    const stockAfterSale = await readStock();

    const [first, second] = await Promise.all([
      (await loginAgent(fixture.managerEmail))
        .post(`/orders/${orderId}/void`)
        .send(),
      (await loginAgent(fixture.managerEmail))
        .post(`/orders/${orderId}/void`)
        .send(),
    ]);

    const statuses = [first.status, second.status].sort((a, b) => a - b);
    expect(statuses[0]).toBe(201);
    expect(statuses[1]).toBe(400);

    const stockAfterVoid = await readStock();
    expect(stockAfterVoid).toBe(stockAfterSale + 40);

    const order = await prisma.order.findUniqueOrThrow({
      where: { id: orderId },
    });
    expect(order.status).toBe('CANCELLED');
  });
});
