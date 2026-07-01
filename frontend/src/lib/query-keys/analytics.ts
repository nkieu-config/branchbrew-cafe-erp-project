export const analyticsKeys = {
  summaryRoot: ["analyticsSummary"] as const,
  summary: (branchId?: string) => ["analyticsSummary", branchId] as const,
  salesTrendsRoot: ["salesTrends"] as const,
  salesTrends: (branchId?: string) => ["salesTrends", branchId] as const,
  topProductsRoot: ["topProducts"] as const,
  topProducts: (branchId?: string) => ["topProducts", branchId] as const,
};
