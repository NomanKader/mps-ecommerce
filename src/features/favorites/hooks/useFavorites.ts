import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import { favoritesApi } from '@features/favorites/api/favoritesApi';
import { routePaths } from '@routes/routePaths';
import type { RootState } from '@store/index';

const lastStorefrontPathKey = 'avs:last-storefront-path';

export const useFavorites = () => {
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const userId = useSelector((state: RootState) => state.auth.user?.id);
  const favoritesQueryKey = ['account', 'favorites', userId] as const;
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
  const requestLogin = () => {
    const currentPath = `${location.pathname}${location.search}${location.hash}`;

    sessionStorage.setItem(lastStorefrontPathKey, currentPath);

    if (window.matchMedia('(max-width: 899px)').matches) {
      const params = new URLSearchParams(location.search);

      params.set('auth', 'login');
      navigate(
        {
          hash: location.hash,
          pathname: location.pathname,
          search: `?${params.toString()}`,
        },
        { replace: true },
      );
      return;
    }

    navigate(routePaths.auth.login, { state: { from: location } });
  };

  const toggleFavorite = (productId: string) => {
    if (!isAuthenticated) {
      requestLogin();
      return;
    }

    toggleMutation.mutate(productId);
  };

  return {
    favoriteIds,
    isFavorite: (productId: string) => favoriteIdSet.has(productId),
    isLoading: favoritesQuery.isLoading,
    isToggling: toggleMutation.isPending,
    toggleFavorite,
  };
};
