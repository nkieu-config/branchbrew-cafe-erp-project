import { dateDaysAgo, settlementDifference } from '../helpers';
import type { SeedContext } from '../types';

export async function seedFinanceDemo(ctx: SeedContext): Promise<void> {
  const { prisma, mainBranch, secondBranch, manager } = ctx;

  console.log('Seeding finance demo (settlements & expenses)...');

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
}
