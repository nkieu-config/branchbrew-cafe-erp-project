import { describe, expect, it } from "vitest";
import type { Order } from "@/types/api";
import {
  filterPosOrders,
  filterRecentOrders,
  hasPosOrderFilters,
  isTerminalOrderStatus,
  matchesPosOrderSearch,
} from "./pos-order-filters";

describe("pos-order-filters", () => {
  const orders = [
    {
      id: 10,
      status: "COMPLETED",
      createdAt: new Date().toISOString(),
      queueNumber: 5,
      paymentMethod: "CASH",
      items: [],
    },
    {
      id: 11,
      status: "CANCELLED",
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      queueNumber: 6,
      paymentMethod: "CARD",
      items: [],
    },
  ] as Order[];

  it("matches search by order id and queue", () => {
    expect(matchesPosOrderSearch(orders[0], "10")).toBe(true);
    expect(matchesPosOrderSearch(orders[0], "cancelled")).toBe(false);
  });

  it("filters recent orders within lookback window", () => {
    expect(filterRecentOrders(orders)).toHaveLength(1);
    expect(filterRecentOrders(orders)[0].id).toBe(10);
  });

  it("filters by status and search", () => {
    const recent = filterRecentOrders(orders);
    expect(
      filterPosOrders(recent, { search: "", statusFilter: "COMPLETED" }),
    ).toHaveLength(1);
  });

  it("detects terminal statuses and active filters", () => {
    expect(isTerminalOrderStatus("CANCELLED")).toBe(true);
    expect(hasPosOrderFilters({ search: "", statusFilter: "ALL" })).toBe(false);
    expect(hasPosOrderFilters({ search: "10", statusFilter: "ALL" })).toBe(true);
  });
});
