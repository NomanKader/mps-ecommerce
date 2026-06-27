import { apiClient } from '@shared/api/axios';
import { endpoints } from '@shared/api/endpoints';
import type { ApiResponse } from '../../../types/api';

type BackendShoppingList = {
  _id: string;
  name: string;
  productIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type ShoppingList = Omit<BackendShoppingList, '_id'> & { id: string };

const mapList = ({ _id, ...list }: BackendShoppingList): ShoppingList => ({ ...list, id: _id });

export const shoppingListsApi = {
  async list(options: { signal?: globalThis.AbortSignal } = {}) {
    const response = await apiClient.get<ApiResponse<BackendShoppingList[]>>(
      endpoints.shoppingLists.list,
      { signal: options.signal },
    );
    return response.data.data.map(mapList);
  },
  async create(name: string) {
    const response = await apiClient.post<ApiResponse<BackendShoppingList>>(
      endpoints.shoppingLists.list,
      { name },
    );
    return mapList(response.data.data);
  },
  async rename(id: string, name: string) {
    const response = await apiClient.put<ApiResponse<BackendShoppingList>>(
      endpoints.shoppingLists.item(id),
      { name },
    );
    return mapList(response.data.data);
  },
  async remove(id: string) {
    await apiClient.delete(endpoints.shoppingLists.item(id));
  },
  async toggleProduct(id: string, productId: string) {
    const response = await apiClient.put<ApiResponse<BackendShoppingList>>(
      endpoints.shoppingLists.toggleProduct(id, productId),
    );
    return mapList(response.data.data);
  },
};
