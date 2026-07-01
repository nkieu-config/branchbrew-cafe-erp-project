import { SETTINGS_ENDPOINTS } from "@/lib/endpoints/settings";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAPI } from '@/lib/api';
import { getErrorMessage } from '@/lib/errors';
import { toast } from 'sonner';

export const useSettings = () => {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      return await fetchAPI(SETTINGS_ENDPOINTS.get);
    },
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Record<string, string>) => {
      return await fetchAPI(SETTINGS_ENDPOINTS.update, { method: 'POST', body: JSON.stringify(data) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Settings updated successfully');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to update settings'));
    }
  });
};
