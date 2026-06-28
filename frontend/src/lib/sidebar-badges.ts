import type { LeaveRequest, PurchaseOrder, Settlement, StockTransfer } from "@/types/api";

export type SidebarNavBadgeTone = "warning" | "danger" | "info";

export type SidebarNavBadge = {
  count: number;
  tone: SidebarNavBadgeTone;
  label: string;
};

export type SidebarNavBadgeMap = Partial<Record<string, SidebarNavBadge>>;

type AnalyticsSummary = {
  lowStockAlerts?: unknown[];
  expiryAlerts?: unknown[];
};

type ComputeBadgeInput = {
  role?: string;
  summary?: AnalyticsSummary | null;
  purchaseOrders?: PurchaseOrder[] | null;
  settlements?: Settlement[] | null;
  leaveRequests?: LeaveRequest[] | null;
  transfers?: StockTransfer[] | null;
  activeBranchId?: number | null;
};

function countPendingPurchaseOrders(orders: PurchaseOrder[], activeBranchId?: number | null) {
  return orders.filter(
    (po) =>
      po.status === "PENDING" &&
      (activeBranchId == null || po.branchId === activeBranchId),
  ).length;
}

function countPendingSettlements(settlements: Settlement[], activeBranchId?: number | null) {
  return settlements.filter(
    (s) =>
      s.status === "PENDING" &&
      (activeBranchId == null || s.branchId === activeBranchId),
  ).length;
}

function countPendingLeave(requests: LeaveRequest[]) {
  return requests.filter((req) => req.status === "PENDING").length;
}

function countInventoryAlerts(
  summary: AnalyticsSummary | null | undefined,
  transfers: StockTransfer[] | null | undefined,
  activeBranchId?: number | null,
) {
  const alertCount =
    (summary?.lowStockAlerts?.length ?? 0) + (summary?.expiryAlerts?.length ?? 0);
  const pendingTransfers =
    transfers?.filter(
      (t) =>
        t.status === "PENDING" &&
        (activeBranchId == null || t.toBranchId === activeBranchId),
    ).length ?? 0;
  return alertCount + pendingTransfers;
}

/** Derive sidebar nav badge counts from fetched operational data. */
export function computeSidebarNavBadges(input: ComputeBadgeInput): SidebarNavBadgeMap {
  const { role, summary, purchaseOrders, settlements, leaveRequests, transfers, activeBranchId } =
    input;
  const badges: SidebarNavBadgeMap = {};
  const isManagerOrAdmin = role === "SUPER_ADMIN" || role === "MANAGER";

  const inventoryCount = countInventoryAlerts(summary, transfers, activeBranchId);
  if (inventoryCount > 0) {
    badges.inventory = {
      count: inventoryCount,
      tone: inventoryCount >= 5 ? "danger" : "warning",
      label: `${inventoryCount} inventory alert${inventoryCount === 1 ? "" : "s"}`,
    };
  }

  if (isManagerOrAdmin && purchaseOrders) {
    const poCount = countPendingPurchaseOrders(purchaseOrders, activeBranchId);
    if (poCount > 0) {
      badges.procurement = {
        count: poCount,
        tone: "warning",
        label: `${poCount} purchase order${poCount === 1 ? "" : "s"} awaiting approval`,
      };
    }
  }

  if (isManagerOrAdmin && settlements) {
    const settlementCount = countPendingSettlements(settlements, activeBranchId);
    if (settlementCount > 0) {
      badges.finance = {
        count: settlementCount,
        tone: "warning",
        label: `${settlementCount} settlement${settlementCount === 1 ? "" : "s"} awaiting approval`,
      };
    }
  }

  if (isManagerOrAdmin && leaveRequests) {
    const leaveCount = countPendingLeave(leaveRequests);
    if (leaveCount > 0) {
      badges.hr = {
        count: leaveCount,
        tone: "info",
        label: `${leaveCount} leave request${leaveCount === 1 ? "" : "s"} pending`,
      };
    }
  }

  return badges;
}

export function formatSidebarBadgeCount(count: number): string {
  if (count > 99) return "99+";
  return String(count);
}

function countExpiryAlerts(summary: AnalyticsSummary | null | undefined) {
  return summary?.expiryAlerts?.length ?? 0;
}

function countLowStockAlerts(summary: AnalyticsSummary | null | undefined) {
  return summary?.lowStockAlerts?.length ?? 0;
}

function countPendingIncomingTransfers(
  transfers: StockTransfer[] | null | undefined,
  activeBranchId?: number | null,
) {
  return (
    transfers?.filter(
      (t) =>
        t.status === "PENDING" &&
        (activeBranchId == null || t.toBranchId === activeBranchId),
    ).length ?? 0
  );
}

/** Tab-path badges for sidebar tree children (keyed by hub tab path). */
export function computeSidebarChildTabBadges(input: ComputeBadgeInput): SidebarNavBadgeMap {
  const { role, summary, purchaseOrders, settlements, leaveRequests, transfers, activeBranchId } =
    input;
  const badges: SidebarNavBadgeMap = {};
  const isManagerOrAdmin = role === "SUPER_ADMIN" || role === "MANAGER";

  const transferCount = countPendingIncomingTransfers(transfers, activeBranchId);
  if (transferCount > 0) {
    badges["/inventory/transfers"] = {
      count: transferCount,
      tone: "warning",
      label: `${transferCount} pending transfer${transferCount === 1 ? "" : "s"}`,
    };
  }

  const expiryCount = countExpiryAlerts(summary);
  if (expiryCount > 0) {
    badges["/inventory/batches"] = {
      count: expiryCount,
      tone: expiryCount >= 3 ? "danger" : "warning",
      label: `${expiryCount} expiry alert${expiryCount === 1 ? "" : "s"}`,
    };
  }

  const lowStockCount = countLowStockAlerts(summary);
  if (lowStockCount > 0) {
    badges["/inventory"] = {
      count: lowStockCount,
      tone: lowStockCount >= 3 ? "danger" : "warning",
      label: `${lowStockCount} low stock alert${lowStockCount === 1 ? "" : "s"}`,
    };
  }

  if (isManagerOrAdmin && purchaseOrders) {
    const poCount = countPendingPurchaseOrders(purchaseOrders, activeBranchId);
    if (poCount > 0) {
      badges["/procurement/orders"] = {
        count: poCount,
        tone: "warning",
        label: `${poCount} PO${poCount === 1 ? "" : "s"} awaiting approval`,
      };
    }
  }

  if (isManagerOrAdmin && settlements) {
    const settlementCount = countPendingSettlements(settlements, activeBranchId);
    if (settlementCount > 0) {
      badges["/finance/overview"] = {
        count: settlementCount,
        tone: "warning",
        label: `${settlementCount} settlement${settlementCount === 1 ? "" : "s"} pending`,
      };
    }
  }

  if (isManagerOrAdmin && leaveRequests) {
    const leaveCount = countPendingLeave(leaveRequests);
    if (leaveCount > 0) {
      badges["/hr/leave"] = {
        count: leaveCount,
        tone: "info",
        label: `${leaveCount} leave request${leaveCount === 1 ? "" : "s"} pending`,
      };
    }
  }

  return badges;
}

/** Resolve a badge for a mobile bottom-nav item (supports aggregate on "more"). */
export function resolveMobileBottomNavBadge(
  navItemId: string,
  badges: SidebarNavBadgeMap,
): SidebarNavBadge | undefined {
  const mappedId = getMobileBottomNavBadgeKey(navItemId);
  if (mappedId === "aggregate") {
    const values = Object.values(badges).filter((badge): badge is SidebarNavBadge => badge != null);
    const total = values.reduce((sum, badge) => sum + badge.count, 0);
    if (total <= 0) return undefined;
    const hasDanger = values.some((badge) => badge.tone === "danger");
    return {
      count: total,
      tone: hasDanger ? "danger" : "warning",
      label: `${total} pending notification${total === 1 ? "" : "s"}`,
    };
  }
  if (mappedId) return badges[mappedId];
  return undefined;
}

function getMobileBottomNavBadgeKey(navItemId: string): string | null | "aggregate" {
  if (navItemId === "inventory") return "inventory";
  if (navItemId === "more") return "aggregate";
  return null;
}
