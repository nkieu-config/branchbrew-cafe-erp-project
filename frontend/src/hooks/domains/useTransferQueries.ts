import { BRANCH_ENDPOINTS } from "@/lib/endpoints/branches";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAPI } from '@/lib/api';
import { invalidateTransferSideEffects, transferKeys } from '@/lib/query-keys';
import type { CreateTransferDTO } from '@/types/schemas';

export const useTransfers = (branchId?: number) => {
  return useQuery({
    queryKey: transferKeys.branch(branchId),
    queryFn: () =>
      fetchAPI(
        branchId
          ? BRANCH_ENDPOINTS.transfers(branchId)
          : BRANCH_ENDPOINTS.transfersAll,
      ),
  });
};

export const useCreateTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTransferDTO) =>
      fetchAPI(BRANCH_ENDPOINTS.createTransfer, {
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
      fetchAPI(BRANCH_ENDPOINTS.acceptTransfer(transferId), {
        method: 'POST',
      }),
    onSuccess: () => {
      invalidateTransferSideEffects(queryClient);
    },
  });
};
