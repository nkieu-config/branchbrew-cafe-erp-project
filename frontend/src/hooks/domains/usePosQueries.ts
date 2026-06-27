import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { fetchAPI } from '@/lib/api';

// ==========================================
// 🛒 POS HOOKS
// ==========================================
export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => fetchAPI(API_ENDPOINTS.products.list),
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => fetchAPI(API_ENDPOINTS.orders.create, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });
};

export const useBranchOrders = (branchId?: number) => {
  return useQuery({
    queryKey: ['orders', branchId],
    queryFn: () => fetchAPI(API_ENDPOINTS.orders.list(branchId)),
    enabled: !!branchId,
  });
};

export const useVoidOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: number) =>
      fetchAPI(API_ENDPOINTS.orders.void(orderId), { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['analyticsSummary'] });
      queryClient.invalidateQueries({ queryKey: ['salesTrends'] });
      queryClient.invalidateQueries({ queryKey: ['branchInventory'] });
    },
  });
};

export const useRefundOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: number; reason?: string }) =>
      fetchAPI(API_ENDPOINTS.orders.refund(orderId), {
        method: 'POST',
        body: JSON.stringify(reason ? { reason } : {}),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['analyticsSummary'] });
      queryClient.invalidateQueries({ queryKey: ['salesTrends'] });
      queryClient.invalidateQueries({ queryKey: ['branchInventory'] });
    },
  });
};

export const useValidatePromotion = () => {
  return useMutation({
    mutationFn: ({ code, subtotal }: { code: string, subtotal: number }) => fetchAPI(API_ENDPOINTS.promotions.validate, { method: 'POST', body: JSON.stringify({ code, subtotal }) }),
  });
};

export const useCustomerByPhone = () => {
  return useMutation({
    mutationFn: (phone: string) => fetchAPI(API_ENDPOINTS.customers.byPhone(phone)),
  });
};

