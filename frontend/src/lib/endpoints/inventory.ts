export const INVENTORY_ENDPOINTS = {
  balance: (branchId: number) => `/inventory/branch/${branchId}/balance`,
  stockIn: (branchId: number) => `/inventory/branch/${branchId}/stock-in`,
  waste: (branchId: number) => `/inventory/branch/${branchId}/waste`,
  stockCounts: (branchId: number) => `/inventory/branch/${branchId}/stock-counts`,
  stockCount: (id: number) => `/inventory/stock-counts/${id}`,
  stockCountLines: (id: number) => `/inventory/stock-counts/${id}/lines`,
  stockCountSubmit: (id: number) => `/inventory/stock-counts/${id}/submit`,
  stockCountApprove: (id: number) => `/inventory/stock-counts/${id}/approve`,
  stockCountCancel: (id: number) => `/inventory/stock-counts/${id}/cancel`,
  adjustments: (branchId: number) => `/inventory/branch/${branchId}/adjustments`,
} as const;
