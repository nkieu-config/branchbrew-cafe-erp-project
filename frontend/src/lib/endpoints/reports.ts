export const REPORT_ENDPOINTS = {
  executiveSummary: (branchId?: number | string) => {
    if (branchId && branchId !== 'ALL') return `/reports/executive-summary?branchId=${branchId}`;
    return '/reports/executive-summary';
  },
  topProducts: (branchId?: number | string) => {
    if (branchId && branchId !== 'ALL') return `/reports/top-products?branchId=${branchId}`;
    return '/reports/top-products';
  },
  salesTrends: (branchId?: number) =>
    `/reports/sales-trends${branchId ? `?branchId=${branchId}` : ''}`,
  profitLoss: (branchId?: number) =>
    `/reports/profit-loss${branchId ? `?branchId=${branchId}` : ''}`,
} as const;
