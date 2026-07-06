export const inventoryKeys = {
  balanceRoot: ["inventory-balance"] as const,
  balance: (branchId: number) => ["inventory-balance", branchId] as const,
  branchRoot: ["branch"] as const,
  branch: (branchId: number) => ["branch", branchId] as const,
  wasteLogsRoot: ["wasteLogs"] as const,
  wasteLogs: (branchId: number) => ["wasteLogs", branchId] as const,
  stockCountsRoot: ["stockCounts"] as const,
  stockCounts: (branchId: number) => ["stockCounts", branchId] as const,
  stockCount: (id: number) => ["stockCount", id] as const,
  adjustmentsRoot: ["stockAdjustments"] as const,
  adjustments: (branchId: number) => ["stockAdjustments", branchId] as const,
};
