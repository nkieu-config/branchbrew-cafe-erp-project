import { describe, expect, it } from "vitest";
import type { WasteLog } from "@/types/api";
import {
  extractWasteHistoryIngredients,
  filterWasteLogs,
  hasWasteHistoryFilters,
  matchesWasteLogSearch,
} from "./waste-filters";

describe("waste-filters", () => {
  const logs = [
    {
      id: 1,
      branchId: 1,
      ingredientId: 10,
      ingredient: { id: 10, name: "Milk", unit: "L", isActive: true },
      quantity: 2,
      reason: "Expired",
      recordedById: 5,
      recordedBy: { name: "Alice" },
      createdAt: "2026-06-15T10:00:00.000Z",
    },
    {
      id: 2,
      branchId: 1,
      ingredientId: 20,
      ingredient: { id: 20, name: "Flour", unit: "kg", isActive: true },
      quantity: 1.5,
      reason: "Spilled",
      recordedById: 6,
      recordedBy: { name: "Bob" },
      createdAt: "2026-06-20T14:30:00.000Z",
    },
  ] as WasteLog[];

  it("matches search across reason, ingredient, and recorder", () => {
    expect(matchesWasteLogSearch(logs[0], "expired")).toBe(true);
    expect(matchesWasteLogSearch(logs[0], "milk")).toBe(true);
    expect(matchesWasteLogSearch(logs[0], "alice")).toBe(true);
    expect(matchesWasteLogSearch(logs[0], "spilled")).toBe(false);
  });

  it("filters by search, ingredient, and date range", () => {
    const filtered = filterWasteLogs(logs, {
      search: "spilled",
      ingredientFilter: "ALL",
      dateFrom: "",
      dateTo: "",
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe(2);

    const byIngredient = filterWasteLogs(logs, {
      search: "",
      ingredientFilter: "10",
      dateFrom: "",
      dateTo: "",
    });
    expect(byIngredient).toHaveLength(1);
    expect(byIngredient[0].ingredientId).toBe(10);

    const byDate = filterWasteLogs(logs, {
      search: "",
      ingredientFilter: "ALL",
      dateFrom: "2026-06-18",
      dateTo: "2026-06-25",
    });
    expect(byDate).toHaveLength(1);
    expect(byDate[0].id).toBe(2);
  });

  it("extracts unique ingredients from history", () => {
    expect(extractWasteHistoryIngredients(logs)).toEqual([
      { id: 20, name: "Flour" },
      { id: 10, name: "Milk" },
    ]);
  });

  it("detects active history filters", () => {
    expect(
      hasWasteHistoryFilters({
        search: "",
        ingredientFilter: "ALL",
        dateFrom: "",
        dateTo: "",
      }),
    ).toBe(false);
    expect(
      hasWasteHistoryFilters({
        search: "milk",
        ingredientFilter: "ALL",
        dateFrom: "",
        dateTo: "",
      }),
    ).toBe(true);
  });
});
