export const PRODUCTION_ENDPOINTS = {
  orders: '/production/orders',
  createOrder: '/production/orders',
  updateStatus: (id: number) => `/production/orders/${id}/status`,
  complete: (id: number) => `/production/orders/${id}/complete`,
  boms: '/production/boms',
  createBom: '/production/boms',
} as const;
