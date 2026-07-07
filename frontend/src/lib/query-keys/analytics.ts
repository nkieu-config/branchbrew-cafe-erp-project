export const analyticsKeys = {
  summaryRoot: ["analyticsSummary"] as const,
  summary: (branchId?: string) => ["analyticsSummary", branchId] as const,
  salesTrendsRoot: ["salesTrends"] as const,
  salesTrends: (branchId?: string, days?: number) =>
    ["salesTrends", branchId, days] as const,
  topProductsRoot: ["topProducts"] as const,
  topProducts: (branchId?: string) => ["topProducts", branchId] as const,
  profitLossRoot: ["profitLoss"] as const,
  profitLoss: (branchId?: string) => ["profitLoss", branchId] as const,
};
