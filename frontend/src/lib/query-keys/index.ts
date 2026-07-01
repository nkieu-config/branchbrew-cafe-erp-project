import type { QueryClient } from "@tanstack/react-query";
import { NAV_COUNTS_QUERY_KEY } from "@/lib/nav-counts";
import { analyticsKeys } from "./analytics";
import { inventoryKeys } from "./inventory";
import { orderKeys } from "./orders";
import { transferKeys } from "./transfers";

export { analyticsKeys } from "./analytics";
export { inventoryKeys } from "./inventory";
export { orderKeys } from "./orders";
export { transferKeys } from "./transfers";

export function invalidateNavCounts(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: [NAV_COUNTS_QUERY_KEY] });
}

export function invalidateInventoryBranch(queryClient: QueryClient, branchId: number) {
  queryClient.invalidateQueries({ queryKey: inventoryKeys.balance(branchId) });
  queryClient.invalidateQueries({ queryKey: inventoryKeys.branch(branchId) });
}

export function invalidatePosOrderSideEffects(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: orderKeys.root });
  queryClient.invalidateQueries({ queryKey: analyticsKeys.summaryRoot });
  queryClient.invalidateQueries({ queryKey: analyticsKeys.salesTrendsRoot });
  queryClient.invalidateQueries({ queryKey: inventoryKeys.balanceRoot });
}

export function invalidateTransferSideEffects(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: transferKeys.root });
  queryClient.invalidateQueries({ queryKey: inventoryKeys.branchRoot });
  queryClient.invalidateQueries({ queryKey: inventoryKeys.balanceRoot });
  queryClient.invalidateQueries({ queryKey: analyticsKeys.summaryRoot });
  invalidateNavCounts(queryClient);
}
