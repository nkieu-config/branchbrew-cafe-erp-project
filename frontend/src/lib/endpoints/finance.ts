export const FINANCE_ENDPOINTS = {
  expenses: (branchId?: number) =>
    `/finance/expenses${branchId ? `?branchId=${branchId}` : ''}`,
  createExpense: '/finance/expenses',
  settlements: (branchId?: number) =>
    `/finance/settlements${branchId ? `?branchId=${branchId}` : ''}`,
  submitSettlement: '/finance/settlements',
  expectedCash: (branchId: number) => `/finance/settlements/expected?branchId=${branchId}`,
  approveSettlement: (id: number) => `/finance/settlements/${id}/approve`,
  exportSales: (branchId?: number, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (branchId) params.append('branchId', String(branchId));
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const qs = params.toString();
    return `/finance/export/sales${qs ? `?${qs}` : ''}`;
  },
} as const;
