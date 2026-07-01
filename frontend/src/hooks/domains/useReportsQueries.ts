import { useQuery, useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { fetchAPI } from '@/lib/api';
import { analyticsKeys, orderKeys } from '@/lib/query-keys';

// ==========================================
// 📊 ANALYTICS & REPORTS HOOKS
// ==========================================
export const useAnalyticsSummary = (branchId?: string) => {
  return useQuery({
    queryKey: analyticsKeys.summary(branchId),
    queryFn: () => fetchAPI(API_ENDPOINTS.reports.executiveSummary(branchId)),
  });
};

export const useSalesTrends = (branchId?: string) => {
  const parsed =
    branchId && branchId !== 'ALL' ? Number(branchId) : undefined;
  return useQuery({
    queryKey: analyticsKeys.salesTrends(branchId),
    queryFn: () => fetchAPI(API_ENDPOINTS.reports.salesTrends(parsed)),
  });
};

export const useTopProducts = (branchId?: string) => {
  return useQuery({
    queryKey: analyticsKeys.topProducts(branchId),
    queryFn: () => fetchAPI(API_ENDPOINTS.reports.topProducts(branchId)),
  });
};

export const useAnalyticsSummarySuspense = (branchId?: string) => {
  return useSuspenseQuery({
    queryKey: analyticsKeys.summary(branchId),
    queryFn: () => fetchAPI(API_ENDPOINTS.reports.executiveSummary(branchId)),
  });
};

export const useTopProductsSuspense = (branchId?: string) => {
  return useSuspenseQuery({
    queryKey: analyticsKeys.topProducts(branchId),
    queryFn: () => fetchAPI(API_ENDPOINTS.reports.topProducts(branchId)),
  });
};

export const useSalesTrendsSuspense = (branchId?: string) => {
  const parsed = branchId && branchId !== 'ALL' ? Number(branchId) : undefined;
  return useSuspenseQuery({
    queryKey: analyticsKeys.salesTrends(branchId),
    queryFn: () => fetchAPI(API_ENDPOINTS.reports.salesTrends(parsed)),
  });
};

export const useOrders = () => {
  return useQuery({
    queryKey: orderKeys.root,
    queryFn: () => fetchAPI(API_ENDPOINTS.orders.list()),
  });
};

export const useAuditLogs = (limit: number = 100, offset: number = 0) => {
  return useQuery({
    queryKey: ['auditLogs', limit, offset],
    queryFn: () => fetchAPI(API_ENDPOINTS.audit.logs(limit, offset)),
  });
};

