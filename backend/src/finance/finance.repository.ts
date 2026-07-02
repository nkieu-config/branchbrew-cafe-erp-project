import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type DailyPaymentTotals = {
  cash: Prisma.Decimal | null;
  creditCard: Prisma.Decimal | null;
  qr: Prisma.Decimal | null;
};

@Injectable()
export class FinanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async aggregateDailyPaymentTotals(
    branchId: number,
    start: Date,
    end: Date,
  ): Promise<DailyPaymentTotals> {
    const dateFilter = { gte: start, lte: end };
    const baseWhere = { branchId, createdAt: dateFilter };

    const [cashOrders, creditCardOrders, qrOrders] = await Promise.all([
      this.prisma.order.aggregate({
        where: { ...baseWhere, paymentMethod: 'CASH' },
        _sum: { netAmount: true },
      }),
      this.prisma.order.aggregate({
        where: { ...baseWhere, paymentMethod: 'CREDIT_CARD' },
        _sum: { netAmount: true },
      }),
      this.prisma.order.aggregate({
        where: { ...baseWhere, paymentMethod: 'QR_PROMPTPAY' },
        _sum: { netAmount: true },
      }),
    ]);

    return {
      cash: cashOrders._sum.netAmount,
      creditCard: creditCardOrders._sum.netAmount,
      qr: qrOrders._sum.netAmount,
    };
  }

  aggregateDailyExpenses(branchId: number, start: Date, end: Date) {
    return this.prisma.expense.aggregate({
      where: { branchId, createdAt: { gte: start, lte: end } },
      _sum: { amount: true },
    });
  }

  findOrdersForExport(where: Prisma.OrderWhereInput) {
    return this.prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        branch: { select: { name: true } },
        user: { select: { name: true } },
        customer: { select: { name: true, phone: true } },
      },
    });
  }
}
