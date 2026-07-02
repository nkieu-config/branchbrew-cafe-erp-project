import {
  getQueueBusinessDateString,
  parseQueueBusinessDate,
} from '../../../src/orders/helpers/queue-number.helper';
import { dateDaysAgo } from '../helpers';
import type { SeedContext } from '../types';
import type { Order, PurchaseOrder } from '@prisma/client';

const HERO_PO_NUMBER = 'PO-DEMO-003';
const HERO_PO_QTY = 1000;
const HERO_PO_UNIT_PRICE = 0.45;
const HERO_ORDER_QTY = 2;
const HERO_ORDER_UNIT_PRICE = 85;

function heroOrderCogsPerUnit(): number {
  // Matches Iced Latte recipe in core seed: beans + milk + cup
  return 18 * 0.5 + 150 * 0.05 + 3.5;
}

export type HeroNarrativeSeed = {
  heroPurchaseOrder: PurchaseOrder;
  heroOrder: Order;
};

/**
 * Connected demo story for interviews: espresso beans received on a PO,
 * sold through a POS order, with ledger entries that share the same references
 * as production (`PO-DEMO-003` and `ORD-{orderId}`).
 */
export async function seedHeroNarrative(ctx: SeedContext): Promise<HeroNarrativeSeed> {
  const {
    prisma,
    mainBranch,
    manager,
    staff,
    supplier1,
    coffeeBeans,
    icedLatte,
  } = ctx;

  console.log('Seeding hero narrative (PO receive → POS sale → ledger)...');

  const accountIds = Object.fromEntries(
    (await prisma.account.findMany()).map((account) => [account.code, account.id]),
  );

  const poTotal = HERO_PO_QTY * HERO_PO_UNIT_PRICE;
  const heroPurchaseOrder = await prisma.purchaseOrder.create({
    data: {
      poNumber: HERO_PO_NUMBER,
      branchId: mainBranch.id,
      supplierId: supplier1.id,
      status: 'RECEIVED',
      items: {
        create: [
          {
            ingredientId: coffeeBeans.id,
            quantityRequested: HERO_PO_QTY,
            unitPrice: HERO_PO_UNIT_PRICE,
          },
        ],
      },
    },
  });

  const orderNet = HERO_ORDER_UNIT_PRICE * HERO_ORDER_QTY;
  const orderCogs = heroOrderCogsPerUnit() * HERO_ORDER_QTY;
  const orderCreatedAt = dateDaysAgo(3);
  orderCreatedAt.setHours(10, 15, 0, 0);

  const heroOrder = await prisma.order.create({
    data: {
      userId: staff.id,
      branchId: mainBranch.id,
      status: 'COMPLETED',
      paymentMethod: 'CASH',
      totalAmount: orderNet,
      netAmount: orderNet,
      discountAmount: 0,
      taxAmount: (orderNet * 0.07) / 1.07,
      totalCogs: orderCogs,
      pointsEarned: Math.floor(orderNet / 100),
      queueNumber: 201,
      queueDate: parseQueueBusinessDate(getQueueBusinessDateString(orderCreatedAt)),
      createdAt: orderCreatedAt,
      items: {
        create: [
          {
            productId: icedLatte.id,
            quantity: HERO_ORDER_QTY,
            price: HERO_ORDER_UNIT_PRICE,
            notes: 'Hero demo — beans from PO-DEMO-003 receive',
          },
        ],
      },
    },
  });

  await prisma.journalEntry.create({
    data: {
      branchId: mainBranch.id,
      date: dateDaysAgo(4),
      reference: HERO_PO_NUMBER,
      description: `Accounts Payable for PO ${HERO_PO_NUMBER} — Espresso Beans`,
      status: 'POSTED',
      lines: {
        create: [
          {
            accountId: accountIds['1030'],
            debit: poTotal,
            credit: 0,
            description: 'Inventory received — Espresso Beans',
          },
          {
            accountId: accountIds['2010'],
            debit: 0,
            credit: poTotal,
            description: 'Accounts Payable recognized',
          },
        ],
      },
    },
  });

  await prisma.journalEntry.create({
    data: {
      branchId: mainBranch.id,
      date: orderCreatedAt,
      reference: `ORD-${heroOrder.id}`,
      description: `Sales Revenue and COGS for Order ${heroOrder.id}`,
      status: 'POSTED',
      lines: {
        create: [
          {
            accountId: accountIds['1010'],
            debit: orderNet,
            credit: 0,
            description: 'Cash from POS sale',
          },
          {
            accountId: accountIds['4010'],
            debit: 0,
            credit: orderNet,
            description: 'Sales Revenue',
          },
          {
            accountId: accountIds['5010'],
            debit: orderCogs,
            credit: 0,
            description: 'Cost of Goods Sold',
          },
          {
            accountId: accountIds['1030'],
            debit: 0,
            credit: orderCogs,
            description: 'Inventory reduction',
          },
        ],
      },
    },
  });

  await prisma.auditLog.createMany({
    data: [
      {
        userId: manager.id,
        action: 'RECEIVE_PO',
        targetType: 'PurchaseOrder',
        targetId: heroPurchaseOrder.id,
        details: JSON.stringify({
          poNumber: HERO_PO_NUMBER,
          ingredient: 'Espresso Beans',
          qty: HERO_PO_QTY,
        }),
        createdAt: dateDaysAgo(4),
      },
      {
        userId: staff.id,
        action: 'ORDER_CREATED',
        targetType: 'Order',
        targetId: heroOrder.id,
        details: JSON.stringify({
          poNumber: HERO_PO_NUMBER,
          paymentMethod: 'CASH',
          items: HERO_ORDER_QTY,
          product: 'Iced Latte',
        }),
        createdAt: orderCreatedAt,
      },
    ],
  });

  return { heroPurchaseOrder, heroOrder };
}
