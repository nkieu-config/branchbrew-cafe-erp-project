import { toNumber } from "@/lib/money";
import type { Order } from "@/types/api";

export function computeActualFoodCostMargin(orders: Order[]) {
  let totalRevenue = 0;
  let totalCogs = 0;

  for (const order of orders) {
    totalRevenue += toNumber(order.netAmount);
    totalCogs += toNumber(order.totalCogs);
  }

  const actualFoodCostPercent =
    totalRevenue > 0 ? (totalCogs / totalRevenue) * 100 : 0;
  const grossMarginPercent =
    totalRevenue > 0 ? ((totalRevenue - totalCogs) / totalRevenue) * 100 : 0;

  return {
    orderCount: orders.length,
    totalRevenue,
    totalCogs,
    grossProfit: totalRevenue - totalCogs,
    actualFoodCostPercent,
    grossMarginPercent,
  };
}

export function compareFoodCostMargins(
  orders: Order[],
  theoreticalAvgPercent: number,
) {
  const actual = computeActualFoodCostMargin(orders);
  return {
    ...actual,
    theoreticalAvgPercent,
    variancePercent: actual.actualFoodCostPercent - theoreticalAvgPercent,
  };
}
