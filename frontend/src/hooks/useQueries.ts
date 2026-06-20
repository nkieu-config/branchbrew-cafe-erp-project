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

// ==========================================
// 💰 ACCOUNTING HOOKS
// ==========================================

export const useLedger = (branchId?: string) => {
  return useQuery({
    queryKey: ['ledger', branchId],
    queryFn: () => fetchAPI(branchId && branchId !== "ALL" ? `/accounting/profit-loss?branchId=${branchId}` : '/accounting/profit-loss'),
  });
};

export const useJournalEntries = (branchId?: string) => {
  return useQuery({
    queryKey: ['journalEntries', branchId],
    queryFn: () => fetchAPI(branchId && branchId !== "ALL" ? `/accounting/journal?branchId=${branchId}` : '/accounting/journal'),
  });
};

// ==========================================
// 🍳 KITCHEN & PRODUCTION HOOKS
// ==========================================

export const useKitchenOrders = () => {
  return useQuery({
    queryKey: ['kitchenOrders'],
    queryFn: () => fetchAPI('/production/orders'),
    // Poll every 10 seconds for real-time kitchen updates
    refetchInterval: 10000, 
  });
};

export const useIngredients = () => {
  return useQuery({
    queryKey: ['ingredients'],
    queryFn: () => fetchAPI('/inventory/ingredients'),
  });
};

export const useCompleteKitchenOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => fetchAPI(`/production/orders/${id}/complete`, { method: 'PATCH' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchenOrders'] });
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number, status: string }) => fetchAPI(`/production/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchenOrders'] });
    },
  });
};

export const useCreateProductionOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => fetchAPI('/production/orders', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchenOrders'] });
    },
  });
};

// ==========================================
// 🌍 GENERAL HOOKS
// ==========================================

export const useBranches = () => {
  return useQuery({
    queryKey: ['branches'],
    queryFn: () => fetchAPI('/branches'),
    staleTime: Infinity, // Branches rarely change
  });
};
