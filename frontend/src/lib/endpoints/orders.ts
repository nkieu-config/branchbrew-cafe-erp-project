export const ORDER_ENDPOINTS = {
  list: (branchId?: number) =>
    branchId ? `/orders?branchId=${branchId}` : '/orders',
  create: '/orders',
  kds: (branchId: number) => `/orders/kds?branchId=${branchId}`,
  updateStatus: (id: number) => `/orders/${id}/status`,
  detail: (id: number) => `/orders/${id}`,
  void: (id: number) => `/orders/${id}/void`,
  refund: (id: number) => `/orders/${id}/refund`,
} as const;
