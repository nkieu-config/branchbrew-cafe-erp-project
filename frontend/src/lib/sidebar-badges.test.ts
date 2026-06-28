import { describe, expect, it } from "vitest";
import { computeSidebarChildTabBadges, computeSidebarNavBadges, formatSidebarBadgeCount, resolveMobileBottomNavBadge } from "./sidebar-badges";

describe("computeSidebarNavBadges", () => {
  it("counts inventory alerts and pending transfers", () => {
    const badges = computeSidebarNavBadges({
      role: "STAFF",
      summary: { lowStockAlerts: [{ id: "1" }], expiryAlerts: [{ id: "2" }] },
      transfers: [
        { id: 1, status: "PENDING", toBranchId: 2, fromBranchId: 1, ingredientId: 1, quantity: 1, requestedById: 1, createdAt: "" },
      ],
      activeBranchId: 2,
    });
    expect(badges.inventory?.count).toBe(3);
  });

  it("includes procurement and finance badges for managers", () => {
    const badges = computeSidebarNavBadges({
      role: "MANAGER",
      purchaseOrders: [
        { id: 1, poNumber: "PO-1", branchId: 1, supplierId: 1, status: "PENDING", createdAt: "" },
      ],
      settlements: [
        {
          id: 1,
          branchId: 1,
          date: "2026-01-01",
          expectedCash: 0,
          actualCash: 0,
          difference: 0,
          status: "PENDING",
          submittedById: 1,
          createdAt: "2026-01-01",
        },
      ],
      leaveRequests: [{ id: 1, userId: 1, type: "ANNUAL", startDate: "", endDate: "", status: "PENDING" }],
    });
    expect(badges.procurement?.count).toBe(1);
    expect(badges.finance?.count).toBe(1);
    expect(badges.hr?.count).toBe(1);
  });

  it("omits manager-only badges for staff", () => {
    const badges = computeSidebarNavBadges({
      role: "STAFF",
      purchaseOrders: [
        { id: 1, poNumber: "PO-1", branchId: 1, supplierId: 1, status: "PENDING", createdAt: "" },
      ],
    });
    expect(badges.procurement).toBeUndefined();
  });
});

describe("formatSidebarBadgeCount", () => {
  it("caps large counts", () => {
    expect(formatSidebarBadgeCount(120)).toBe("99+");
    expect(formatSidebarBadgeCount(3)).toBe("3");
  });
});

describe("computeSidebarChildTabBadges", () => {
  it("maps pending transfers to inventory transfers tab", () => {
    const child = computeSidebarChildTabBadges({
      role: "STAFF",
      transfers: [
        {
          id: 1,
          status: "PENDING",
          toBranchId: 2,
          fromBranchId: 1,
          ingredientId: 1,
          quantity: 1,
          requestedById: 1,
          createdAt: "",
        },
      ],
      activeBranchId: 2,
    });
    expect(child["/inventory/transfers"]?.count).toBe(1);
  });
});

describe("resolveMobileBottomNavBadge", () => {
  it("aggregates all badges for the more item", () => {
    const badge = resolveMobileBottomNavBadge("more", {
      inventory: { count: 2, tone: "warning", label: "2 alerts" },
      procurement: { count: 1, tone: "warning", label: "1 PO" },
    });
    expect(badge?.count).toBe(3);
  });

  it("returns inventory badge for stock tab", () => {
    const badge = resolveMobileBottomNavBadge("inventory", {
      inventory: { count: 4, tone: "warning", label: "4 alerts" },
    });
    expect(badge?.count).toBe(4);
  });
});
