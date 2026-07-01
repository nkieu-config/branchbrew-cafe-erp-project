import { useQuery, useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { fetchAPI } from '@/lib/api';
import { inventoryKeys, invalidateInventoryBranch, invalidateNavCounts } from '@/lib/query-keys';

// ==========================================
// 📦 INVENTORY HOOKS
// ==========================================
export const useBranchDetails = (branchId?: number) => {
  return useQuery({
    queryKey: inventoryKeys.branch(branchId!),
    queryFn: () => fetchAPI(API_ENDPOINTS.branches.detail(branchId!)),
    enabled: !!branchId,
  });
};

export const useBranchDetailsSuspense = (branchId: number) => {
  return useSuspenseQuery({
    queryKey: inventoryKeys.branch(branchId),
    queryFn: () => fetchAPI(API_ENDPOINTS.branches.detail(branchId)),
  });
};

// Re-export transfer hooks from canonical module
export {
  useTransfers,
  useCreateTransfer,
  useAcceptTransfer,
} from './useTransferQueries';

export const useAddInventoryBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, data }: { branchId: number, data: unknown }) => fetchAPI(API_ENDPOINTS.branches.addBatch(branchId), { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.branch(variables.branchId) });
      invalidateNavCounts(queryClient);
    },
  });
};

export const useWasteLogs = (branchId?: number) => {
  return useQuery({
    queryKey: inventoryKeys.wasteLogs(branchId!),
    queryFn: () => fetchAPI(API_ENDPOINTS.ingredients.wasteLogs(branchId)),
    enabled: !!branchId,
  });
};

export const useReportWaste = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, data }: { branchId: number, data: unknown }) => fetchAPI(API_ENDPOINTS.branches.reportWaste(branchId), { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.wasteLogs(variables.branchId) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.branch(variables.branchId) });
      invalidateNavCounts(queryClient);
    },
  });
};

// ==========================================
// Stock transfers, waste logs, and related inventory hooks
// ==========================================
export function useBranchInventory(branchId?: number) {
  return useQuery({
    queryKey: inventoryKeys.balance(branchId!),
    queryFn: () => fetchAPI(API_ENDPOINTS.inventory.balance(branchId!)),
    enabled: !!branchId,
  });
}

export function useBranchInventorySuspense(branchId: number) {
  return useSuspenseQuery({
    queryKey: inventoryKeys.balance(branchId),
    queryFn: () => fetchAPI(API_ENDPOINTS.inventory.balance(branchId)),
  });
}

export function useStockIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { branchId: number; items: { ingredientId: number; quantity: number; expiryDate?: string }[] }) =>
      fetchAPI(API_ENDPOINTS.inventory.stockIn(data.branchId), {
        method: "POST",
        body: JSON.stringify({ items: data.items }),
      }),
    onSuccess: (_, variables) => {
      invalidateInventoryBranch(queryClient, variables.branchId);
      invalidateNavCounts(queryClient);
    },
  });
}

export function useRecordWaste() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { branchId: number; items: { ingredientId: number; quantity: number; reason: string }[] }) =>
      fetchAPI(API_ENDPOINTS.inventory.waste(data.branchId), {
        method: "POST",
        body: JSON.stringify({ items: data.items }),
      }),
    onSuccess: (_, variables) => {
      invalidateInventoryBranch(queryClient, variables.branchId);
      queryClient.invalidateQueries({ queryKey: inventoryKeys.wasteLogs(variables.branchId) });
      invalidateNavCounts(queryClient);
    },
  });
}
