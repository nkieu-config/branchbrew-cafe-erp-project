import type { ProductionOrder } from "@/types/api";

export type ProductionOrderWithTarget = ProductionOrder & {
  targetIngredient?: { name: string; unit: string };
};

export function summarizeProductionOrders(orders: ProductionOrderWithTarget[]) {
  let planned = 0;
  let inProgress = 0;
  let completed = 0;

  for (const order of orders) {
    switch (order.status) {
      case "PLANNED":
        planned += 1;
        break;
      case "IN_PROGRESS":
        inProgress += 1;
        break;
      case "COMPLETED":
        completed += 1;
        break;
    }
  }

  return {
    total: orders.length,
    planned,
    inProgress,
    completed,
  };
}
