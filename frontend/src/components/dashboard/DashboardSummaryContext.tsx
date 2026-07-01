"use client";

import { createContext, use, type ReactNode } from "react";
import { useAnalyticsSummarySuspense } from "@/hooks/domains/useReportsQueries";

export type DashboardExecutiveSummary = NonNullable<
  ReturnType<typeof useAnalyticsSummarySuspense>["data"]
>;

const DashboardSummaryContext = createContext<DashboardExecutiveSummary | null>(null);

export function DashboardSummaryProvider({
  branchId,
  children,
}: {
  branchId: string;
  children: ReactNode;
}) {
  const { data: summary } = useAnalyticsSummarySuspense(branchId);

  return (
    <DashboardSummaryContext.Provider value={summary ?? null}>
      {children}
    </DashboardSummaryContext.Provider>
  );
}

export function useDashboardSummary() {
  const summary = use(DashboardSummaryContext);
  if (!summary) {
    throw new Error("useDashboardSummary requires DashboardSummaryProvider");
  }
  return summary;
}
