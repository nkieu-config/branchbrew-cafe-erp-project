import { describe, expect, it } from "vitest";
import { compareFoodCostMargins } from "./food-cost-margin";
import type { Order } from "@/types/api";

function order(overrides: Partial<Order> = {}): Order {
  return {
    id: 1,
    netAmount: 100,
    totalCogs: 30,
    createdAt: "2026-01-01T00:00:00Z",
    ...overrides,
  } as Order;
}

describe("food-cost-margin", () => {
  it("compares actual order margin to theoretical recipe average", () => {
    const result = compareFoodCostMargins([order(), order({ id: 2, netAmount: 200, totalCogs: 80 })], 28);
    expect(result.actualFoodCostPercent).toBeCloseTo(36.67, 1);
    expect(result.variancePercent).toBeCloseTo(8.67, 1);
    expect(result.orderCount).toBe(2);
  });
});
