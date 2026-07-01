export const BRANCH_ENDPOINTS = {
  list: '/branches',
  create: '/branches',
  update: (id: number) => `/branches/${id}`,
  detail: (id: number) => `/branches/${id}`,
  transfers: (id: number) => `/branches/${id}/transfers`,
  transfersAll: '/branches/transfers/all',
  createTransfer: '/branches/transfers',
  acceptTransfer: (id: number) => `/branches/transfers/${id}/accept`,
  addBatch: (id: number) => `/branches/${id}/batches`,
  reportWaste: (id: number) => `/branches/${id}/waste`,
} as const;
