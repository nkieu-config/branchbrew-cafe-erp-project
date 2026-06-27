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

const describeIfDatabase = process.env.DATABASE_URL ? describe : describe.skip;

describeIfDatabase('POS order flow (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let fixture: Awaited<ReturnType<typeof seedPosFixture>>;

  beforeAll(async () => {
    app = await createE2eApp();
    prisma = app.get(PrismaService);
    fixture = await seedPosFixture(prisma);
  });

  afterAll(async () => {
    await cleanupPosFixture(prisma, fixture.email);
    await app?.close();
  });

  it('creates a paid order and deducts branch stock', async () => {
    const agent = request.agent(app.getHttpServer());

    await agent
      .post('/auth/login')
      .send({ email: fixture.email, password: E2E_PASSWORD })
      .expect(200);

    const orderRes = await agent
      .post('/orders')
      .send({
        branchId: fixture.branch.id,
        items: [{ productId: fixture.product.id, quantity: 2 }],
        paymentMethod: 'CASH',
      })
      .expect(201);

    expect(orderRes.body.netAmount).toBeDefined();
    expect(orderRes.body.status).toBe('PENDING');

    const inventory = await prisma.branchInventory.findFirst({
      where: {
        branchId: fixture.branch.id,
        ingredientId: fixture.ingredient.id,
      },
    });

    expect(inventory?.stock).toBe(960);
  });

  it('lists kitchen orders on KDS then void restores stock', async () => {
    const staffAgent = request.agent(app.getHttpServer());
    await staffAgent
      .post('/auth/login')
      .send({ email: fixture.email, password: E2E_PASSWORD })
      .expect(200);

    const orderRes = await staffAgent
      .post('/orders')
      .send({
        branchId: fixture.branch.id,
        items: [{ productId: fixture.product.id, quantity: 1 }],
        paymentMethod: 'CASH',
      })
      .expect(201);

    const orderId = orderRes.body.id as number;

    const kdsRes = await staffAgent
      .get(`/orders/kds?branchId=${fixture.branch.id}`)
      .expect(200);

    expect(kdsRes.body.some((o: { id: number }) => o.id === orderId)).toBe(
      true,
    );

    const managerAgent = request.agent(app.getHttpServer());
    await managerAgent
      .post('/auth/login')
      .send({ email: fixture.managerEmail, password: E2E_PASSWORD })
      .expect(200);

    await managerAgent.post(`/orders/${orderId}/void`).expect(201);

    await processOutboxOnce(app);

    const inventory = await prisma.branchInventory.findFirst({
      where: {
        branchId: fixture.branch.id,
        ingredientId: fixture.ingredient.id,
      },
    });
    expect(inventory?.stock).toBe(1000);

    const cancelled = await prisma.order.findUnique({ where: { id: orderId } });
    expect(cancelled?.status).toBe('CANCELLED');

    const kdsAfter = await staffAgent
      .get(`/orders/kds?branchId=${fixture.branch.id}`)
      .expect(200);
    expect(kdsAfter.body.some((o: { id: number }) => o.id === orderId)).toBe(
      false,
    );

    const journal = await prisma.journalEntry.findFirst({
      where: { reference: `VOID-ORD-${orderId}` },
    });
    expect(journal).not.toBeNull();
  });

  it('refunds a previous-day completed order', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const pastOrder = await prisma.order.create({
      data: {
        userId: fixture.user.id,
        branchId: fixture.branch.id,
        status: 'COMPLETED',
        paymentMethod: 'CASH',
        totalAmount: 100,
        netAmount: 100,
        discountAmount: 0,
        taxAmount: 100 * 0.07 / 1.07,
        totalCogs: 20,
        queueNumber: 99,
        queueDate: yesterday,
        createdAt: yesterday,
        items: {
          create: [
            {
              productId: fixture.product.id,
              quantity: 1,
              price: 100,
            },
          ],
        },
      },
    });

    const stockBefore = await prisma.branchInventory.findFirst({
      where: {
        branchId: fixture.branch.id,
        ingredientId: fixture.ingredient.id,
      },
    });

    const managerAgent = request.agent(app.getHttpServer());
    await managerAgent
      .post('/auth/login')
      .send({ email: fixture.managerEmail, password: E2E_PASSWORD })
      .expect(200);

    await managerAgent
      .post(`/orders/${pastOrder.id}/refund`)
      .send({ reason: 'Customer complaint' })
      .expect(201);

    await processOutboxOnce(app);

    const refunded = await prisma.order.findUnique({
      where: { id: pastOrder.id },
    });
    expect(refunded?.status).toBe('REFUNDED');
    expect(refunded?.refundReason).toBe('Customer complaint');

    const stockAfter = await prisma.branchInventory.findFirst({
      where: {
        branchId: fixture.branch.id,
        ingredientId: fixture.ingredient.id,
      },
    });
    expect(stockAfter?.stock).toBe((stockBefore?.stock ?? 0) + 20);

    const journal = await prisma.journalEntry.findFirst({
      where: { reference: `REFUND-ORD-${pastOrder.id}` },
    });
    expect(journal).not.toBeNull();

    await prisma.orderItem.deleteMany({ where: { orderId: pastOrder.id } });
    await prisma.order.delete({ where: { id: pastOrder.id } });
    await prisma.journalEntryLine.deleteMany({
      where: { journalEntry: { reference: `REFUND-ORD-${pastOrder.id}` } },
    });
    await prisma.journalEntry.deleteMany({
      where: { reference: `REFUND-ORD-${pastOrder.id}` },
    });
  });
});
