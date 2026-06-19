import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

import { favoritesApi } from '@features/favorites/api/favoritesApi';
import type { RootState } from '@store/index';

const favoritesQueryKey = ['account', 'favorites'] as const;

export const useFavorites = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const favoritesQuery = useQuery({
    enabled: isAuthenticated,
    queryFn: ({ signal }) => favoritesApi.listFavorites({ signal }),
    queryKey: favoritesQueryKey,
  });
  const favoriteIds = favoritesQuery.data?.productIds ?? [];
  const favoriteIdSet = new Set(favoriteIds);
  const toggleMutation = useMutation({
    mutationFn: favoritesApi.toggleFavorite,
    onSuccess: (data) => {
      queryClient.setQueryData(favoritesQueryKey, { productIds: data.productIds });
    },
  });

  return {
    favoriteIds,
    isFavorite: (productId: string) => favoriteIdSet.has(productId),
    isLoading: favoritesQuery.isLoading,
    isToggling: toggleMutation.isPending,
    toggleFavorite: toggleMutation.mutate,
  };
};
