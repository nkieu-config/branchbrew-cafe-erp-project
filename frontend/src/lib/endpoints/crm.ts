export const CUSTOMER_ENDPOINTS = {
  list: (search?: string) =>
    `/customers${search ? `?search=${encodeURIComponent(search)}` : ''}`,
  create: '/customers',
  byPhone: (phone: string) => `/customers/phone/${phone}`,
  detail360: (id: number) => `/customers/${id}/360`,
  detail: (id: number) => `/customers/${id}`,
} as const;

export const PROMOTION_ENDPOINTS = {
  list: '/promotions',
  create: '/promotions',
  validate: '/promotions/validate',
  update: (id: number) => `/promotions/${id}`,
  delete: (id: number) => `/promotions/${id}`,
  toggle: (id: number) => `/promotions/${id}/toggle`,
} as const;
