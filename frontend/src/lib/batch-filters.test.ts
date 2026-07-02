import { describe, expect, it } from "vitest";
import type { Ingredient } from "@/types/api";
import {
  batchesForIngredient,
  filterBatchInventories,
  hasBatchInventoryFilters,
  ingredientMatchesExpiryFilter,
  matchesBatchInventorySearch,
  parseBatchExpiryFilterFromUrl,
  summarizeTrackableBatches,
  type BatchWithSupplier,
  type InventoryWithIngredient,
} from "./batch-filters";

describe("batch-filters", () => {
  const ingredient = { id: 10, name: "Milk", unit: "L", isActive: true } as Ingredient;
  const inventories = [
    { id: 1, branchId: 1, ingredientId: 10, stock: 5, minStock: 2, ingredient },
    { id: 2, branchId: 1, ingredientId: 20, stock: 3, minStock: 1, ingredient: { id: 20, name: "Flour", unit: "kg", isActive: true } },
  ] as InventoryWithIngredient[];

  const batches = [
    {
      id: 100,
      branchId: 1,
      ingredientId: 10,
      quantity: 2,
      status: "ACTIVE",
      expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 101,
      branchId: 1,
      ingredientId: 10,
      quantity: 1,
      status: "EXPIRED",
      expiryDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 200,
      branchId: 1,
      ingredientId: 20,
      quantity: 3,
      status: "ACTIVE",
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ] as BatchWithSupplier[];

  it("parses expiry filter from URL", () => {
    expect(parseBatchExpiryFilterFromUrl("expiring")).toBe("expiring");
    expect(parseBatchExpiryFilterFromUrl(null)).toBe("ALL");
  });

  it("matches search by ingredient name", () => {
    expect(matchesBatchInventorySearch(inventories[0], "milk")).toBe(true);
    expect(matchesBatchInventorySearch(inventories[0], "flour")).toBe(false);
  });

  it("filters inventories by search and expiry", () => {
    const bySearch = filterBatchInventories(inventories, batches, {
      search: "flour",
      expiryFilter: "ALL",
    });
    expect(bySearch).toHaveLength(1);
    expect(bySearch[0].ingredientId).toBe(20);

    const byExpired = filterBatchInventories(inventories, batches, {
      search: "",
      expiryFilter: "expired",
    });
    expect(byExpired).toHaveLength(1);
    expect(byExpired[0].ingredientId).toBe(10);
  });

  it("matches ingredient expiry filters", () => {
    expect(ingredientMatchesExpiryFilter(10, batches, "expiring")).toBe(true);
    expect(ingredientMatchesExpiryFilter(20, batches, "expiring")).toBe(false);
    expect(ingredientMatchesExpiryFilter(10, batches, "expired")).toBe(true);
  });

  it("returns trackable batches per ingredient", () => {
    expect(batchesForIngredient(batches, 10)).toHaveLength(2);
    expect(batchesForIngredient(batches, 99)).toHaveLength(0);
  });

  it("summarizes trackable batch counts", () => {
    const summary = summarizeTrackableBatches(batches);
    expect(summary.total).toBe(3);
    expect(summary.expired).toBeGreaterThanOrEqual(1);
  });

  it("detects active inventory filters", () => {
    expect(hasBatchInventoryFilters({ search: "", expiryFilter: "ALL" })).toBe(false);
    expect(hasBatchInventoryFilters({ search: "milk", expiryFilter: "ALL" })).toBe(true);
    expect(hasBatchInventoryFilters({ search: "", expiryFilter: "expired" })).toBe(true);
  });
});
