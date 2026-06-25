import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { fetchAPI } from '@/lib/api';

// ==========================================
// 💸 FINANCE & SETTLEMENT HOOKS
// ==========================================
export const useFinanceSettlements = (branchId?: number) => {
  return useQuery({
    queryKey: ['financeSettlements', branchId],
    queryFn: () => fetchAPI(API_ENDPOINTS.finance.settlements(branchId)),
  });
};

export const useFinanceExpenses = (branchId?: number) => {
  return useQuery({
    queryKey: ['financeExpenses', branchId],
    queryFn: () => fetchAPI(API_ENDPOINTS.finance.expenses(branchId)),
  });
};

export const useApproveSettlement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => fetchAPI(API_ENDPOINTS.finance.approveSettlement(id), { method: 'PATCH' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['financeSettlements'] }),
  });
};

export const useExpectedCash = (branchId?: number) => {
  return useQuery({
    queryKey: ['expectedCash', branchId],
    queryFn: () => fetchAPI(API_ENDPOINTS.finance.expectedCash(branchId!)),
    enabled: !!branchId,
  });
};

export const useSubmitSettlement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { branchId: number; actualCash: number; actualCreditCard: number; actualQR: number }) => 
      fetchAPI(API_ENDPOINTS.finance.submitSettlement, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['financeSettlements'] }),
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { branchId: number; amount: number; category: string; description?: string }) => 
      fetchAPI(API_ENDPOINTS.finance.createExpense, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['financeExpenses'] }),
  });
};

