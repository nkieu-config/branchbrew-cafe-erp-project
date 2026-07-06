import { PROCUREMENT_ENDPOINTS } from "@/lib/endpoints/procurement";
import { EQUIPMENT_ENDPOINTS } from "@/lib/endpoints/equipment";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAPI } from '@/lib/api';
import { NAV_COUNTS_QUERY_KEY } from '@/lib/nav-counts';
import { inventoryKeys } from '@/lib/query-keys';

// ==========================================
// 🛒 PROCUREMENT HOOKS
// ==========================================
export const usePurchaseOrders = () => {
  return useQuery({
    queryKey: ['purchaseOrders'],
    queryFn: () => fetchAPI(PROCUREMENT_ENDPOINTS.purchaseOrders),
  });
};

export const useSuppliers = () => {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: () => fetchAPI(PROCUREMENT_ENDPOINTS.suppliers),
  });
};

export const useCreatePurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => fetchAPI(PROCUREMENT_ENDPOINTS.createPurchaseOrder, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      queryClient.invalidateQueries({ queryKey: [NAV_COUNTS_QUERY_KEY] });
    },
  });
};

export const useSubmitPurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      fetchAPI(PROCUREMENT_ENDPOINTS.submitPurchaseOrder(id), {
        method: 'PATCH',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      queryClient.invalidateQueries({ queryKey: [NAV_COUNTS_QUERY_KEY] });
    },
  });
};

export const useApprovePurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => fetchAPI(PROCUREMENT_ENDPOINTS.approvePurchaseOrder(id), { method: 'PATCH' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      queryClient.invalidateQueries({ queryKey: [NAV_COUNTS_QUERY_KEY] });
    },
  });
};

export const useRejectPurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => fetchAPI(PROCUREMENT_ENDPOINTS.rejectPurchaseOrder(id), { method: 'PATCH' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      queryClient.invalidateQueries({ queryKey: [NAV_COUNTS_QUERY_KEY] });
    },
  });
};

export const useReceivePurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      items,
    }: {
      id: number;
      items?: { ingredientId: number; expiryDate?: string }[];
    }) =>
      fetchAPI(PROCUREMENT_ENDPOINTS.receivePurchaseOrder(id), {
        method: 'POST',
        body: JSON.stringify(items?.length ? { items } : {}),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.branchRoot });
      queryClient.invalidateQueries({ queryKey: [NAV_COUNTS_QUERY_KEY] });
    },
  });
};

export const usePayPurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      method,
      notes,
    }: {
      id: number;
      method: 'CASH' | 'BANK_TRANSFER';
      notes?: string;
    }) =>
      fetchAPI(PROCUREMENT_ENDPOINTS.payPurchaseOrder(id), {
        method: 'POST',
        body: JSON.stringify({ method, notes: notes || undefined }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      queryClient.invalidateQueries({ queryKey: ['apAging'] });
      queryClient.invalidateQueries({ queryKey: [NAV_COUNTS_QUERY_KEY] });
    },
  });
};

export const useApAging = (enabled = true) => {
  return useQuery({
    queryKey: ['apAging'],
    queryFn: () => fetchAPI(PROCUREMENT_ENDPOINTS.apAging),
    enabled,
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; contactEmail?: string; phone?: string }) =>
      fetchAPI(PROCUREMENT_ENDPOINTS.createSupplier, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['suppliers'] }),
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: number;
      name?: string;
      contactEmail?: string;
      phone?: string;
    }) =>
      fetchAPI(PROCUREMENT_ENDPOINTS.updateSupplier(id), {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['suppliers'] }),
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      fetchAPI(PROCUREMENT_ENDPOINTS.deleteSupplier(id), { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['suppliers'] }),
  });
};

export {
  useTransfers,
  useCreateTransfer,
  useAcceptTransfer,
} from './useTransferQueries';

export const useEquipment = (branchId?: number) => {
  return useQuery({
    queryKey: ['equipment', branchId],
    queryFn: () => fetchAPI(EQUIPMENT_ENDPOINTS.list(branchId)),
  });
};

export const useCreateEquipment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { branchId: number } & Record<string, unknown>) =>
      fetchAPI(EQUIPMENT_ENDPOINTS.create, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (_, variables) => queryClient.invalidateQueries({ queryKey: ['equipment', variables.branchId] }),
  });
};

export const useLogMaintenance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number, data: unknown }) => fetchAPI(EQUIPMENT_ENDPOINTS.maintenance(id), { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['equipment'] }),
  });
};

