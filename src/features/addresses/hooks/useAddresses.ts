import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

import type { CustomerAddressPayload } from '@entities/address/types/address.types';
import { addressApi } from '@features/addresses/api/addressApi';
import type { RootState } from '@store/index';

const addressesQueryKey = ['account', 'addresses'] as const;

export const useAddresses = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const addressesQuery = useQuery({
    enabled: isAuthenticated,
    queryFn: ({ signal }) => addressApi.list({ signal }),
    queryKey: addressesQueryKey,
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: addressesQueryKey });
  };

  const createMutation = useMutation({
    mutationFn: addressApi.create,
    onSuccess: invalidate,
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CustomerAddressPayload> }) =>
      addressApi.update(id, payload),
    onSuccess: invalidate,
  });
  const deleteMutation = useMutation({
    mutationFn: addressApi.remove,
    onSuccess: invalidate,
  });

  return {
    addresses: addressesQuery.data ?? [],
    createAddress: createMutation.mutateAsync,
    deleteAddress: deleteMutation.mutateAsync,
    isLoading: addressesQuery.isLoading,
    isSaving: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    updateAddress: updateMutation.mutateAsync,
  };
};
