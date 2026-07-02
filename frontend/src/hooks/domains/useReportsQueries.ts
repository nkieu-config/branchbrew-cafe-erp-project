import { REPORT_ENDPOINTS } from "@/lib/endpoints/reports";
import { ORDER_ENDPOINTS } from "@/lib/endpoints/orders";
import { AUDIT_ENDPOINTS } from "@/lib/endpoints/accounting";
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { fetchAPI } from '@/lib/api';
import { analyticsKeys, orderKeys } from '@/lib/query-keys';

// ==========================================
// 📊 ANALYTICS & REPORTS HOOKS
// ==========================================
export const useAnalyticsSummary = (branchId?: string) => {
  return useQuery({
    queryKey: analyticsKeys.summary(branchId),
    queryFn: () => fetchAPI(REPORT_ENDPOINTS.executiveSummary(branchId)),
  });
};

export const useSalesTrends = (branchId?: string) => {
  const parsed =
    branchId && branchId !== 'ALL' ? Number(branchId) : undefined;
  return useQuery({
    queryKey: analyticsKeys.salesTrends(branchId),
    queryFn: () => fetchAPI(REPORT_ENDPOINTS.salesTrends(parsed)),
  });
};

export const useTopProducts = (branchId?: string) => {
  return useQuery({
    queryKey: analyticsKeys.topProducts(branchId),
    queryFn: () => fetchAPI(REPORT_ENDPOINTS.topProducts(branchId)),
  });
};

export const useAnalyticsSummarySuspense = (branchId?: string) => {
  return useSuspenseQuery({
    queryKey: analyticsKeys.summary(branchId),
    queryFn: () => fetchAPI(REPORT_ENDPOINTS.executiveSummary(branchId)),
  });
};

export const useTopProductsSuspense = (branchId?: string) => {
  return useSuspenseQuery({
    queryKey: analyticsKeys.topProducts(branchId),
    queryFn: () => fetchAPI(REPORT_ENDPOINTS.topProducts(branchId)),
  });
};

export const useSalesTrendsSuspense = (branchId?: string) => {
  const parsed = branchId && branchId !== 'ALL' ? Number(branchId) : undefined;
  return useSuspenseQuery({
    queryKey: analyticsKeys.salesTrends(branchId),
    queryFn: () => fetchAPI(REPORT_ENDPOINTS.salesTrends(parsed)),
  });
};

export const useOrders = () => {
  return useQuery({
    queryKey: orderKeys.root,
    queryFn: () => fetchAPI(ORDER_ENDPOINTS.list()),
  });
};

export const useAuditLogs = (limit: number = 100, offset: number = 0) => {
  return useQuery({
    queryKey: ['auditLogs', limit, offset],
    queryFn: () => fetchAPI(AUDIT_ENDPOINTS.logs(limit, offset)),
  });
};

