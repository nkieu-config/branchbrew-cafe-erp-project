import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { toNum } from '../common/decimal.util';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  private startOfToday(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  private retailBranchIds(): Promise<number[]> {
    return this.prisma.branch
      .findMany({
        where: { isCentralKitchen: false },
        select: { id: true },
      })
      .then((branches) => branches.map((branch) => branch.id));
  }

  async getSalesTrends(branchId?: number) {
    // Return last 7 days of sales aggregated by day
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const branchFilter = branchId
      ? Prisma.sql`AND "branchId" = ${branchId}`
      : Prisma.empty;

    const results = await this.prisma.$queryRaw<
      { date: string; total: number; orders: bigint }[]
    >`
      SELECT 
        to_char("createdAt", 'YYYY-MM-DD') as date,
        SUM("netAmount") as total,
        COUNT(*)::bigint as orders
      FROM "Order"
      WHERE "createdAt" >= ${sevenDaysAgo}
      AND "status" IN ('COMPLETED', 'PENDING', 'PREPARING')
      ${branchFilter}
      GROUP BY 1
      ORDER BY 1 ASC
    `;

    const dailyMap = new Map<string, { total: number; orders: number }>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dailyMap.set(dateStr, { total: 0, orders: 0 });
    }

    for (const row of results) {
      if (dailyMap.has(row.date)) {
        dailyMap.set(row.date, {
          total: Number(row.total),
          orders: Number(row.orders),
        });
      }
    }

    return Array.from(dailyMap.entries()).map(([date, stats]) => ({
      date,
      total: stats.total,
      orders: stats.orders,
    }));
  }

  async getTopProducts(branchId?: number) {
    const today = this.startOfToday();

    const items = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
      },
      where: {
        order: {
          createdAt: { gte: today },
          status: 'COMPLETED',
          ...(branchId ? { branchId } : {}),
        },
      },
      orderBy: {
        _sum: { quantity: 'desc' },
      },
      take: 5,
    });

    // Populate product names
    const result: { productId: number; name: string; totalQuantity: number }[] =
      [];
    for (const item of items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (product) {
        result.push({
          productId: item.productId,
          name: product.name,
          totalQuantity: item._sum.quantity || 0,
        });
      }
    }

    return result;
  }

  async getProfitLoss(branchId?: number) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const whereBranch = branchId ? { branchId } : {};

    const orders = await this.prisma.order.aggregate({
      where: { ...whereBranch, createdAt: { gte: startOfMonth } },
      _sum: { netAmount: true, totalCogs: true },
    });

    const expenses = await this.prisma.expense.aggregate({
      where: { ...whereBranch, createdAt: { gte: startOfMonth } },
      _sum: { amount: true },
    });

    const payrolls = await this.prisma.payslip.aggregate({
      where: {
        payrollRun: {
          ...(branchId && { branchId }),
          createdAt: { gte: startOfMonth },
        },
      },
      _sum: { netPay: true },
    });

    const revenue = toNum(orders._sum.netAmount);
    const cogs = toNum(orders._sum.totalCogs);
    const expenseTotal = toNum(expenses._sum.amount);
    const payrollTotal = toNum(payrolls._sum.netPay);

    const grossProfit = revenue - cogs;
    const netProfit = grossProfit - expenseTotal - payrollTotal;

    return {
      revenue,
      cogs,
      grossProfit,
      expenses: expenseTotal,
      payroll: payrollTotal,
      netProfit,
    };
  }

  async getExecutiveSummary(branchId?: number) {
    const today = this.startOfToday();

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const whereBranch = branchId ? { branchId } : {};

    // 1. Sales Today vs Yesterday
    const salesTodayAgg = await this.prisma.order.aggregate({
      where: {
        ...whereBranch,
        createdAt: { gte: today },
        status: { in: ['COMPLETED', 'PENDING', 'PREPARING'] },
      },
      _sum: { netAmount: true },
    });
    const salesYesterdayAgg = await this.prisma.order.aggregate({
      where: {
        ...whereBranch,
        createdAt: { gte: yesterday, lt: today },
        status: { in: ['COMPLETED', 'PENDING', 'PREPARING'] },
      },
      _sum: { netAmount: true },
    });

    const salesToday = toNum(salesTodayAgg._sum.netAmount);
    const salesYesterday = toNum(salesYesterdayAgg._sum.netAmount);
    let salesGrowth = 0;
    if (salesYesterday > 0) {
      salesGrowth = ((salesToday - salesYesterday) / salesYesterday) * 100;
    }

    // 2. Top Branch by Sales Today
    let topBranch: {
      id: number;
      name: string;
      totalSales: number;
    } | null = null;
    if (!branchId) {
      const retailBranchIds = await this.retailBranchIds();

      const branchSales = await this.prisma.order.groupBy({
        by: ['branchId'],
        _sum: { netAmount: true },
        where: {
          branchId: { in: retailBranchIds },
          createdAt: { gte: today },
          status: { in: ['COMPLETED', 'PENDING', 'PREPARING'] },
        },
        orderBy: { _sum: { netAmount: 'desc' } },
        take: 1,
      });

      if (branchSales.length > 0) {
        const branch = await this.prisma.branch.findUnique({
          where: { id: branchSales[0].branchId },
        });
        if (branch) {
          topBranch = {
            id: branch.id,
            name: branch.name,
            totalSales: toNum(branchSales[0]._sum.netAmount),
          };
        }
      }
    }

    // 3. Low Stock Alerts
    const inventories = await this.prisma.branchInventory.findMany({
      where: whereBranch,
      include: { ingredient: true, branch: true },
    });

    const alerts = inventories
      .filter((inv) => inv.stock <= inv.minStock)
      .sort((a, b) => a.stock - a.minStock - (b.stock - b.minStock))
      .slice(0, 5)
      .map((inv) => ({
        id: inv.id,
        ingredientName: inv.ingredient.name,
        branchName: inv.branch.name,
        stock: inv.stock,
        minStock: inv.minStock,
      }));

    const warningDate = new Date();
    warningDate.setDate(warningDate.getDate() + 7);

    const expiringBatches = await this.prisma.inventoryBatch.findMany({
      where: {
        ...whereBranch,
        expiryDate: { not: null, lte: warningDate },
        status: { in: ['ACTIVE', 'EXPIRED'] },
        quantity: { gt: 0 },
      },
      include: { ingredient: true, branch: true },
      orderBy: { expiryDate: 'asc' },
      take: 5,
    });

    const expiryAlerts = expiringBatches.map((batch) => ({
      id: batch.id,
      ingredientName: batch.ingredient.name,
      branchName: batch.branch.name,
      quantity: batch.quantity,
      expiryDate: batch.expiryDate!.toISOString(),
      status: batch.status,
    }));

    return {
      salesToday,
      salesYesterday,
      salesGrowth,
      topBranch,
      lowStockAlerts: alerts,
      expiryAlerts,
    };
  }
}
