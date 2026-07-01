import { BRANCH_ENDPOINTS } from "@/lib/endpoints/branches";
import { INGREDIENT_ENDPOINTS } from "@/lib/endpoints/products";
import { INVENTORY_ENDPOINTS } from "@/lib/endpoints/inventory";
import { useQuery, useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { fetchAPI } from '@/lib/api';
import { inventoryKeys, invalidateInventoryBranch, invalidateNavCounts } from '@/lib/query-keys';

// ==========================================
// 📦 INVENTORY HOOKS
// ==========================================
export const useBranchDetails = (branchId?: number) => {
  return useQuery({
    queryKey: inventoryKeys.branch(branchId!),
    queryFn: () => fetchAPI(BRANCH_ENDPOINTS.detail(branchId!)),
    enabled: !!branchId,
  });
};

export const useBranchDetailsSuspense = (branchId: number) => {
  return useSuspenseQuery({
    queryKey: inventoryKeys.branch(branchId),
    queryFn: () => fetchAPI(BRANCH_ENDPOINTS.detail(branchId)),
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
    mutationFn: ({ branchId, data }: { branchId: number, data: unknown }) => fetchAPI(BRANCH_ENDPOINTS.addBatch(branchId), { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.branch(variables.branchId) });
      invalidateNavCounts(queryClient);
    },
  });
};

export const useWasteLogs = (branchId?: number) => {
  return useQuery({
    queryKey: inventoryKeys.wasteLogs(branchId!),
    queryFn: () => fetchAPI(INGREDIENT_ENDPOINTS.wasteLogs(branchId)),
    enabled: !!branchId,
  });
};

export const useReportWaste = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, data }: { branchId: number, data: unknown }) => fetchAPI(BRANCH_ENDPOINTS.reportWaste(branchId), { method: 'POST', body: JSON.stringify(data) }),
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
    queryFn: () => fetchAPI(INVENTORY_ENDPOINTS.balance(branchId!)),
    enabled: !!branchId,
  });
}

export function useBranchInventorySuspense(branchId: number) {
  return useSuspenseQuery({
    queryKey: inventoryKeys.balance(branchId),
    queryFn: () => fetchAPI(INVENTORY_ENDPOINTS.balance(branchId)),
  });
}

export function useStockIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { branchId: number; items: { ingredientId: number; quantity: number; expiryDate?: string }[] }) =>
      fetchAPI(INVENTORY_ENDPOINTS.stockIn(data.branchId), {
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
      fetchAPI(INVENTORY_ENDPOINTS.waste(data.branchId), {
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
