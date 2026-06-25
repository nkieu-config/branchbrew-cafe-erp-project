import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { fetchAPI } from '@/lib/api';

// ==========================================
// 🛒 PROCUREMENT HOOKS
// ==========================================
export const usePurchaseOrders = () => {
  return useQuery({
    queryKey: ['purchaseOrders'],
    queryFn: () => fetchAPI(API_ENDPOINTS.procurement.purchaseOrders),
  });
};

export const useSuppliers = () => {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: () => fetchAPI(API_ENDPOINTS.procurement.suppliers),
  });
};

export const useCreatePurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => fetchAPI(API_ENDPOINTS.procurement.createPurchaseOrder, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] }),
  });
};

export const useApprovePurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => fetchAPI(API_ENDPOINTS.procurement.approvePurchaseOrder(id), { method: 'PATCH' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] }),
  });
};

export const useRejectPurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => fetchAPI(API_ENDPOINTS.procurement.rejectPurchaseOrder(id), { method: 'PATCH' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] }),
  });
};

export const useReceivePurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => fetchAPI(API_ENDPOINTS.procurement.receivePurchaseOrder(id), { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] }),
  });
};

export const useTransfers = (branchId?: number) => {
  return useQuery({
    queryKey: ['transfers', branchId],
    queryFn: () => fetchAPI(branchId ? API_ENDPOINTS.branches.transfers(branchId) : API_ENDPOINTS.branches.transfersAll),
  });
};

export const useCreateTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => fetchAPI(API_ENDPOINTS.branches.createTransfer, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transfers'] }),
  });
};

export const useAcceptTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => fetchAPI(API_ENDPOINTS.branches.acceptTransfer(id), { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transfers'] }),
  });
};

export const useEquipment = (branchId?: number) => {
  return useQuery({
    queryKey: ['equipment', branchId],
    queryFn: () => fetchAPI(API_ENDPOINTS.equipment.list(branchId)),
  });
};

export const useCreateEquipment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { branchId: number } & Record<string, unknown>) =>
      fetchAPI(API_ENDPOINTS.equipment.create, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (_, variables) => queryClient.invalidateQueries({ queryKey: ['equipment', variables.branchId] }),
  });
};

export const useLogMaintenance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number, data: unknown }) => fetchAPI(API_ENDPOINTS.equipment.maintenance(id), { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['equipment'] }),
  });
};

