import type { WasteLog } from "@/types/api";

export type WasteHistoryIngredient = { id: number; name: string };

export function matchesWasteLogSearch(log: WasteLog, query: string): boolean {
  if (!query) return true;
  const reason = log.reason.toLowerCase();
  const ingredient = log.ingredient?.name?.toLowerCase() ?? "";
  const recordedBy = log.recordedBy?.name?.toLowerCase() ?? "";
  return (
    reason.includes(query) ||
    ingredient.includes(query) ||
    recordedBy.includes(query)
  );
}

export function matchesWasteIngredientFilter(
  log: WasteLog,
  ingredientFilter: string,
): boolean {
  return ingredientFilter === "ALL" || log.ingredientId === Number(ingredientFilter);
}

export function matchesWasteDateRange(
  log: WasteLog,
  dateFrom: string,
  dateTo: string,
): boolean {
  if (dateFrom) {
    const from = new Date(`${dateFrom}T00:00:00`);
    if (new Date(log.createdAt) < from) return false;
  }
  if (dateTo) {
    const to = new Date(`${dateTo}T23:59:59.999`);
    if (new Date(log.createdAt) > to) return false;
  }
  return true;
}

export function filterWasteLogs(
  logs: WasteLog[],
  options: {
    search: string;
    ingredientFilter: string;
    dateFrom: string;
    dateTo: string;
  },
): WasteLog[] {
  return logs.filter(
    (log) =>
      matchesWasteLogSearch(log, options.search) &&
      matchesWasteIngredientFilter(log, options.ingredientFilter) &&
      matchesWasteDateRange(log, options.dateFrom, options.dateTo),
  );
}

export function extractWasteHistoryIngredients(
  logs: WasteLog[],
): WasteHistoryIngredient[] {
  const seen = new Map<number, string>();
  for (const log of logs) {
    if (log.ingredient) {
      seen.set(log.ingredientId, log.ingredient.name);
    }
  }
  return [...seen.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function hasWasteHistoryFilters(options: {
  search: string;
  ingredientFilter: string;
  dateFrom: string;
  dateTo: string;
}): boolean {
  return (
    options.search.trim().length > 0 ||
    options.ingredientFilter !== "ALL" ||
    options.dateFrom.length > 0 ||
    options.dateTo.length > 0
  );
}
