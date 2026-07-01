import { PRODUCT_ENDPOINTS, INGREDIENT_ENDPOINTS } from "@/lib/endpoints/products";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAPI } from '@/lib/api';
import type { Product, Ingredient, UpdatePayload } from '@/types/api';

// ==========================================
// ☕ PRODUCT & MENU HOOKS
// ==========================================

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => fetchAPI(PRODUCT_ENDPOINTS.list),
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => fetchAPI('/products', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: UpdatePayload<Product>) => 
      fetchAPI(PRODUCT_ENDPOINTS.update(id), { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => fetchAPI(PRODUCT_ENDPOINTS.update(id), { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
};

// ==========================================
// 🌾 RAW INGREDIENT HOOKS
// ==========================================

export const useIngredients = () => {
  return useQuery({
    queryKey: ['ingredients'],
    queryFn: () => fetchAPI(INGREDIENT_ENDPOINTS.list),
  });
};

export const useCreateIngredient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => fetchAPI(INGREDIENT_ENDPOINTS.create, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ingredients'] }),
  });
};

export const useUpdateIngredient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: UpdatePayload<Ingredient>) => 
      fetchAPI(INGREDIENT_ENDPOINTS.update(id), { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ingredients'] }),
  });
};

export const useDeleteIngredient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => fetchAPI(INGREDIENT_ENDPOINTS.update(id), { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ingredients'] }),
  });
};
