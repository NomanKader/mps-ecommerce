import { apiClient } from '@shared/api/axios';
import { endpoints } from '@shared/api/endpoints';
import type { ApiResponse } from '../../../types/api';
import type {
  AdminCategory,
  AdminCategoryPayload,
  AdminCustomer,
  AdminDeliveryFee,
  AdminDeliveryFeePayload,
  AdminOrder,
  AdminOrderStats,
  AdminOrderStatus,
  AdminProduct,
  AdminProductPayload,
  AdminPromotion,
  AdminPromotionPayload,
} from '@features/admin/types/admin.types';

type MongoEntity = { _id: string };
type BackendEntity<T extends { id: string }> = Omit<T, 'id'> & MongoEntity;
type ListOptions = { signal?: globalThis.AbortSignal };
type Query = Record<string, string | undefined>;

const mapId = <T extends MongoEntity>({ _id, ...entity }: T) => ({ ...entity, id: _id });
const params = (query: Query) =>
  Object.fromEntries(Object.entries(query).filter(([, value]) => value && value !== 'all'));

export const adminApi = {
  async createCategory(payload: AdminCategoryPayload) {
    const response = await apiClient.post<ApiResponse<BackendEntity<AdminCategory>>>(
      endpoints.admin.categories,
      payload,
    );
    return { ...response.data, data: mapId(response.data.data) };
  },
  async createDeliveryFee(payload: AdminDeliveryFeePayload) {
    const response = await apiClient.post<ApiResponse<BackendEntity<AdminDeliveryFee>>>(
      endpoints.admin.deliveryFees,
      payload,
    );
    return { ...response.data, data: mapId(response.data.data) };
  },
  async createProduct(payload: AdminProductPayload) {
    const response = await apiClient.post<ApiResponse<BackendEntity<AdminProduct>>>(
      endpoints.admin.products,
      payload,
    );
    return { ...response.data, data: mapId(response.data.data) };
  },
  async createPromotion(payload: AdminPromotionPayload) {
    const response = await apiClient.post<ApiResponse<BackendEntity<AdminPromotion>>>(
      endpoints.admin.promotions,
      payload,
    );
    return { ...response.data, data: mapId(response.data.data) };
  },
  async deleteCategory(id: string) {
    return (await apiClient.delete<ApiResponse<{ id: string }>>(endpoints.admin.category(id))).data;
  },
  async deleteDeliveryFee(id: string) {
    return (await apiClient.delete<ApiResponse<{ id: string }>>(endpoints.admin.deliveryFee(id)))
      .data;
  },
  async deleteProduct(id: string) {
    return (await apiClient.delete<ApiResponse<{ id: string }>>(endpoints.admin.product(id))).data;
  },
  async deletePromotion(id: string) {
    return (await apiClient.delete<ApiResponse<{ id: string }>>(endpoints.admin.promotion(id)))
      .data;
  },
  async listCategories(query: Query, options: ListOptions = {}) {
    const response = await apiClient.get<ApiResponse<Array<BackendEntity<AdminCategory>>>>(
      endpoints.admin.categories,
      { params: params(query), signal: options.signal },
    );
    return response.data.data.map(mapId);
  },
  async listCustomers(query: Query, options: ListOptions = {}) {
    const response = await apiClient.get<ApiResponse<Array<BackendEntity<AdminCustomer>>>>(
      endpoints.admin.customers,
      { params: params(query), signal: options.signal },
    );
    return response.data.data.map(mapId);
  },
  async listDeliveryFees(query: Query, options: ListOptions = {}) {
    const response = await apiClient.get<ApiResponse<Array<BackendEntity<AdminDeliveryFee>>>>(
      endpoints.admin.deliveryFees,
      { params: params(query), signal: options.signal },
    );
    return response.data.data.map(mapId);
  },
  async listOrders(query: Query, options: ListOptions = {}) {
    const response = await apiClient.get<
      ApiResponse<Array<BackendEntity<AdminOrder> & { itemsCount?: number }>>
    >(endpoints.admin.orders, { params: params(query), signal: options.signal });
    return response.data.data.map(({ _id, ...order }) => ({
      ...order,
      id: _id,
      itemCount: order.itemCount ?? order.itemsCount ?? 0,
      placedAt: order.placedAt ?? order.createdAt,
    }));
  },
  async listProducts(query: Query, options: ListOptions = {}) {
    const response = await apiClient.get<ApiResponse<Array<BackendEntity<AdminProduct>>>>(
      endpoints.admin.products,
      { params: params(query), signal: options.signal },
    );
    return response.data.data.map(mapId);
  },
  async listPromotions(query: Query, options: ListOptions = {}) {
    const response = await apiClient.get<ApiResponse<Array<BackendEntity<AdminPromotion>>>>(
      endpoints.admin.promotions,
      { params: params(query), signal: options.signal },
    );
    return response.data.data.map(mapId);
  },
  async orderStats(options: ListOptions = {}) {
    return (
      await apiClient.get<ApiResponse<AdminOrderStats>>(endpoints.admin.orderStats, {
        signal: options.signal,
      })
    ).data.data;
  },
  async updateCategory(id: string, payload: AdminCategoryPayload) {
    const response = await apiClient.put<ApiResponse<BackendEntity<AdminCategory>>>(
      endpoints.admin.category(id),
      payload,
    );
    return { ...response.data, data: mapId(response.data.data) };
  },
  async updateDeliveryFee(id: string, payload: AdminDeliveryFeePayload) {
    const response = await apiClient.put<ApiResponse<BackendEntity<AdminDeliveryFee>>>(
      endpoints.admin.deliveryFee(id),
      payload,
    );
    return { ...response.data, data: mapId(response.data.data) };
  },
  async updateOrderStatus(id: string, status: AdminOrderStatus) {
    return (
      await apiClient.patch<ApiResponse<BackendEntity<AdminOrder>>>(
        endpoints.admin.orderStatus(id),
        {
          status,
        },
      )
    ).data;
  },
  async updateProduct(id: string, payload: AdminProductPayload) {
    const response = await apiClient.put<ApiResponse<BackendEntity<AdminProduct>>>(
      endpoints.admin.product(id),
      payload,
    );
    return { ...response.data, data: mapId(response.data.data) };
  },
  async updatePromotion(id: string, payload: AdminPromotionPayload) {
    const response = await apiClient.put<ApiResponse<BackendEntity<AdminPromotion>>>(
      endpoints.admin.promotion(id),
      payload,
    );
    return { ...response.data, data: mapId(response.data.data) };
  },
};
