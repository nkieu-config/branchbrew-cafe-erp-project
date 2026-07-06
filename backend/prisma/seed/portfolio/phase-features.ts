import { dateDaysAgo, dateMinutesAgo } from '../helpers';
import type { SeedContext } from '../types';

/**
 * Demo data for the newer feature phases: stocktake with variance posting,
 * supplier payments with AP aging, and in-app notifications.
 *
 * Ledger story: AP (2010) is credited by PO-DEMO-003 (450) and PO-DEMO-005
 * (400), then debited by the PAY-PO-DEMO-003 payment (450) — leaving exactly
 * the 400 outstanding that the AP aging card reports in the 31-60 day bucket.
 */
export async function seedPhaseFeaturesDemo(ctx: SeedContext): Promise<void> {
  const {
    prisma,
    mainBranch,
    secondBranch,
    manager,
    staff,
    supplier2,
    coffeeBeans,
    milk,
    cup,
    syrup,
    oatMilk,
    almondMilk,
    coldBrewBase,
  } = ctx;

  const accountIds = Object.fromEntries(
    (await prisma.account.findMany()).map((account) => [account.code, account.id]),
  );

  // ---------- Stocktake: approved month-end count with variances ----------
  const approvedCount = await prisma.stockCount.create({
    data: {
      branchId: mainBranch.id,
      status: 'APPROVED',
      isBlind: true,
      notes: 'Month-end full count',
      createdByUserId: staff.id,
      approvedByUserId: manager.id,
      submittedAt: dateDaysAgo(5, 19, 0),
      approvedAt: dateDaysAgo(5, 19, 0),
      createdAt: dateDaysAgo(5, 19, 0),
      lines: {
        create: [
          { ingredientId: coffeeBeans.id, expectedQty: 5000, countedQty: 5000 },
          { ingredientId: milk.id, expectedQty: 10400, countedQty: 10000 },
          { ingredientId: cup.id, expectedQty: 510, countedQty: 500 },
          { ingredientId: syrup.id, expectedQty: 995, countedQty: 1000 },
          { ingredientId: oatMilk.id, expectedQty: 3000, countedQty: 3000 },
          { ingredientId: almondMilk.id, expectedQty: 2000, countedQty: 2000 },
          { ingredientId: coldBrewBase.id, expectedQty: 400, countedQty: 400 },
        ],
      },
    },
  });

  await prisma.stockAdjustment.createMany({
    data: [
      {
        branchId: mainBranch.id,
        ingredientId: milk.id,
        quantityDelta: -400,
        reason: 'COUNT_VARIANCE',
        stockCountId: approvedCount.id,
        createdByUserId: manager.id,
        createdAt: dateDaysAgo(5, 19, 0),
      },
      {
        branchId: mainBranch.id,
        ingredientId: cup.id,
        quantityDelta: -10,
        reason: 'COUNT_VARIANCE',
        stockCountId: approvedCount.id,
        createdByUserId: manager.id,
        createdAt: dateDaysAgo(5, 19, 0),
      },
      {
        branchId: mainBranch.id,
        ingredientId: syrup.id,
        quantityDelta: 5,
        reason: 'COUNT_VARIANCE',
        stockCountId: approvedCount.id,
        createdByUserId: manager.id,
        createdAt: dateDaysAgo(5, 19, 0),
      },
    ],
  });

  // Net variance: milk -400×0.05 (-20) + cups -10×3.5 (-35) + syrup +5×0.2 (+1) = -54
  await prisma.journalEntry.create({
    data: {
      branchId: mainBranch.id,
      date: dateDaysAgo(5, 19, 0),
      reference: `STOCKCOUNT-${approvedCount.id}`,
      description: `Stock count #${approvedCount.id} variance`,
      status: 'POSTED',
      lines: {
        create: [
          {
            accountId: accountIds['5040'],
            debit: 54,
            credit: 0,
            description: 'Inventory shrinkage (count shortage)',
          },
          {
            accountId: accountIds['1030'],
            debit: 0,
            credit: 54,
            description: 'Inventory written down',
          },
        ],
      },
    },
  });

  // Open draft count the reviewer can finish and submit live
  await prisma.stockCount.create({
    data: {
      branchId: mainBranch.id,
      status: 'DRAFT',
      isBlind: false,
      notes: 'Weekly spot check — bar area',
      createdByUserId: staff.id,
      createdAt: dateMinutesAgo(40),
      lines: {
        create: [
          { ingredientId: coffeeBeans.id, countedQty: 5000 },
          { ingredientId: milk.id, countedQty: 10000 },
          { ingredientId: cup.id },
          { ingredientId: syrup.id },
          { ingredientId: oatMilk.id },
          { ingredientId: almondMilk.id },
          { ingredientId: coldBrewBase.id },
        ],
      },
    },
  });

  const damagedOatMilk = await prisma.stockAdjustment.create({
    data: {
      branchId: mainBranch.id,
      ingredientId: oatMilk.id,
      quantityDelta: -50,
      reason: 'DAMAGE',
      notes: 'Carton damaged in cold room',
      createdByUserId: manager.id,
      createdAt: dateDaysAgo(2, 15, 30),
    },
  });

  await prisma.journalEntry.create({
    data: {
      branchId: mainBranch.id,
      date: dateDaysAgo(2, 15, 30),
      reference: `ADJ-${damagedOatMilk.id}`,
      description: `Manual stock adjustment #${damagedOatMilk.id} (DAMAGE)`,
      status: 'POSTED',
      lines: {
        create: [
          {
            accountId: accountIds['5040'],
            debit: 4,
            credit: 0,
            description: 'Inventory shrinkage (count shortage)',
          },
          {
            accountId: accountIds['1030'],
            debit: 0,
            credit: 4,
            description: 'Inventory written down',
          },
        ],
      },
    },
  });

  // ---------- Supplier payment: settle the hero PO ----------
  const heroPO = await prisma.purchaseOrder.findFirst({
    where: { poNumber: 'PO-DEMO-003' },
  });

  if (heroPO) {
    await prisma.purchaseOrder.update({
      where: { id: heroPO.id },
      data: { paymentStatus: 'PAID', paidAt: dateDaysAgo(2, 15, 30) },
    });
    await prisma.supplierPayment.create({
      data: {
        poId: heroPO.id,
        supplierId: heroPO.supplierId,
        branchId: heroPO.branchId,
        amount: 450,
        method: 'BANK_TRANSFER',
        notes: 'Transfer ref. TRX-2026-0117',
        paidByUserId: manager.id,
        createdAt: dateDaysAgo(2, 15, 30),
      },
    });
    await prisma.journalEntry.create({
      data: {
        branchId: heroPO.branchId,
        date: dateDaysAgo(2, 15, 30),
        reference: 'PAY-PO-DEMO-003',
        description: 'Supplier payment for PO PO-DEMO-003 (bank transfer)',
        status: 'POSTED',
        lines: {
          create: [
            {
              accountId: accountIds['2010'],
              debit: 450,
              credit: 0,
              description: 'Accounts Payable settled',
            },
            {
              accountId: accountIds['1010'],
              debit: 0,
              credit: 450,
              description: 'Paid by bank transfer',
            },
          ],
        },
      },
    });
  }

  // Aged unpaid PO so the AP aging card has a 31-60 day bucket
  const agedPO = await prisma.purchaseOrder.create({
    data: {
      poNumber: 'PO-DEMO-005',
      branchId: mainBranch.id,
      supplierId: supplier2.id,
      status: 'RECEIVED',
      createdAt: dateDaysAgo(40),
      items: {
        create: [{ ingredientId: milk.id, quantityRequested: 8000, unitPrice: 0.05 }],
      },
    },
  });
  await prisma.$executeRaw`
    UPDATE "PurchaseOrder"
    SET "updatedAt" = ${dateDaysAgo(40)}
    WHERE id = ${agedPO.id}
  `;

  await prisma.journalEntry.create({
    data: {
      branchId: mainBranch.id,
      date: dateDaysAgo(40),
      reference: 'PO-DEMO-005',
      description: 'Accounts Payable for PO PO-DEMO-005 — Whole Milk',
      status: 'POSTED',
      lines: {
        create: [
          {
            accountId: accountIds['1030'],
            debit: 400,
            credit: 0,
            description: 'Inventory received — Whole Milk',
          },
          {
            accountId: accountIds['2010'],
            debit: 0,
            credit: 400,
            description: 'Accounts Payable recognized',
          },
        ],
      },
    },
  });

  // ---------- Notifications: unread mixed with handled ----------
  const pendingPO = await prisma.purchaseOrder.findFirst({
    where: { poNumber: 'PO-DEMO-002' },
  });
  const posTerminal = await prisma.equipment.findFirst({
    where: { name: { contains: 'POS Terminal' } },
  });

  await prisma.notification.createMany({
    data: [
      {
        type: 'LOW_STOCK',
        title: 'Paper Cup is running low',
        body: '80 pcs left (min 100)',
        link: '/inventory',
        branchId: secondBranch.id,
        minRole: 'MANAGER',
        dedupeKey: `low-stock-${cup.id}`,
        createdAt: dateMinutesAgo(120),
      },
      {
        type: 'PO_PENDING_APPROVAL',
        title: 'PO PO-DEMO-002 awaiting approval',
        link: '/procurement/orders?status=PENDING',
        branchId: pendingPO?.branchId ?? mainBranch.id,
        minRole: 'MANAGER',
        dedupeKey: pendingPO ? `po-${pendingPO.id}` : 'po-demo-002',
        createdAt: dateDaysAgo(1),
      },
      {
        type: 'BATCH_EXPIRING',
        title: '2 batches expiring within 7 days',
        link: '/inventory/batches',
        branchId: mainBranch.id,
        minRole: 'MANAGER',
        dedupeKey: 'expiring-batches',
        createdAt: dateMinutesAgo(300),
      },
      {
        type: 'LEAVE_DECIDED',
        title: 'Your sick leave was approved',
        link: '/hr/leave',
        userId: staff.id,
        branchId: mainBranch.id,
        readAt: dateDaysAgo(1),
        createdAt: dateDaysAgo(2, 15, 30),
      },
      {
        type: 'MAINTENANCE_DUE',
        title: 'Front Counter POS Terminal is due for maintenance',
        link: '/assets',
        branchId: mainBranch.id,
        minRole: 'MANAGER',
        dedupeKey: posTerminal ? `equipment-${posTerminal.id}` : 'equipment-pos',
        readAt: dateDaysAgo(3),
        createdAt: dateDaysAgo(4),
      },
    ],
  });

  // ---------- Audit trail for the new flows ----------
  await prisma.auditLog.createMany({
    data: [
      {
        userId: staff.id,
        action: 'CREATE_STOCK_COUNT',
        targetType: 'StockCount',
        targetId: approvedCount.id,
        details: JSON.stringify({ branchId: mainBranch.id, isBlind: true, lineCount: 7 }),
        createdAt: dateDaysAgo(5, 19, 0),
      },
      {
        userId: manager.id,
        action: 'APPROVE_STOCK_COUNT',
        targetType: 'StockCount',
        targetId: approvedCount.id,
        details: JSON.stringify({ branchId: mainBranch.id, adjustedLines: 3, netVarianceValue: -54 }),
        createdAt: dateDaysAgo(5, 19, 0),
      },
      {
        userId: manager.id,
        action: 'MANUAL_ADJUSTMENT',
        targetType: 'StockAdjustment',
        targetId: damagedOatMilk.id,
        details: JSON.stringify({
          branchId: mainBranch.id,
          ingredientId: oatMilk.id,
          quantityDelta: -50,
          reason: 'DAMAGE',
        }),
        createdAt: dateDaysAgo(2, 15, 30),
      },
      ...(heroPO
        ? [
            {
              userId: manager.id,
              action: 'PAY_PO',
              targetType: 'PurchaseOrder',
              targetId: heroPO.id,
              details: JSON.stringify({
                poNumber: 'PO-DEMO-003',
                amount: 450,
                method: 'BANK_TRANSFER',
              }),
              createdAt: dateDaysAgo(2, 15, 30),
            },
          ]
        : []),
    ],
  });
}
