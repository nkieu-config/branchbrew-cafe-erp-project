import { describe, expect, it } from "vitest";
import { buildOperationalTasks } from "./nav-counts";

describe("buildOperationalTasks", () => {
  const counts = {
    lowStock: 4,
    expiringBatches: 2,
    pendingTransfers: 1,
    kdsOrders: 3,
    pendingPurchaseOrders: 2,
    pendingSettlements: 1,
    pendingLeave: 1,
  };

  it("omits inventory counts handled by the inventory widget", () => {
    const tasks = buildOperationalTasks(counts, "MANAGER");
    expect(tasks.some((task) => task.id === "low-stock")).toBe(false);
    expect(tasks.some((task) => task.id === "expiry")).toBe(false);
  });

  it("includes manager-only queues", () => {
    const tasks = buildOperationalTasks(counts, "MANAGER");
    expect(tasks.map((task) => task.id)).toEqual([
      "transfers",
      "kds",
      "purchase-orders",
      "settlements",
      "leave",
    ]);
  });

  it("hides manager-only queues for staff", () => {
    const tasks = buildOperationalTasks(counts, "STAFF");
    expect(tasks.map((task) => task.id)).toEqual(["transfers", "kds"]);
  });
});
