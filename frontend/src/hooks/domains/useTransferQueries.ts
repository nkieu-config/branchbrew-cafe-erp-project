import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { fetchAPI } from '@/lib/api';
import { invalidateTransferSideEffects, transferKeys } from '@/lib/query-keys';
import type { CreateTransferDTO } from '@/types/schemas';

export const useTransfers = (branchId?: number) => {
  return useQuery({
    queryKey: transferKeys.branch(branchId),
    queryFn: () =>
      fetchAPI(
        branchId
          ? API_ENDPOINTS.branches.transfers(branchId)
          : API_ENDPOINTS.branches.transfersAll,
      ),
  });
};

export const useCreateTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTransferDTO) =>
      fetchAPI(API_ENDPOINTS.branches.createTransfer, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      invalidateTransferSideEffects(queryClient);
    },
  });
};

export const useAcceptTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (transferId: number) =>
      fetchAPI(API_ENDPOINTS.branches.acceptTransfer(transferId), {
        method: 'POST',
      }),
    onSuccess: () => {
      invalidateTransferSideEffects(queryClient);
    },
  });
};
