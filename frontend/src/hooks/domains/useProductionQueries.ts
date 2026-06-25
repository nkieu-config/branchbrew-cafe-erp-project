import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { fetchAPI } from '@/lib/api';

// ==========================================
// 🍳 KITCHEN & PRODUCTION HOOKS
// ==========================================
export const useKitchenOrders = () => {
  return useQuery({
    queryKey: ['kitchenOrders'],
    queryFn: () => fetchAPI(API_ENDPOINTS.production.orders),
    // Poll every 10 seconds for real-time kitchen updates
    refetchInterval: 10000, 
  });
};

export const useIngredients = () => {
  return useQuery({
    queryKey: ['ingredients'],
    queryFn: () => fetchAPI(API_ENDPOINTS.ingredients.list),
  });
};

export const useCompleteKitchenOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => fetchAPI(API_ENDPOINTS.production.complete(id), { method: 'PATCH' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchenOrders'] });
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number, status: string }) => fetchAPI(API_ENDPOINTS.production.updateStatus(id), { method: 'PATCH', body: JSON.stringify({ status }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchenOrders'] });
    },
  });
};

export const useCreateProductionOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => fetchAPI(API_ENDPOINTS.production.createOrder, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchenOrders'] });
    },
  });
};

