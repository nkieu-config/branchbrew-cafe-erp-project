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

// ==========================================
// Stock counts (stocktake) and adjustments
// ==========================================
export function useStockCounts(branchId?: number) {
  return useQuery({
    queryKey: inventoryKeys.stockCounts(branchId!),
    queryFn: () => fetchAPI(INVENTORY_ENDPOINTS.stockCounts(branchId!)),
    enabled: !!branchId,
  });
}

export function useStockCount(id?: number) {
  return useQuery({
    queryKey: inventoryKeys.stockCount(id!),
    queryFn: () => fetchAPI(INVENTORY_ENDPOINTS.stockCount(id!)),
    enabled: !!id,
  });
}

function invalidateStockCounts(
  queryClient: ReturnType<typeof useQueryClient>,
  branchId: number,
  id?: number,
) {
  queryClient.invalidateQueries({ queryKey: inventoryKeys.stockCounts(branchId) });
  if (id) {
    queryClient.invalidateQueries({ queryKey: inventoryKeys.stockCount(id) });
  }
  invalidateNavCounts(queryClient);
}

export function useCreateStockCount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { branchId: number; isBlind?: boolean; notes?: string }) =>
      fetchAPI(INVENTORY_ENDPOINTS.stockCounts(data.branchId), {
        method: "POST",
        body: JSON.stringify({ isBlind: data.isBlind, notes: data.notes || undefined }),
      }),
    onSuccess: (_, variables) => {
      invalidateStockCounts(queryClient, variables.branchId);
    },
  });
}

export function useUpdateStockCountLines() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      id: number;
      branchId: number;
      lines: { ingredientId: number; countedQty: number }[];
    }) =>
      fetchAPI(INVENTORY_ENDPOINTS.stockCountLines(data.id), {
        method: "PATCH",
        body: JSON.stringify({ lines: data.lines }),
      }),
    onSuccess: (_, variables) => {
      invalidateStockCounts(queryClient, variables.branchId, variables.id);
    },
  });
}

export function useSubmitStockCount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: number; branchId: number }) =>
      fetchAPI(INVENTORY_ENDPOINTS.stockCountSubmit(data.id), { method: "POST" }),
    onSuccess: (_, variables) => {
      invalidateStockCounts(queryClient, variables.branchId, variables.id);
    },
  });
}

export function useApproveStockCount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: number; branchId: number }) =>
      fetchAPI(INVENTORY_ENDPOINTS.stockCountApprove(data.id), { method: "POST" }),
    onSuccess: (_, variables) => {
      invalidateStockCounts(queryClient, variables.branchId, variables.id);
      invalidateInventoryBranch(queryClient, variables.branchId);
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.adjustments(variables.branchId),
      });
    },
  });
}

export function useCancelStockCount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: number; branchId: number }) =>
      fetchAPI(INVENTORY_ENDPOINTS.stockCountCancel(data.id), { method: "POST" }),
    onSuccess: (_, variables) => {
      invalidateStockCounts(queryClient, variables.branchId, variables.id);
    },
  });
}

export function useStockAdjustments(branchId?: number) {
  return useQuery({
    queryKey: inventoryKeys.adjustments(branchId!),
    queryFn: () => fetchAPI(INVENTORY_ENDPOINTS.adjustments(branchId!)),
    enabled: !!branchId,
  });
}

export function useCreateStockAdjustment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      branchId: number;
      ingredientId: number;
      quantityDelta: number;
      reason: "DAMAGE" | "CORRECTION";
      notes?: string;
    }) =>
      fetchAPI(INVENTORY_ENDPOINTS.adjustments(data.branchId), {
        method: "POST",
        body: JSON.stringify({
          ingredientId: data.ingredientId,
          quantityDelta: data.quantityDelta,
          reason: data.reason,
          notes: data.notes || undefined,
        }),
      }),
    onSuccess: (_, variables) => {
      invalidateInventoryBranch(queryClient, variables.branchId);
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.adjustments(variables.branchId),
      });
      invalidateNavCounts(queryClient);
    },
  });
}
