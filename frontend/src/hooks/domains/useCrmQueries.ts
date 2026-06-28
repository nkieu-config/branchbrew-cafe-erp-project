import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { fetchAPI } from '@/lib/api';

// ==========================================
// 👥 CRM HOOKS
// ==========================================
export const useCustomers = (search?: string) => {
  return useQuery({
    queryKey: ['customers', search],
    queryFn: () => fetchAPI(API_ENDPOINTS.customers.list(search)),
  });
};

export const useCustomer360 = (id: number | null) => {
  return useQuery({
    queryKey: ['customer360', id],
    queryFn: () => fetchAPI(API_ENDPOINTS.customers.detail360(id!)),
    enabled: !!id,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => fetchAPI(API_ENDPOINTS.customers.create, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  });
};

export const usePromotions = () => {
  return useQuery({
    queryKey: ['promotions'],
    queryFn: () => fetchAPI(API_ENDPOINTS.promotions.list),
  });
};

export const useCreatePromotion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => fetchAPI(API_ENDPOINTS.promotions.create, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['promotions'] }),
  });
};

export const useTogglePromotion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: number, isActive: boolean }) => fetchAPI(API_ENDPOINTS.promotions.toggle(id), { method: 'PATCH', body: JSON.stringify({ isActive }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['promotions'] }),
  });
};

export const useUpdatePromotion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: unknown }) =>
      fetchAPI(API_ENDPOINTS.promotions.update(id), {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['promotions'] }),
  });
};

export const useDeletePromotion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      fetchAPI(API_ENDPOINTS.promotions.delete(id), { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['promotions'] }),
  });
};

