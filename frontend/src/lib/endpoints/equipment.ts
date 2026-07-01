export const EQUIPMENT_ENDPOINTS = {
  list: (branchId?: number) => `/equipment${branchId ? `?branchId=${branchId}` : ''}`,
  create: '/equipment',
  update: (id: number) => `/equipment/${id}`,
  maintenance: (id: number) => `/equipment/${id}/maintenance`,
} as const;
