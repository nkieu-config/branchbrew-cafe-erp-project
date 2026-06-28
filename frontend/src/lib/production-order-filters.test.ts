import { describe, expect, it } from "vitest";
import { summarizeProductionOrders } from "./production-order-filters";

describe("production-order-filters", () => {
  it("summarizes kanban columns", () => {
    const summary = summarizeProductionOrders([
      { id: 1, status: "PLANNED" } as never,
      { id: 2, status: "IN_PROGRESS" } as never,
      { id: 3, status: "COMPLETED" } as never,
    ]);
    expect(summary.planned).toBe(1);
    expect(summary.inProgress).toBe(1);
    expect(summary.completed).toBe(1);
  });
});
