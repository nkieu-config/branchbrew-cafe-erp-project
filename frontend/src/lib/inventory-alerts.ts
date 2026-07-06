import { batchExpiryUrgency, stockLevel } from "@/lib/theme/stock";
import type { Branch, BranchInventory, Ingredient, InventoryBatch } from "@/types/api";

const DEFAULT_EXPIRY_WARNING_DAYS = 7;

export const DASHBOARD_ALERT_PREVIEW_LIMIT = 5;

export type DashboardLowStockAlert = {
  id: number;
  ingredientName: string;
  branchName: string;
  stock: number;
  minStock: number;
};

export type DashboardExpiryAlert = {
  id: number;
  ingredientName: string;
  branchName: string;
  quantity: number;
  expiryDate: string;
  status: string;
};

/** Matches inventory balance page — stock at or below minimum (includes out of stock). */
export function isLowStockRecord(
  record: Pick<BranchInventory, "stock" | "minStock">,
): boolean {
  return stockLevel(record.stock, record.minStock) !== "ok";
}

export function countLowStockRecords(
  records: BranchInventory[] | null | undefined,
): number {
  return records?.filter(isLowStockRecord).length ?? 0;
}

/** Batches shown in heatmap, tables, and alerts (qty > 0, active/expired status). */
export function isTrackableBatch(
  batch: Pick<InventoryBatch, "quantity" | "status">,
): boolean {
  if (batch.quantity <= 0) return false;
  if (batch.status && !["ACTIVE", "EXPIRED"].includes(batch.status)) return false;
  return true;
}

/** Matches executive-summary / batches expiry window (7 days, qty > 0). */
export function isExpiringBatch(
  batch: Pick<InventoryBatch, "expiryDate" | "quantity" | "status">,
  warningDays = DEFAULT_EXPIRY_WARNING_DAYS,
): boolean {
  if (!isTrackableBatch(batch) || !batch.expiryDate) return false;

  const warningCutoff = new Date();
  warningCutoff.setDate(warningCutoff.getDate() + warningDays);
  warningCutoff.setHours(23, 59, 59, 999);

  return new Date(batch.expiryDate).getTime() <= warningCutoff.getTime();
}

export function isExpiredBatch(
  batch: Pick<InventoryBatch, "expiryDate" | "quantity" | "status">,
): boolean {
  if (!isTrackableBatch(batch) || !batch.expiryDate) return false;
  return batchExpiryUrgency(batch.expiryDate) === "expired";
}

export function countExpiringBatches(
  batches: InventoryBatch[] | null | undefined,
  warningDays = DEFAULT_EXPIRY_WARNING_DAYS,
): number {
  return batches?.filter((batch) => isExpiringBatch(batch, warningDays)).length ?? 0;
}

export function countExpiredBatches(
  batches: InventoryBatch[] | null | undefined,
): number {
  return batches?.filter(isExpiredBatch).length ?? 0;
}

type InventoryWithIngredient = BranchInventory & { ingredient?: Ingredient; branch?: Branch };
type BatchWithIngredient = InventoryBatch & { ingredient?: Ingredient; branch?: Branch };

export function buildLowStockAlerts(
  records: InventoryWithIngredient[] | null | undefined,
  branchName: string,
  limit = DASHBOARD_ALERT_PREVIEW_LIMIT,
): DashboardLowStockAlert[] {
  return (records ?? [])
    .filter(isLowStockRecord)
    .sort((a, b) => a.stock - a.minStock - (b.stock - b.minStock))
    .slice(0, limit)
    .map((inv) => ({
      id: inv.id,
      ingredientName: inv.ingredient?.name ?? "Unknown",
      branchName: inv.branch?.name ?? branchName,
      stock: inv.stock,
      minStock: inv.minStock,
    }));
}

export function buildExpiryAlerts(
  batches: BatchWithIngredient[] | null | undefined,
  branchName: string,
  limit = DASHBOARD_ALERT_PREVIEW_LIMIT,
  warningDays = DEFAULT_EXPIRY_WARNING_DAYS,
): DashboardExpiryAlert[] {
  return (batches ?? [])
    .filter((batch) => isExpiringBatch(batch, warningDays))
    .sort(
      (a, b) =>
        new Date(a.expiryDate!).getTime() - new Date(b.expiryDate!).getTime(),
    )
    .slice(0, limit)
    .map((batch) => ({
      id: batch.id,
      ingredientName: batch.ingredient?.name ?? "Unknown",
      branchName: batch.branch?.name ?? branchName,
      quantity: batch.quantity,
      expiryDate: batch.expiryDate!,
      status: isExpiredBatch(batch) ? "EXPIRED" : batch.status,
    }));
}
