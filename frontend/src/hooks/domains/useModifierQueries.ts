import { MODIFIER_ENDPOINTS } from "@/lib/endpoints/products";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAPI } from '@/lib/api';
import type { ModifierGroup, ModifierOption } from '@/types/api';

export const useModifiers = (category?: string) => {
  return useQuery({
    queryKey: ['modifiers', category ?? 'all'],
    queryFn: () => fetchAPI(MODIFIER_ENDPOINTS.list(category)),
    staleTime: category ? Infinity : undefined,
  });
};

export const useCreateModifierGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      category?: string;
      sortOrder?: number;
      swapIngredientId?: number;
      options?: {
        name: string;
        priceDelta?: number;
        isDefault?: boolean;
        sortOrder?: number;
        swapToIngredientId?: number;
      }[];
    }) =>
      fetchAPI(MODIFIER_ENDPOINTS.createGroup, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['modifiers'] }),
  });
};

export const useUpdateModifierGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: number;
      name?: string;
      category?: string | null;
      sortOrder?: number;
      swapIngredientId?: number | null;
    }) =>
      fetchAPI(MODIFIER_ENDPOINTS.updateGroup(id), {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['modifiers'] }),
  });
};

export const useDeleteModifierGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      fetchAPI(MODIFIER_ENDPOINTS.deleteGroup(id), { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['modifiers'] }),
  });
};

export const useCreateModifierOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      groupId: number;
      name: string;
      priceDelta?: number;
      isDefault?: boolean;
      sortOrder?: number;
      swapToIngredientId?: number;
    }) =>
      fetchAPI(MODIFIER_ENDPOINTS.createOption, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['modifiers'] }),
  });
};

export const useUpdateModifierOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: number;
      name?: string;
      priceDelta?: number;
      isDefault?: boolean;
      sortOrder?: number;
      swapToIngredientId?: number | null;
    }) =>
      fetchAPI(MODIFIER_ENDPOINTS.updateOption(id), {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['modifiers'] }),
  });
};

export const useDeleteModifierOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      fetchAPI(MODIFIER_ENDPOINTS.deleteOption(id), { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['modifiers'] }),
  });
};

export type { ModifierGroup, ModifierOption };
