export const inventoryKeys = {
  balanceRoot: ["inventory-balance"] as const,
  balance: (branchId: number) => ["inventory-balance", branchId] as const,
  branchRoot: ["branch"] as const,
  branch: (branchId: number) => ["branch", branchId] as const,
  wasteLogsRoot: ["wasteLogs"] as const,
  wasteLogs: (branchId: number) => ["wasteLogs", branchId] as const,
};
