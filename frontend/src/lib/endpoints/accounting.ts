export const ACCOUNTING_ENDPOINTS = {
  accounts: '/accounting/accounts',
  journalEntries: (branchId?: number | string) => {
    if (branchId && branchId !== 'ALL') return `/accounting/journal-entries?branchId=${branchId}`;
    return '/accounting/journal-entries';
  },
  profitLoss: (branchId?: number | string) => {
    if (branchId && branchId !== 'ALL') return `/accounting/profit-loss?branchId=${branchId}`;
    return '/accounting/profit-loss';
  },
  vatReport: (branchId?: number | string) => {
    if (branchId && branchId !== 'ALL') return `/accounting/vat-report?branchId=${branchId}`;
    return '/accounting/vat-report';
  },
  seed: '/accounting/seed',
} as const;

export const NOTIFICATION_ENDPOINTS = {
  list: '/notifications',
  markRead: (id: number) => `/notifications/${id}/read`,
  markAllRead: '/notifications/read-all',
} as const;

export const AUDIT_ENDPOINTS = {
  logs: (limit: number, offset: number) => `/audit?limit=${limit}&offset=${offset}`,
} as const;
