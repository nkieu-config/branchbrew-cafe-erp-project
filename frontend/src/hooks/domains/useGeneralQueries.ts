import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAPI } from '@/lib/api';

// ==========================================
// 🌍 GENERAL HOOKS
// ==========================================
export const useBranches = () => {
  return useQuery({
    queryKey: ['branches'],
    queryFn: () => fetchAPI('/branches'),
    staleTime: Infinity, // Branches rarely change
  });
};

