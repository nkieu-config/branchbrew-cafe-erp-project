"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { fetchAPI } from "@/lib/api";
import { CORE_ENDPOINTS } from "@/lib/endpoints/core";
import {
  NAV_COUNTS_QUERY_KEY,
  NAV_COUNTS_REFETCH_MS,
  type NavCountsSnapshot,
} from "@/lib/nav-counts";

function resolveNavCountsBranchScope(
  role: string | undefined,
  activeBranchId: number | null,
  userBranchId: number | null | undefined,
) {
  if (role === "SUPER_ADMIN") {
    return activeBranchId;
  }
  return activeBranchId ?? userBranchId ?? null;
}

export function useNavCounts(enabled = true) {
  const { user, activeBranchId, isInitialized } = useAuth();
  const role = user?.role;
  const queryBranchId = resolveNavCountsBranchScope(role, activeBranchId, user?.branchId);

  return useQuery({
    queryKey: [NAV_COUNTS_QUERY_KEY, queryBranchId ?? "all", role],
    queryFn: () =>
      fetchAPI(CORE_ENDPOINTS.navCounts(queryBranchId ?? undefined)) as Promise<
        NavCountsSnapshot & { branchId: number | null }
      >,
    enabled: enabled && !!user && isInitialized,
    staleTime: 60_000,
    refetchInterval: enabled ? NAV_COUNTS_REFETCH_MS : false,
    refetchOnWindowFocus: false,
    select: (data): NavCountsSnapshot => ({
      lowStock: data.lowStock,
      expiringBatches: data.expiringBatches,
      pendingTransfers: data.pendingTransfers,
      kdsOrders: data.kdsOrders,
      pendingPurchaseOrders: data.pendingPurchaseOrders,
      pendingSettlements: data.pendingSettlements,
      pendingLeave: data.pendingLeave,
    }),
  });
}
