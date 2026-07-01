export const transferKeys = {
  root: ["transfers"] as const,
  branch: (branchId?: number) => ["transfers", branchId ?? "all"] as const,
};
