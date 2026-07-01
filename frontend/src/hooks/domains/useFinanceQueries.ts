import { FINANCE_ENDPOINTS } from "@/lib/endpoints/finance";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAPI } from '@/lib/api';
import { NAV_COUNTS_QUERY_KEY } from '@/lib/nav-counts';

// ==========================================
// 💸 FINANCE & SETTLEMENT HOOKS
// ==========================================
export const useFinanceSettlements = (branchId?: number) => {
  return useQuery({
    queryKey: ['financeSettlements', branchId],
    queryFn: () => fetchAPI(FINANCE_ENDPOINTS.settlements(branchId)),
  });
};

export const useFinanceExpenses = (branchId?: number) => {
  return useQuery({
    queryKey: ['financeExpenses', branchId],
    queryFn: () => fetchAPI(FINANCE_ENDPOINTS.expenses(branchId)),
  });
};

export const useApproveSettlement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => fetchAPI(FINANCE_ENDPOINTS.approveSettlement(id), { method: 'PATCH' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financeSettlements'] });
      queryClient.invalidateQueries({ queryKey: [NAV_COUNTS_QUERY_KEY] });
    },
  });
};

export const useExpectedCash = (branchId?: number) => {
  return useQuery({
    queryKey: ['expectedCash', branchId],
    queryFn: () => fetchAPI(FINANCE_ENDPOINTS.expectedCash(branchId!)),
    enabled: !!branchId,
  });
};

export const useSubmitSettlement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { branchId: number; actualCash: number; actualCreditCard: number; actualQR: number }) => 
      fetchAPI(FINANCE_ENDPOINTS.submitSettlement, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['financeSettlements'] });
      queryClient.invalidateQueries({ queryKey: ['expectedCash', variables.branchId] });
      queryClient.invalidateQueries({ queryKey: [NAV_COUNTS_QUERY_KEY] });
    },
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { branchId: number; amount: number; category: string; description?: string }) => 
      fetchAPI(FINANCE_ENDPOINTS.createExpense, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['financeExpenses'] });
      queryClient.invalidateQueries({ queryKey: ['expectedCash', variables.branchId] });
      queryClient.invalidateQueries({ queryKey: [NAV_COUNTS_QUERY_KEY] });
    },
  });
};

