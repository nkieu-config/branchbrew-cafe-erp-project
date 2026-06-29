import {
  countExpiredBatches,
  countExpiringBatches,
  isExpiredBatch,
  isExpiringBatch,
  isTrackableBatch,
} from "@/lib/inventory-alerts";
import type {
  BranchInventory,
  Ingredient,
  InventoryBatch,
  PurchaseOrder,
  Supplier,
} from "@/types/api";

export type ExpiryFilter = "ALL" | "expiring" | "expired";

export type InventoryWithIngredient = BranchInventory & { ingredient: Ingredient };

export type BatchWithSupplier = InventoryBatch & {
  purchaseOrder?: PurchaseOrder & { supplier?: Supplier };
  ingredient?: Ingredient;
};

export function parseBatchExpiryFilterFromUrl(filter: string | null): ExpiryFilter {
  return filter === "expiring" ? "expiring" : "ALL";
}

export function ingredientDisplayName(record: InventoryWithIngredient): string {
  return record.ingredient?.name ?? `#${record.ingredientId}`;
}

export function batchesForIngredient(
  batches: BatchWithSupplier[],
  ingredientId: number,
): BatchWithSupplier[] {
  return batches.filter(
    (batch) => batch.ingredientId === ingredientId && isTrackableBatch(batch),
  );
}

export function ingredientMatchesExpiryFilter(
  ingredientId: number,
  batches: BatchWithSupplier[],
  filter: ExpiryFilter,
): boolean {
  if (filter === "ALL") return true;
  const ingredientBatches = batchesForIngredient(batches, ingredientId);
  if (filter === "expired") {
    return ingredientBatches.some(isExpiredBatch);
  }
  return ingredientBatches.some((batch) => isExpiringBatch(batch) && !isExpiredBatch(batch));
}

export function matchesBatchInventorySearch(
  record: InventoryWithIngredient,
  search: string,
): boolean {
  if (!search) return true;
  const name = record.ingredient?.name?.toLowerCase() ?? "";
  return name.includes(search);
}

export function filterBatchInventories(
  inventories: InventoryWithIngredient[],
  batches: BatchWithSupplier[],
  options: {
    search: string;
    expiryFilter: ExpiryFilter;
  },
): InventoryWithIngredient[] {
  return inventories.filter(
    (record) =>
      matchesBatchInventorySearch(record, options.search) &&
      ingredientMatchesExpiryFilter(record.ingredient.id, batches, options.expiryFilter),
  );
}

export function summarizeTrackableBatches(batches: BatchWithSupplier[]) {
  const trackable = batches.filter(isTrackableBatch);
  return {
    total: trackable.length,
    expiring: countExpiringBatches(trackable) - countExpiredBatches(trackable),
    expired: countExpiredBatches(trackable),
  };
}

export function hasBatchInventoryFilters(options: {
  search: string;
  expiryFilter: ExpiryFilter;
}): boolean {
  return options.search.trim().length > 0 || options.expiryFilter !== "ALL";
}
