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
import { roundMoney } from '../src/common/decimal.util';

const describeIfDatabase = process.env.DATABASE_URL ? describe : describe.skip;

async function flushOutbox(app: INestApplication<App>, cycles = 5) {
  for (let i = 0; i < cycles; i++) {
    await processOutboxOnce(app);
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
}

async function waitForJournal(
  prisma: PrismaService,
  reference: string,
  attempts = 10,
) {
  for (let i = 0; i < attempts; i++) {
    const entry = await prisma.journalEntry.findFirst({
      where: { reference },
      include: {
        lines: { include: { account: true } },
      },
    });
    if (entry) return entry;
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  return null;
}

type JournalLine = {
  debit: { toNumber(): number } | number | string;
  credit: { toNumber(): number } | number | string;
  account: { code: string };
};

function lineAmount(value: JournalLine['debit']): number {
  if (value == null) return 0;
  if (typeof value === 'object' && 'toNumber' in value) return value.toNumber();
  return Number(value);
}

async function expectBalancedJournal(prisma: PrismaService, reference: string) {
  const entry = await waitForJournal(prisma, reference);
  expect(entry).not.toBeNull();

  const debits = entry!.lines.reduce(
    (sum, line) => sum + lineAmount(line.debit),
    0,
  );
  const credits = entry!.lines.reduce(
    (sum, line) => sum + lineAmount(line.credit),
    0,
  );

  expect(roundMoney(debits)).toBe(roundMoney(credits));
  return entry!;
}

function lineByAccount(lines: JournalLine[], code: string) {
  const line = lines.find((l) => l.account.code === code);
  expect(line).toBeDefined();
  return line!;
}

describeIfDatabase('Order accounting & inventory integration (e2e)', () => {
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

  it('posts a balanced sales journal and deducts inventory on order create', async () => {
    const stockBefore = await prisma.branchInventory.findFirst({
      where: {
        branchId: fixture.branch.id,
        ingredientId: fixture.ingredient.id,
      },
    });

    const agent = await loginAgent(fixture.email);
    const orderRes = await agent
      .post('/orders')
      .send({
        branchId: fixture.branch.id,
        items: [{ productId: fixture.product.id, quantity: 2 }],
        paymentMethod: 'CASH',
      })
      .expect(201);

    const orderId = orderRes.body.id as number;
    const netAmount = Number(orderRes.body.netAmount);
    const totalCogs = Number(orderRes.body.totalCogs);

    await flushOutbox(app);

    const entry = await expectBalancedJournal(prisma, `ORD-${orderId}`);
    const cash = lineByAccount(entry.lines, '1010');
    const revenue = lineByAccount(entry.lines, '4010');
    const cogs = lineByAccount(entry.lines, '5010');
    const inventory = lineByAccount(entry.lines, '1030');

    expect(lineAmount(cash.debit)).toBeCloseTo(netAmount, 2);
    expect(lineAmount(revenue.credit)).toBeCloseTo(netAmount, 2);
    expect(lineAmount(cogs.debit)).toBeCloseTo(totalCogs, 2);
    expect(lineAmount(inventory.credit)).toBeCloseTo(totalCogs, 2);

    const stockAfter = await prisma.branchInventory.findFirst({
      where: {
        branchId: fixture.branch.id,
        ingredientId: fixture.ingredient.id,
      },
    });
    expect(stockAfter?.stock).toBe((stockBefore?.stock ?? 0) - 40);
  }, 30000);

  it('void reverses the sales journal and restores inventory', async () => {
    const staffAgent = await loginAgent(fixture.email);
    const orderRes = await staffAgent
      .post('/orders')
      .send({
        branchId: fixture.branch.id,
        items: [{ productId: fixture.product.id, quantity: 1 }],
        paymentMethod: 'CASH',
      })
      .expect(201);

    const orderId = orderRes.body.id as number;
    const netAmount = Number(orderRes.body.netAmount);
    const totalCogs = Number(orderRes.body.totalCogs);

    await flushOutbox(app);

    const stockBeforeVoid = await prisma.branchInventory.findFirst({
      where: {
        branchId: fixture.branch.id,
        ingredientId: fixture.ingredient.id,
      },
    });

    const managerAgent = await loginAgent(fixture.managerEmail);
    await managerAgent.post(`/orders/${orderId}/void`).expect(201);
    await flushOutbox(app);

    const entry = await expectBalancedJournal(prisma, `VOID-ORD-${orderId}`);
    const cash = lineByAccount(entry.lines, '1010');
    const revenue = lineByAccount(entry.lines, '4010');
    const cogs = lineByAccount(entry.lines, '5010');
    const inventory = lineByAccount(entry.lines, '1030');

    expect(lineAmount(cash.credit)).toBeCloseTo(netAmount, 2);
    expect(lineAmount(revenue.debit)).toBeCloseTo(netAmount, 2);
    expect(lineAmount(cogs.credit)).toBeCloseTo(totalCogs, 2);
    expect(lineAmount(inventory.debit)).toBeCloseTo(totalCogs, 2);

    const stockAfterVoid = await prisma.branchInventory.findFirst({
      where: {
        branchId: fixture.branch.id,
        ingredientId: fixture.ingredient.id,
      },
    });
    expect(stockAfterVoid?.stock).toBe((stockBeforeVoid?.stock ?? 0) + 20);

    const audit = await prisma.auditLog.findFirst({
      where: { action: 'VOID_ORDER', targetId: orderId },
    });
    expect(audit).not.toBeNull();
  }, 30000);

  it('refund reverses the sales journal and restores inventory', async () => {
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
        taxAmount: (100 * 0.07) / 1.07,
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

    const managerAgent = await loginAgent(fixture.managerEmail);
    await managerAgent
      .post(`/orders/${pastOrder.id}/refund`)
      .send({ reason: 'Quality issue' })
      .expect(201);

    await flushOutbox(app);

    const entry = await expectBalancedJournal(
      prisma,
      `REFUND-ORD-${pastOrder.id}`,
    );
    const cash = lineByAccount(entry.lines, '1010');
    const revenue = lineByAccount(entry.lines, '4010');
    const cogs = lineByAccount(entry.lines, '5010');
    const inventory = lineByAccount(entry.lines, '1030');

    expect(lineAmount(cash.credit)).toBeCloseTo(100, 2);
    expect(lineAmount(revenue.debit)).toBeCloseTo(100, 2);
    expect(lineAmount(cogs.credit)).toBeCloseTo(20, 2);
    expect(lineAmount(inventory.debit)).toBeCloseTo(20, 2);

    const stockAfter = await prisma.branchInventory.findFirst({
      where: {
        branchId: fixture.branch.id,
        ingredientId: fixture.ingredient.id,
      },
    });
    expect(stockAfter?.stock).toBe((stockBefore?.stock ?? 0) + 20);

    const audit = await prisma.auditLog.findFirst({
      where: { action: 'REFUND_ORDER', targetId: pastOrder.id },
    });
    expect(audit).not.toBeNull();
    expect(audit?.details).toContain('Quality issue');

    await prisma.orderItem.deleteMany({ where: { orderId: pastOrder.id } });
    await prisma.order.delete({ where: { id: pastOrder.id } });
    await prisma.journalEntryLine.deleteMany({
      where: {
        journalEntry: { reference: `REFUND-ORD-${pastOrder.id}` },
      },
    });
    await prisma.journalEntry.deleteMany({
      where: { reference: `REFUND-ORD-${pastOrder.id}` },
    });
    await prisma.auditLog.deleteMany({
      where: { targetId: pastOrder.id, action: 'REFUND_ORDER' },
    });
  }, 30000);
});
