import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAPI } from '@/lib/api';

// ==========================================
// 👥 CRM HOOKS
// ==========================================
export const useCustomers = (search?: string) => {
  return useQuery({
    queryKey: ['customers', search],
    queryFn: () => fetchAPI(`/customers${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  });
};

export const useCustomer360 = (id: number | null) => {
  return useQuery({
    queryKey: ['customer360', id],
    queryFn: () => fetchAPI(`/customers/${id}/360`),
    enabled: !!id,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => fetchAPI('/customers', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  });
};

export const usePromotions = () => {
  return useQuery({
    queryKey: ['promotions'],
    queryFn: () => fetchAPI('/promotions'),
  });
};

export const useCreatePromotion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => fetchAPI('/promotions', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['promotions'] }),
  });
};

export const useTogglePromotion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: number, isActive: boolean }) => fetchAPI(`/promotions/${id}/toggle`, { method: 'PATCH', body: JSON.stringify({ isActive }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['promotions'] }),
  });
};

