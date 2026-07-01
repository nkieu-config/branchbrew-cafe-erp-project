export const PROCUREMENT_ENDPOINTS = {
  purchaseOrders: '/purchase-orders',
  createPurchaseOrder: '/purchase-orders',
  approvePurchaseOrder: (id: number) => `/purchase-orders/${id}/approve`,
  submitPurchaseOrder: (id: number) => `/purchase-orders/${id}/submit`,
  rejectPurchaseOrder: (id: number) => `/purchase-orders/${id}/reject`,
  receivePurchaseOrder: (id: number) => `/purchase-orders/${id}/receive`,
  suppliers: '/suppliers',
  createSupplier: '/suppliers',
  updateSupplier: (id: number) => `/suppliers/${id}`,
  deleteSupplier: (id: number) => `/suppliers/${id}`,
} as const;
