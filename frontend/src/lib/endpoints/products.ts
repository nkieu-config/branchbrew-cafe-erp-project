export const PRODUCT_ENDPOINTS = {
  list: '/products',
  create: '/products',
  update: (id: number) => `/products/${id}`,
  delete: (id: number) => `/products/${id}`,
} as const;

export const MODIFIER_ENDPOINTS = {
  list: (category?: string) =>
    `/modifiers${category ? `?category=${encodeURIComponent(category)}` : ''}`,
  createGroup: '/modifiers/groups',
  updateGroup: (id: number) => `/modifiers/groups/${id}`,
  deleteGroup: (id: number) => `/modifiers/groups/${id}`,
  createOption: '/modifiers/options',
  updateOption: (id: number) => `/modifiers/options/${id}`,
  deleteOption: (id: number) => `/modifiers/options/${id}`,
} as const;

export const INGREDIENT_ENDPOINTS = {
  list: '/ingredients',
  create: '/ingredients',
  update: (id: number) => `/ingredients/${id}`,
  delete: (id: number) => `/ingredients/${id}`,
  branchInventory: (branchId?: number) =>
    `/ingredients/inventory/branch${branchId ? `?branchId=${branchId}` : ''}`,
  wasteLogs: (branchId?: number) =>
    `/ingredients/waste/logs${branchId ? `?branchId=${branchId}` : ''}`,
} as const;
