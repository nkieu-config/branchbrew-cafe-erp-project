import { dateDaysAgo, dateMinutesAgo } from '../helpers';
import { seedHeroNarrative } from './hero-narrative';
import type { SeedContext } from '../types';

export async function seedOperationsDemo(ctx: SeedContext): Promise<void> {
  const {
    prisma,
    mainBranch,
    secondBranch,
    centralKitchen,
    admin,
    manager,
    staff,
    coffeeBeans,
    cup,
  } = ctx;

  console.log('Seeding ledger, payroll & audit demo...');

  await seedHeroNarrative(ctx);

  const accountIds = Object.fromEntries(
    (await prisma.account.findMany()).map((account) => [account.code, account.id]),
  );

  await prisma.journalEntry.create({
    data: {
      branchId: mainBranch.id,
      date: dateDaysAgo(1),
      reference: 'EXP-SEED-001',
      description: 'Branch supplies — napkins and stirrers',
      status: 'POSTED',
      lines: {
        create: [
          {
            accountId: accountIds['5050'],
            debit: 450,
            credit: 0,
            description: 'Operating supplies expense',
          },
          {
            accountId: accountIds['1010'],
            debit: 0,
            credit: 450,
            description: 'Cash payment',
          },
        ],
      },
    },
  });

  const previousPayrollMonth = new Date();
  previousPayrollMonth.setMonth(previousPayrollMonth.getMonth() - 1);

  await prisma.payrollRun.create({
    data: {
      month: previousPayrollMonth.getMonth() + 1,
      year: previousPayrollMonth.getFullYear(),
      status: 'APPROVED',
      branchId: mainBranch.id,
      payslips: {
        create: [
          {
            userId: staff.id,
            standardHours: 168,
            otHours: 6,
            basePay: 15000,
            otPay: 900,
            bonuses: 500,
            grossPay: 16400,
            taxDeduction: 820,
            socialSecurity: 750,
            otherDeductions: 0,
            netPay: 14830,
          },
          {
            userId: manager.id,
            standardHours: 176,
            otHours: 0,
            basePay: 28000,
            otPay: 0,
            bonuses: 2000,
            grossPay: 30000,
            taxDeduction: 1500,
            socialSecurity: 750,
            otherDeductions: 500,
            netPay: 27250,
          },
        ],
      },
    },
  });

  const demoPurchaseOrder = await prisma.purchaseOrder.findFirst({
    where: { poNumber: 'PO-DEMO-001' },
  });
  const pendingSettlement = await prisma.shiftSettlement.findFirst({
    where: { branchId: mainBranch.id, status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
  });

  const completedTransfer = await prisma.stockTransfer.create({
    data: {
      fromBranchId: centralKitchen.id,
      toBranchId: mainBranch.id,
      ingredientId: coffeeBeans.id,
      quantity: 2500,
      status: 'COMPLETED',
      requestedById: manager.id,
      approvedById: admin.id,
      createdAt: dateDaysAgo(4),
    },
  });

  await prisma.stockTransfer.create({
    data: {
      fromBranchId: mainBranch.id,
      toBranchId: secondBranch.id,
      ingredientId: coffeeBeans.id,
      quantity: 800,
      status: 'PENDING',
      requestedById: manager.id,
      createdAt: dateMinutesAgo(90),
    },
  });

  await prisma.wasteLog.create({
    data: {
      branchId: mainBranch.id,
      ingredientId: cup.id,
      quantity: 25,
      reason: 'Damaged stack from delivery — cups crushed',
      recordedById: manager.id,
      createdAt: dateDaysAgo(2),
    },
  });

  const auditRows: {
    userId: number;
    action: string;
    targetType: string;
    targetId?: number;
    details: string;
    daysAgo: number;
  }[] = [
    {
      userId: manager.id,
      action: 'CREATE_PO',
      targetType: 'PurchaseOrder',
      targetId: demoPurchaseOrder?.id,
      details: JSON.stringify({ poNumber: 'PO-DEMO-001', supplier: 'Global Coffee Beans Roaster' }),
      daysAgo: 5,
    },
    {
      userId: admin.id,
      action: 'APPROVE_PO',
      targetType: 'PurchaseOrder',
      targetId: demoPurchaseOrder?.id,
      details: JSON.stringify({ poNumber: 'PO-DEMO-001', status: 'APPROVED' }),
      daysAgo: 4,
    },
    {
      userId: manager.id,
      action: 'SETTLEMENT_SUBMITTED',
      targetType: 'ShiftSettlement',
      targetId: pendingSettlement?.id,
      details: JSON.stringify({ branch: 'Downtown', difference: -150 }),
      daysAgo: 0,
    },
    {
      userId: admin.id,
      action: 'SETTLEMENT_APPROVED',
      targetType: 'ShiftSettlement',
      details: JSON.stringify({ branch: 'Downtown', date: 'yesterday' }),
      daysAgo: 1,
    },
    {
      userId: admin.id,
      action: 'ACCEPT_TRANSFER',
      targetType: 'StockTransfer',
      targetId: completedTransfer.id,
      details: JSON.stringify({
        from: 'Central Kitchen',
        to: 'Downtown',
        ingredient: 'Espresso Beans',
        quantity: 2500,
      }),
      daysAgo: 3,
    },
    {
      userId: manager.id,
      action: 'ADD_BATCH',
      targetType: 'InventoryBatch',
      details: JSON.stringify({ ingredient: 'Whole Milk', quantity: 500, branch: 'Downtown' }),
      daysAgo: 6,
    },
    {
      userId: manager.id,
      action: 'WASTE_RECORDED',
      targetType: 'WasteLog',
      details: JSON.stringify({ ingredient: 'Paper Cup', quantity: 25, reason: 'Damaged delivery' }),
      daysAgo: 2,
    },
    {
      userId: admin.id,
      action: 'PAYROLL_APPROVED',
      targetType: 'PayrollRun',
      details: JSON.stringify({
        month: previousPayrollMonth.getMonth() + 1,
        year: previousPayrollMonth.getFullYear(),
        payslips: 2,
      }),
      daysAgo: 7,
    },
    {
      userId: manager.id,
      action: 'LEAVE_APPROVED',
      targetType: 'LeaveRequest',
      details: JSON.stringify({ type: 'SICK', employee: 'Downtown Manager' }),
      daysAgo: 3,
    },
  ];

  for (const row of auditRows) {
    await prisma.auditLog.create({
      data: {
        userId: row.userId,
        action: row.action,
        targetType: row.targetType,
        targetId: row.targetId,
        details: row.details,
        createdAt: dateDaysAgo(row.daysAgo),
      },
    });
  }
}
