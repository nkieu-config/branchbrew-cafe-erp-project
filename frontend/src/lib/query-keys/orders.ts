export const orderKeys = {
  root: ["orders"] as const,
  branch: (branchId?: number) => ["orders", branchId] as const,
  products: ["products"] as const,
};
