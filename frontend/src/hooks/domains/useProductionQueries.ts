import { PRODUCTION_ENDPOINTS } from "@/lib/endpoints/production";
import { INGREDIENT_ENDPOINTS } from "@/lib/endpoints/products";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAPI } from '@/lib/api';

// ==========================================
// 🍳 KITCHEN & PRODUCTION HOOKS
// ==========================================
export const useKitchenOrders = () => {
  return useQuery({
    queryKey: ['kitchenOrders'],
    queryFn: () => fetchAPI(PRODUCTION_ENDPOINTS.orders),
    // Poll every 10 seconds for real-time kitchen updates
    refetchInterval: 10000, 
  });
};

export const useIngredients = () => {
  return useQuery({
    queryKey: ['ingredients'],
    queryFn: () => fetchAPI(INGREDIENT_ENDPOINTS.list),
  });
};

export const useCompleteKitchenOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => fetchAPI(PRODUCTION_ENDPOINTS.complete(id), { method: 'PATCH' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchenOrders'] });
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number, status: string }) => fetchAPI(PRODUCTION_ENDPOINTS.updateStatus(id), { method: 'PATCH', body: JSON.stringify({ status }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchenOrders'] });
    },
  });
};

export const useCreateProductionOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => fetchAPI(PRODUCTION_ENDPOINTS.createOrder, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchenOrders'] });
    },
  });
};

