"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { fetchAPI } from "@/lib/api";
import {
  computeSidebarChildTabBadges,
  computeSidebarNavBadges,
  type SidebarNavBadgeMap,
} from "@/lib/sidebar-badges";

const BADGE_REFETCH_MS = 120_000;

type SidebarBadgesContextValue = {
  badges: SidebarNavBadgeMap;
  childTabBadges: SidebarNavBadgeMap;
};

const SidebarBadgesContext = createContext<SidebarBadgesContextValue | null>(null);

function resolveBadgeBranchScope(
  role: string | undefined,
  activeBranchId: number | null,
  userBranchId: number | null | undefined,
) {
  if (role === "SUPER_ADMIN") {
    return {
      queryBranchId: activeBranchId,
      summaryBranchKey: activeBranchId != null ? String(activeBranchId) : "ALL",
    };
  }

  const effectiveBranchId = activeBranchId ?? userBranchId ?? null;
  return {
    queryBranchId: effectiveBranchId,
    summaryBranchKey: effectiveBranchId != null ? String(effectiveBranchId) : "ALL",
  };
}

export function SidebarBadgesProvider({ children }: { children: ReactNode }) {
  const { user, activeBranchId, isInitialized } = useAuth();
  const role = user?.role;
  const enabled = !!user && isInitialized;
  const isManagerOrAdmin = role === "SUPER_ADMIN" || role === "MANAGER";
  const { queryBranchId, summaryBranchKey } = resolveBadgeBranchScope(
    role,
    activeBranchId,
    user?.branchId,
  );

  const { data: summary } = useQuery({
    queryKey: ["analyticsSummary", summaryBranchKey],
    queryFn: () => fetchAPI(API_ENDPOINTS.reports.executiveSummary(summaryBranchKey)),
    enabled,
    staleTime: 60_000,
    refetchInterval: BADGE_REFETCH_MS,
  });

  const { data: purchaseOrders } = useQuery({
    queryKey: ["purchaseOrders"],
    queryFn: () => fetchAPI(API_ENDPOINTS.procurement.purchaseOrders),
    enabled: enabled && isManagerOrAdmin,
    staleTime: 60_000,
    refetchInterval: BADGE_REFETCH_MS,
  });

  const { data: settlements } = useQuery({
    queryKey: ["financeSettlements", queryBranchId],
    queryFn: () => fetchAPI(API_ENDPOINTS.finance.settlements(queryBranchId ?? undefined)),
    enabled: enabled && isManagerOrAdmin,
    staleTime: 60_000,
    refetchInterval: BADGE_REFETCH_MS,
  });

  const { data: leaveRequests } = useQuery({
    queryKey: ["leaveRequests", queryBranchId, isManagerOrAdmin],
    queryFn: () =>
      fetchAPI(
        isManagerOrAdmin ? API_ENDPOINTS.hr.leave(queryBranchId ?? undefined) : API_ENDPOINTS.hr.leaveMe,
      ),
    enabled: enabled && isManagerOrAdmin,
    staleTime: 60_000,
    refetchInterval: BADGE_REFETCH_MS,
  });

  const { data: transfers } = useQuery({
    queryKey: ["transfers", queryBranchId ?? "all"],
    queryFn: () =>
      fetchAPI(
        queryBranchId != null
          ? API_ENDPOINTS.branches.transfers(queryBranchId)
          : API_ENDPOINTS.branches.transfersAll,
      ),
    enabled,
    staleTime: 60_000,
    refetchInterval: BADGE_REFETCH_MS,
  });

  const badgeInput = useMemo(
    () => ({
      role,
      summary,
      purchaseOrders,
      settlements,
      leaveRequests,
      transfers,
      activeBranchId: queryBranchId,
    }),
    [role, summary, purchaseOrders, settlements, leaveRequests, transfers, queryBranchId],
  );

  const badges = useMemo(() => computeSidebarNavBadges(badgeInput), [badgeInput]);
  const childTabBadges = useMemo(() => computeSidebarChildTabBadges(badgeInput), [badgeInput]);

  const value = useMemo(
    () => ({ badges, childTabBadges }),
    [badges, childTabBadges],
  );

  return <SidebarBadgesContext.Provider value={value}>{children}</SidebarBadgesContext.Provider>;
}

export function useSidebarNavBadges() {
  const context = useContext(SidebarBadgesContext);
  if (!context) {
    throw new Error("useSidebarNavBadges must be used within SidebarBadgesProvider");
  }
  return context;
}
