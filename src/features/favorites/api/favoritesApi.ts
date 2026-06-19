import { apiClient } from '@shared/api/axios';
import { endpoints } from '@shared/api/endpoints';
import type { ApiResponse } from '../../../types/api';

export type FavoriteListResponse = {
  productIds: string[];
};

export type FavoriteToggleResponse = {
  isFavorite: boolean;
  productId: string;
  productIds: string[];
};

export const favoritesApi = {
  async listFavorites(options: { signal?: globalThis.AbortSignal } = {}) {
    const response = await apiClient.get<ApiResponse<FavoriteListResponse>>(endpoints.favorites.list, {
      signal: options.signal,
    });

    return response.data.data;
  },
  async toggleFavorite(productId: string) {
    const response = await apiClient.put<ApiResponse<FavoriteToggleResponse>>(
      endpoints.favorites.toggle(productId),
    );

    return response.data.data;
  },
};
