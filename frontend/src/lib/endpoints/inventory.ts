export const INVENTORY_ENDPOINTS = {
  balance: (branchId: number) => `/inventory/branch/${branchId}/balance`,
  stockIn: (branchId: number) => `/inventory/branch/${branchId}/stock-in`,
  waste: (branchId: number) => `/inventory/branch/${branchId}/waste`,
} as const;
