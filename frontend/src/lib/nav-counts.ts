/** React Query key for dashboard operational counts (GET /nav-counts). */
export const NAV_COUNTS_QUERY_KEY = "navCounts";

export const NAV_COUNTS_REFETCH_MS = 120_000;

export type NavCountsSnapshot = {
  lowStock: number;
  expiringBatches: number;
  pendingTransfers: number;
  kdsOrders: number;
  pendingPurchaseOrders: number;
  pendingSettlements: number;
  pendingLeave: number;
};

export type OperationalTask = {
  id: string;
  label: string;
  href: string;
  count: number;
};

function taskTone(count: number, dangerThreshold = 5): "warning" | "danger" {
  return count >= dangerThreshold ? "danger" : "warning";
}

/** Non-inventory operational tasks for the dashboard (inventory stays in LowStockWidget). */
export function buildOperationalTasks(
  counts: NavCountsSnapshot,
  role?: string,
): OperationalTask[] {
  const isManagerOrAdmin = role === "SUPER_ADMIN" || role === "MANAGER";
  const tasks: OperationalTask[] = [];

  if (counts.pendingTransfers > 0) {
    tasks.push({
      id: "transfers",
      label: "Pending stock transfers",
      href: "/inventory/transfers?status=PENDING",
      count: counts.pendingTransfers,
    });
  }

  if (counts.kdsOrders > 0) {
    tasks.push({
      id: "kds",
      label: "Kitchen orders waiting",
      href: "/kds",
      count: counts.kdsOrders,
    });
  }

  if (isManagerOrAdmin && counts.pendingPurchaseOrders > 0) {
    tasks.push({
      id: "purchase-orders",
      label: "Purchase orders awaiting approval",
      href: "/procurement/orders?status=PENDING",
      count: counts.pendingPurchaseOrders,
    });
  }

  if (isManagerOrAdmin && counts.pendingSettlements > 0) {
    tasks.push({
      id: "settlements",
      label: "Shift settlements awaiting approval",
      href: "/finance/overview?status=PENDING",
      count: counts.pendingSettlements,
    });
  }

  if (isManagerOrAdmin && counts.pendingLeave > 0) {
    tasks.push({
      id: "leave",
      label: "Leave requests pending",
      href: "/hr/leave?status=PENDING",
      count: counts.pendingLeave,
    });
  }

  return tasks;
}

export function operationalTaskTone(count: number): "warning" | "danger" {
  return taskTone(count);
}
