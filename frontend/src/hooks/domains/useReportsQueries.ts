import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAPI } from '@/lib/api';

// ==========================================
// 📊 ANALYTICS & REPORTS HOOKS
// ==========================================
export const useAnalyticsSummary = (branchId?: string) => {
  return useQuery({
    queryKey: ['analyticsSummary', branchId],
    queryFn: () => fetchAPI(branchId && branchId !== "ALL" ? `/reports/executive?branchId=${branchId}` : '/reports/executive'),
  });
};

export const useTopProducts = (branchId?: string) => {
  return useQuery({
    queryKey: ['topProducts', branchId],
    queryFn: () => fetchAPI(branchId && branchId !== "ALL" ? `/reports/top-products?branchId=${branchId}` : '/reports/top-products'),
  });
};

export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => fetchAPI('/orders'),
  });
};

export const useAuditLogs = (limit: number = 100, skip: number = 0) => {
  return useQuery({
    queryKey: ['auditLogs', limit, skip],
    queryFn: () => fetchAPI(`/audit?limit=${limit}&skip=${skip}`),
  });
};

