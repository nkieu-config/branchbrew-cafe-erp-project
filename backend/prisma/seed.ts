import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import {
  getQueueBusinessDateString,
  parseQueueBusinessDate,
} from '../src/orders/helpers/queue-number.helper';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function dateDaysAgo(days: number): Date {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date;
}

function settlementDifference(
  expected: { cash: number; card: number; qr: number },
  actual: { cash: number; card: number; qr: number },
): number {
  const totalExpected = expected.cash + expected.card + expected.qr;
  const totalActual = actual.cash + actual.card + actual.qr;
  return Math.round((totalActual - totalExpected) * 100) / 100;
}

async function main() {
  console.log('Cleaning existing data...');
  await prisma.orderItemModifier.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.shiftSettlement.deleteMany();
  await prisma.wasteLog.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.shift.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.stockTransfer.deleteMany();
  await prisma.productionOrder.deleteMany();
  await prisma.productionBOM.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.recipeItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.inventoryBatch.deleteMany();
  await prisma.branchInventory.deleteMany();
  await prisma.journalEntryLine.deleteMany();
  await prisma.journalEntry.deleteMany();
  await prisma.account.deleteMany();
  await prisma.outboxEvent.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.modifierOption.deleteMany();
  await prisma.modifierGroup.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.systemSetting.deleteMany();
  await prisma.payslip.deleteMany();
  await prisma.payrollRun.deleteMany();
  await prisma.maintenanceLog.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.user.deleteMany();
  await prisma.branch.deleteMany();

  console.log('Seeding database with demo cafe data...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  const mainBranch = await prisma.branch.create({
    data: { name: 'Siam Paragon Branch', location: 'Bangkok' },
  });
  const secondBranch = await prisma.branch.create({
    data: { name: 'Asok Branch', location: 'Bangkok' },
  });
  const centralKitchen = await prisma.branch.create({
    data: {
      name: 'BranchBrew Central Kitchen',
      location: 'Bangkok',
      isCentralKitchen: true,
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@branchbrew.dev',
      name: 'Super Admin',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: 'manager@branchbrew.dev',
      name: 'Siam Manager',
      password: hashedPassword,
      role: 'MANAGER',
      branchId: mainBranch.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'staff.siam@branchbrew.dev',
      name: 'Siam Cashier',
      password: hashedPassword,
      role: 'STAFF',
      branchId: mainBranch.id,
    },
  });

  const supplier1 = await prisma.supplier.create({
    data: { name: 'Global Coffee Beans Roaster', contactEmail: 'sales@gcr.com', phone: '0812345678' },
  });
  const supplier2 = await prisma.supplier.create({
    data: { name: 'Thai Dairy Farm', contactEmail: 'order@thaidairy.com', phone: '0898765432' },
  });

  const coffeeBeans = await prisma.ingredient.create({
    data: { name: 'Espresso Beans', unit: 'g', costPerUnit: 0.5, primarySupplierId: supplier1.id },
  });
  const milk = await prisma.ingredient.create({
    data: { name: 'Whole Milk', unit: 'ml', costPerUnit: 0.05, primarySupplierId: supplier2.id },
  });
  const cup = await prisma.ingredient.create({
    data: { name: 'Paper Cup', unit: 'pcs', costPerUnit: 3.5, primarySupplierId: supplier1.id },
  });
  const syrup = await prisma.ingredient.create({
    data: { name: 'Vanilla Syrup', unit: 'ml', costPerUnit: 0.2, primarySupplierId: supplier1.id },
  });
  const oatMilk = await prisma.ingredient.create({
    data: { name: 'Oat Milk', unit: 'ml', costPerUnit: 0.08, primarySupplierId: supplier2.id },
  });
  const almondMilk = await prisma.ingredient.create({
    data: { name: 'Almond Milk', unit: 'ml', costPerUnit: 0.09, primarySupplierId: supplier2.id },
  });
  const coldBrewBase = await prisma.ingredient.create({
    data: {
      name: 'House Cold Brew Base',
      unit: 'ml',
      costPerUnit: 0.12,
      primarySupplierId: supplier1.id,
    },
  });

  const inventoryRows = [
    { branchId: mainBranch.id, ingredientId: coffeeBeans.id, stock: 5000, minStock: 1000 },
    { branchId: mainBranch.id, ingredientId: milk.id, stock: 10000, minStock: 2000 },
    { branchId: mainBranch.id, ingredientId: cup.id, stock: 500, minStock: 100 },
    { branchId: mainBranch.id, ingredientId: syrup.id, stock: 1000, minStock: 200 },
    { branchId: mainBranch.id, ingredientId: oatMilk.id, stock: 3000, minStock: 500 },
    { branchId: mainBranch.id, ingredientId: almondMilk.id, stock: 2000, minStock: 500 },
    { branchId: secondBranch.id, ingredientId: coffeeBeans.id, stock: 2000, minStock: 1000 },
    { branchId: secondBranch.id, ingredientId: milk.id, stock: 3000, minStock: 2000 },
    { branchId: secondBranch.id, ingredientId: cup.id, stock: 150, minStock: 100 },
    { branchId: secondBranch.id, ingredientId: syrup.id, stock: 500, minStock: 200 },
    { branchId: secondBranch.id, ingredientId: oatMilk.id, stock: 800, minStock: 500 },
    { branchId: secondBranch.id, ingredientId: almondMilk.id, stock: 600, minStock: 500 },
    { branchId: centralKitchen.id, ingredientId: coffeeBeans.id, stock: 20000, minStock: 5000 },
    { branchId: centralKitchen.id, ingredientId: coldBrewBase.id, stock: 2000, minStock: 500 },
    { branchId: mainBranch.id, ingredientId: coldBrewBase.id, stock: 400, minStock: 200 },
  ];
  await prisma.branchInventory.createMany({ data: inventoryRows });
  const futureExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await prisma.inventoryBatch.createMany({
    data: inventoryRows.map((row) => ({
      branchId: row.branchId,
      ingredientId: row.ingredientId,
      quantity: row.stock,
      status: 'ACTIVE' as const,
      expiryDate: futureExpiry,
    })),
  });

  // Demo batch past expiry — auto-waste cron will dispose on next hourly run
  await prisma.inventoryBatch.create({
    data: {
      branchId: mainBranch.id,
      ingredientId: oatMilk.id,
      quantity: 250,
      status: 'ACTIVE',
      expiryDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.productionBOM.create({
    data: {
      targetIngredientId: coldBrewBase.id,
      rawIngredientId: coffeeBeans.id,
      quantityNeeded: 0.5,
    },
  });

  const plannedDate = new Date();
  plannedDate.setDate(plannedDate.getDate() + 1);
  await prisma.productionOrder.createMany({
    data: [
      {
        orderNumber: 'PRD-DEMO-001',
        branchId: centralKitchen.id,
        targetIngredientId: coldBrewBase.id,
        quantityToProduce: 1000,
        status: 'PLANNED',
        plannedStartDate: plannedDate,
      },
      {
        orderNumber: 'PRD-DEMO-002',
        branchId: centralKitchen.id,
        targetIngredientId: coldBrewBase.id,
        quantityToProduce: 500,
        status: 'IN_PROGRESS',
      },
    ],
  });

  const tempGroup = await prisma.modifierGroup.create({
    data: {
      name: 'Temperature',
      category: 'Coffee',
      sortOrder: 1,
      options: {
        create: [
          { name: 'Hot', priceDelta: 0, isDefault: false, sortOrder: 1 },
          { name: 'Iced', priceDelta: 0, isDefault: true, sortOrder: 2 },
          { name: 'Frappe', priceDelta: 10, isDefault: false, sortOrder: 3 },
        ],
      },
    },
    include: { options: true },
  });

  await prisma.modifierGroup.create({
    data: {
      name: 'Sweetness',
      category: 'Coffee',
      sortOrder: 2,
      options: {
        create: [
          { name: '0%', priceDelta: 0, sortOrder: 1 },
          { name: '50%', priceDelta: 0, sortOrder: 2 },
          { name: '100%', priceDelta: 0, isDefault: true, sortOrder: 3 },
          { name: '150%', priceDelta: 5, sortOrder: 4 },
        ],
      },
    },
  });

  await prisma.modifierGroup.create({
    data: {
      name: 'Milk Type',
      category: 'Coffee',
      sortOrder: 3,
      swapIngredientId: milk.id,
      options: {
        create: [
          { name: 'Normal', priceDelta: 0, isDefault: true, sortOrder: 1 },
          { name: 'Oat', priceDelta: 15, sortOrder: 2, swapToIngredientId: oatMilk.id },
          { name: 'Almond', priceDelta: 15, sortOrder: 3, swapToIngredientId: almondMilk.id },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: 'Espresso',
      price: 60,
      category: 'Coffee',
      recipeItems: {
        create: [
          { ingredientId: coffeeBeans.id, quantity: 18 },
          { ingredientId: cup.id, quantity: 1 },
        ],
      },
    },
  });

  const icedLatte = await prisma.product.create({
    data: {
      name: 'Iced Latte',
      price: 85,
      category: 'Coffee',
      recipeItems: {
        create: [
          { ingredientId: coffeeBeans.id, quantity: 18 },
          { ingredientId: milk.id, quantity: 150 },
          { ingredientId: cup.id, quantity: 1 },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: 'Croissant',
      price: 45,
      category: 'Bakery',
      recipeItems: { create: [] },
    },
  });

  await prisma.product.create({
    data: {
      name: 'Cappuccino',
      price: 52,
      category: 'Coffee',
      recipeItems: {
        create: [
          { ingredientId: coffeeBeans.id, quantity: 18 },
          { ingredientId: milk.id, quantity: 120 },
          { ingredientId: cup.id, quantity: 1 },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: 'Vanilla Latte',
      price: 65,
      category: 'Coffee',
      recipeItems: {
        create: [
          { ingredientId: coffeeBeans.id, quantity: 18 },
          { ingredientId: milk.id, quantity: 150 },
          { ingredientId: cup.id, quantity: 1 },
          { ingredientId: syrup.id, quantity: 50 },
        ],
      },
    },
  });

  const customer = await prisma.customer.create({
    data: { phone: '0811111111', name: 'Demo Member', points: 120, tier: 'SILVER' },
  });

  await prisma.customer.createMany({
    data: [
      { phone: '0822222222', name: 'Gold Member', points: 450, tier: 'GOLD' },
      { phone: '0833333333', name: 'Walk-in Regular', points: 0, tier: 'REGULAR' },
    ],
  });

  await prisma.promotion.create({
    data: {
      code: 'WELCOME10',
      description: '10% off for demo',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minPurchase: 100,
      isActive: true,
    },
  });

  await prisma.systemSetting.createMany({
    data: [
      { key: 'company_name', value: 'BranchBrew Demo' },
      { key: 'tax_id', value: '0105560000000' },
      { key: 'vat_rate', value: '7' },
      { key: 'currency', value: 'THB' },
      { key: 'receipt_footer', value: 'Thank you for visiting BranchBrew!' },
    ],
  });

  const defaultAccounts = [
    { code: '1010', name: 'Cash', type: 'ASSET' as const },
    { code: '1020', name: 'Accounts Receivable', type: 'ASSET' as const },
    { code: '1030', name: 'Inventory', type: 'ASSET' as const },
    { code: '1040', name: 'Card Clearing', type: 'ASSET' as const },
    { code: '1050', name: 'PromptPay Clearing', type: 'ASSET' as const },
    { code: '2010', name: 'Accounts Payable', type: 'LIABILITY' as const },
    { code: '3010', name: 'Owner Equity', type: 'EQUITY' as const },
    { code: '4010', name: 'Sales Revenue', type: 'REVENUE' as const },
    { code: '5010', name: 'Cost of Goods Sold (COGS)', type: 'EXPENSE' as const },
    { code: '5020', name: 'Payroll Expense', type: 'EXPENSE' as const },
  ];
  for (const acct of defaultAccounts) {
    await prisma.account.create({ data: acct });
  }

  // Sample orders for dashboard sales trends (last 7 days)
  const icedOption = tempGroup.options.find((o) => o.name === 'Iced')!;
  for (let daysAgo = 6; daysAgo >= 0; daysAgo--) {
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);
    createdAt.setHours(12, 0, 0, 0);
    const qty = 5 + (6 - daysAgo);
    const unitPrice = 85;
    const net = unitPrice * qty;

    await prisma.order.create({
      data: {
        userId: admin.id,
        branchId: mainBranch.id,
        customerId: daysAgo % 2 === 0 ? customer.id : undefined,
        status: 'COMPLETED',
        paymentMethod: daysAgo % 3 === 0 ? 'CREDIT_CARD' : 'CASH',
        totalAmount: net,
        netAmount: net,
        discountAmount: 0,
        taxAmount: net * 0.07 / 1.07,
        totalCogs: 18 * 0.5 * qty + 150 * 0.05 * qty + 3.5 * qty,
        pointsEarned: Math.floor(net / 100),
        queueNumber: 100 + (6 - daysAgo),
        queueDate: parseQueueBusinessDate(getQueueBusinessDateString(createdAt)),
        createdAt,
        items: {
          create: [
            {
              productId: icedLatte.id,
              quantity: qty,
              price: unitPrice,
              notes: 'Temperature: Iced, Sweetness: 100%, Milk Type: Normal',
              modifiers: {
                create: [
                  {
                    optionId: icedOption.id,
                    optionName: 'Temperature: Iced',
                    priceDelta: 0,
                  },
                ],
              },
            },
          ],
        },
      },
    });
  }

  // Live KDS demo order (today's queue #1)
  await prisma.order.create({
    data: {
      userId: admin.id,
      branchId: mainBranch.id,
      status: 'PENDING',
      paymentMethod: 'CASH',
      totalAmount: 95,
      netAmount: 95,
      discountAmount: 0,
      taxAmount: 95 * 0.07 / 1.07,
      totalCogs: 18 * 0.5 + 150 * 0.05 + 3.5,
      queueNumber: 1,
      queueDate: parseQueueBusinessDate(getQueueBusinessDateString()),
      items: {
        create: [
          {
            productId: icedLatte.id,
            quantity: 1,
            price: 95,
            notes: 'Temperature: Hot, Sweetness: 100%, Milk Type: Oat',
          },
        ],
      },
    },
  });

  // One pending PO for demo receive flow
  await prisma.purchaseOrder.create({
    data: {
      poNumber: 'PO-DEMO-001',
      branchId: mainBranch.id,
      supplierId: supplier1.id,
      status: 'APPROVED',
      items: {
        create: [{ ingredientId: coffeeBeans.id, quantityRequested: 1000, unitPrice: 0.45 }],
      },
    },
  });

  // Portfolio Phase 1 — finance overview + CRM list depth
  console.log('Seeding portfolio demo data (Phase 1)...');

  const settlementYesterday = {
    cash: { expected: 11800, actual: 11800 },
    card: { expected: 4200, actual: 4200 },
    qr: { expected: 2100, actual: 2100 },
  };
  await prisma.shiftSettlement.create({
    data: {
      branchId: mainBranch.id,
      date: dateDaysAgo(1),
      expectedCash: settlementYesterday.cash.expected,
      actualCash: settlementYesterday.cash.actual,
      expectedCreditCard: settlementYesterday.card.expected,
      actualCreditCard: settlementYesterday.card.actual,
      expectedQR: settlementYesterday.qr.expected,
      actualQR: settlementYesterday.qr.actual,
      difference: settlementDifference(
        {
          cash: settlementYesterday.cash.expected,
          card: settlementYesterday.card.expected,
          qr: settlementYesterday.qr.expected,
        },
        {
          cash: settlementYesterday.cash.actual,
          card: settlementYesterday.card.actual,
          qr: settlementYesterday.qr.actual,
        },
      ),
      status: 'APPROVED',
      submittedById: manager.id,
    },
  });

  const settlementToday = {
    cash: { expected: 8650, actual: 8500 },
    card: { expected: 3200, actual: 3200 },
    qr: { expected: 1450, actual: 1450 },
  };
  await prisma.shiftSettlement.create({
    data: {
      branchId: mainBranch.id,
      date: dateDaysAgo(0),
      expectedCash: settlementToday.cash.expected,
      actualCash: settlementToday.cash.actual,
      expectedCreditCard: settlementToday.card.expected,
      actualCreditCard: settlementToday.card.actual,
      expectedQR: settlementToday.qr.expected,
      actualQR: settlementToday.qr.actual,
      difference: settlementDifference(
        {
          cash: settlementToday.cash.expected,
          card: settlementToday.card.expected,
          qr: settlementToday.qr.expected,
        },
        {
          cash: settlementToday.cash.actual,
          card: settlementToday.card.actual,
          qr: settlementToday.qr.actual,
        },
      ),
      status: 'PENDING',
      submittedById: manager.id,
    },
  });

  const settlementAsokRejected = {
    cash: { expected: 5400, actual: 5100 },
    card: { expected: 1800, actual: 1800 },
    qr: { expected: 900, actual: 750 },
  };
  await prisma.shiftSettlement.create({
    data: {
      branchId: secondBranch.id,
      date: dateDaysAgo(3),
      expectedCash: settlementAsokRejected.cash.expected,
      actualCash: settlementAsokRejected.cash.actual,
      expectedCreditCard: settlementAsokRejected.card.expected,
      actualCreditCard: settlementAsokRejected.card.actual,
      expectedQR: settlementAsokRejected.qr.expected,
      actualQR: settlementAsokRejected.qr.actual,
      difference: settlementDifference(
        {
          cash: settlementAsokRejected.cash.expected,
          card: settlementAsokRejected.card.expected,
          qr: settlementAsokRejected.qr.expected,
        },
        {
          cash: settlementAsokRejected.cash.actual,
          card: settlementAsokRejected.card.actual,
          qr: settlementAsokRejected.qr.actual,
        },
      ),
      status: 'REJECTED',
      submittedById: manager.id,
    },
  });

  const expenseRows = [
    { daysAgo: 1, branchId: mainBranch.id, amount: 450, category: 'Supplies', description: 'Napkins and stirrers' },
    { daysAgo: 2, branchId: mainBranch.id, amount: 1200, category: 'Utilities', description: 'Electricity top-up' },
    { daysAgo: 4, branchId: secondBranch.id, amount: 320, category: 'Cleaning', description: 'Floor detergent' },
    { daysAgo: 5, branchId: mainBranch.id, amount: 800, category: 'Marketing', description: 'Weekend flyer printing' },
    { daysAgo: 6, branchId: mainBranch.id, amount: 150, category: 'Misc', description: 'Courier for spare parts' },
  ];
  for (const row of expenseRows) {
    await prisma.expense.create({
      data: {
        branchId: row.branchId,
        amount: row.amount,
        category: row.category,
        description: row.description,
        recordedById: manager.id,
        createdAt: dateDaysAgo(row.daysAgo),
      },
    });
  }

  console.log('Seeding completed!');
  console.log('Demo logins: admin@branchbrew.dev / manager@branchbrew.dev / staff.siam@branchbrew.dev');
  console.log('Password: password123');
  console.log('Promo code: WELCOME10 | Member phones: 0811111111, 0822222222, 0833333333');
  console.log('Portfolio: manager → /finance/overview (1 pending settlement) | /crm/customers (3 members)');
  console.log('Central Kitchen: select "BranchBrew Central Kitchen" branch → /kitchen');
  console.log('Auto-waste demo: 250ml Oat Milk batch at Siam is past expiry (hourly cron)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
