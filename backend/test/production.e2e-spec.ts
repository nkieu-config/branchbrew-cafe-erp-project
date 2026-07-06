import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../src/prisma/prisma.service';
import { createE2eApp } from './e2e-app.util';
import { E2E_PASSWORD } from './e2e-fixtures.util';

const describeIfDatabase = process.env.DATABASE_URL ? describe : describe.skip;

describeIfDatabase('Central kitchen production flow (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const email = 'production-admin@e2e.test';
  let kitchenBranchId: number;
  let rawIngredientId: number;
  let finishedIngredientId: number;

  beforeAll(async () => {
    app = await createE2eApp();
    prisma = app.get(PrismaService);

    const kitchenBranch = await prisma.branch.create({
      data: {
        name: 'E2E Central Kitchen',
        location: 'Metro City',
        isCentralKitchen: true,
      },
    });
    kitchenBranchId = kitchenBranch.id;

    const raw = await prisma.ingredient.create({
      data: { name: 'E2E Production Beans', unit: 'g', costPerUnit: 0.5 },
    });
    const finished = await prisma.ingredient.create({
      data: { name: 'E2E Cold Brew Base', unit: 'ml', costPerUnit: 0.12 },
    });
    rawIngredientId = raw.id;
    finishedIngredientId = finished.id;

    await prisma.productionBOM.create({
      data: {
        targetIngredientId: finished.id,
        rawIngredientId: raw.id,
        quantityNeeded: 0.5,
      },
    });

    await prisma.branchInventory.create({
      data: {
        branchId: kitchenBranchId,
        ingredientId: raw.id,
        stock: 5000,
        minStock: 500,
      },
    });
    await prisma.inventoryBatch.create({
      data: {
        branchId: kitchenBranchId,
        ingredientId: raw.id,
        quantity: 5000,
        status: 'ACTIVE',
      },
    });

    await prisma.user.create({
      data: {
        email,
        name: 'Production Admin',
        password: await bcrypt.hash(E2E_PASSWORD, 10),
        role: 'SUPER_ADMIN',
      },
    });
  });

  afterAll(async () => {
    await prisma.productionOrder.deleteMany({
      where: {
        OR: [
          { branch: { name: 'E2E Central Kitchen' } },
          {
            targetIngredient: {
              name: { in: ['E2E Production Beans', 'E2E Cold Brew Base'] },
            },
          },
        ],
      },
    });
    await prisma.productionBOM.deleteMany({
      where: {
        OR: [
          {
            targetIngredient: {
              name: { in: ['E2E Production Beans', 'E2E Cold Brew Base'] },
            },
          },
          {
            rawIngredient: {
              name: { in: ['E2E Production Beans', 'E2E Cold Brew Base'] },
            },
          },
        ],
      },
    });
    await prisma.inventoryBatch.deleteMany({
      where: {
        OR: [
          { branch: { name: 'E2E Central Kitchen' } },
          {
            ingredient: {
              name: { in: ['E2E Production Beans', 'E2E Cold Brew Base'] },
            },
          },
        ],
      },
    });
    await prisma.branchInventory.deleteMany({
      where: {
        OR: [
          { branch: { name: 'E2E Central Kitchen' } },
          {
            ingredient: {
              name: { in: ['E2E Production Beans', 'E2E Cold Brew Base'] },
            },
          },
        ],
      },
    });
    await prisma.ingredient.deleteMany({
      where: { name: { in: ['E2E Production Beans', 'E2E Cold Brew Base'] } },
    });
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await prisma.auditLog.deleteMany({ where: { userId: user.id } });
    }
    await prisma.user.deleteMany({ where: { email } });
    await prisma.branch.deleteMany({
      where: { name: 'E2E Central Kitchen' },
    });
    await app?.close();
  });

  it('creates and completes a production order with inventory changes', async () => {
    const agent = request.agent(app.getHttpServer());

    await agent
      .post('/auth/login')
      .send({ email, password: E2E_PASSWORD })
      .expect(200);

    const createRes = await agent
      .post('/production/orders')
      .send({
        branchId: kitchenBranchId,
        targetIngredientId: finishedIngredientId,
        quantityToProduce: 100,
      })
      .expect(201);

    const orderId = createRes.body.id;

    await agent.patch(`/production/orders/${orderId}/complete`).expect(200);

    const rawInv = await prisma.branchInventory.findUnique({
      where: {
        branchId_ingredientId: {
          branchId: kitchenBranchId,
          ingredientId: rawIngredientId,
        },
      },
    });
    const finishedInv = await prisma.branchInventory.findUnique({
      where: {
        branchId_ingredientId: {
          branchId: kitchenBranchId,
          ingredientId: finishedIngredientId,
        },
      },
    });

    expect(rawInv?.stock).toBe(4950);
    expect(finishedInv?.stock).toBe(100);

    const rawBatches = await prisma.inventoryBatch.findMany({
      where: { branchId: kitchenBranchId, ingredientId: rawIngredientId },
    });
    expect(rawBatches.reduce((sum, b) => sum + b.quantity, 0)).toBe(4950);

    const finishedBatches = await prisma.inventoryBatch.findMany({
      where: {
        branchId: kitchenBranchId,
        ingredientId: finishedIngredientId,
        status: 'ACTIVE',
      },
    });
    expect(finishedBatches).toHaveLength(1);
    expect(finishedBatches[0].quantity).toBe(100);

    const order = await prisma.productionOrder.findUnique({
      where: { id: orderId },
    });
    expect(order?.status).toBe('COMPLETED');
  });
});
