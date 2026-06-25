import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { fetchAPI } from '@/lib/api';

// ==========================================
// 📦 INVENTORY HOOKS
// ==========================================
export const useBranchDetails = (branchId?: number) => {
  return useQuery({
    queryKey: ['branch', branchId],
    queryFn: () => fetchAPI(API_ENDPOINTS.branches.detail(branchId!)),
    enabled: !!branchId,
  });
};

export const useTransfers = (branchId?: number) => {
  return useQuery({
    queryKey: ['transfers', branchId],
    queryFn: () => fetchAPI(API_ENDPOINTS.branches.transfers(branchId!)),
    enabled: !!branchId,
  });
};

export const useCreateTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => fetchAPI(API_ENDPOINTS.branches.createTransfer, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries({ queryKey: ['transfers', variables.fromBranchId] });
      queryClient.invalidateQueries({ queryKey: ['branch', variables.fromBranchId] });
    },
  });
};

export const useAcceptTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ transferId, branchId }: { transferId: number, branchId: number }) => fetchAPI(API_ENDPOINTS.branches.acceptTransfer(transferId), { method: 'POST' }),
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries({ queryKey: ['transfers', variables.branchId] });
      queryClient.invalidateQueries({ queryKey: ['branch', variables.branchId] });
    },
  });
};

export const useAddInventoryBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, data }: { branchId: number, data: unknown }) => fetchAPI(API_ENDPOINTS.branches.addBatch(branchId), { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries({ queryKey: ['branch', variables.branchId] });
    },
  });
};

export const useWasteLogs = (branchId?: number) => {
  return useQuery({
    queryKey: ['wasteLogs', branchId],
    queryFn: () => fetchAPI(API_ENDPOINTS.ingredients.wasteLogs(branchId)),
    enabled: !!branchId,
  });
};

export const useReportWaste = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, data }: { branchId: number, data: unknown }) => fetchAPI(API_ENDPOINTS.branches.reportWaste(branchId), { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries({ queryKey: ['wasteLogs', variables.branchId] });
      queryClient.invalidateQueries({ queryKey: ['branch', variables.branchId] });
    },
  });
};

// ==========================================
// 🚀 NEW INVENTORY MODULE HOOKS (PHASE 2)
// ==========================================
export function useBranchInventory(branchId?: number) {
  return useQuery({
    queryKey: ["inventory-balance", branchId],
    queryFn: () => fetchAPI(API_ENDPOINTS.inventory.balance(branchId!)),
    enabled: !!branchId,
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
      queryClient.invalidateQueries({ queryKey: ["inventory-balance", variables.branchId] });
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
      queryClient.invalidateQueries({ queryKey: ["inventory-balance", variables.branchId] });
      queryClient.invalidateQueries({ queryKey: ["wasteLogs", variables.branchId] });
    },
  });
}
