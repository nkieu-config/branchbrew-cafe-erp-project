export const CORE_ENDPOINTS = {
  health: '/health',
  navCounts: (branchId?: number | null) =>
    branchId != null
      ? `/nav-counts?branchId=${branchId}`
      : '/nav-counts',
} as const;
