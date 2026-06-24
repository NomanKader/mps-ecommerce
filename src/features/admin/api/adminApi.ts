import { apiClient } from '@shared/api/axios';
import { endpoints } from '@shared/api/endpoints';
import type { ApiResponse } from '../../../types/api';
import type {
  AdminCategory,
  AdminCategoryPayload,
  AdminCustomer,
  AdminDashboard,
  AdminDashboardUser,
  AdminDashboardUserPayload,
  AdminDeliveryFee,
  AdminDeliveryFeePayload,
  AdminOrder,
  AdminOrderStats,
  AdminOrderStatus,
  AdminProduct,
  AdminProductBulkPayload,
  AdminProductBulkResult,
  AdminProductPayload,
  AdminPromotion,
  AdminPromotionPayload,
  AdminRegion,
  AdminRegionPayload,
  AdminSecondaryCategory,
  AdminSecondaryCategoryPayload,
  AdminTownship,
  AdminTownshipPayload,
  AdminWalletTopUpRequest,
} from '@features/admin/types/admin.types';

type MongoEntity = { _id: string };
type BackendEntity<T extends { id: string }> = Omit<T, 'id'> & MongoEntity;
type ListOptions = { signal?: globalThis.AbortSignal };
type Query = Record<string, string | undefined>;

const mapId = <T extends MongoEntity>({ _id, ...entity }: T) => ({ ...entity, id: _id });
const params = (query: Query) =>
  Object.fromEntries(Object.entries(query).filter(([, value]) => value && value !== 'all'));
const mapRegion = (region: BackendEntity<AdminRegion>): AdminRegion => ({
  ...mapId(region),
  country: region.country ?? 'Myanmar',
});
const mapSecondaryCategory = (
  category: BackendEntity<AdminSecondaryCategory>,
): AdminSecondaryCategory => {
  const normalizedCategory = mapId(category) as AdminSecondaryCategory;
  const productIds = normalizedCategory.productIds?.length
    ? normalizedCategory.productIds
    : normalizedCategory.productId
      ? [normalizedCategory.productId]
      : [];

  return {
    ...normalizedCategory,
    productId: normalizedCategory.productId ?? productIds[0],
    productIds,
  };
};
const mapTownship = (township: BackendEntity<AdminTownship>): AdminTownship => {
  const normalizedTownship = mapId(township) as AdminTownship;

  return {
    ...normalizedTownship,
    country: normalizedTownship.country ?? 'Myanmar',
    regionId: normalizedTownship.regionId ? String(normalizedTownship.regionId) : undefined,
  };
};
const productFormData = (payload: AdminProductPayload) => {
  const formData = new FormData();

  formData.append('name', payload.name);
  formData.append('sku', payload.sku);

  if (payload.categoryName) {
    formData.append('categoryName', payload.categoryName);
  }

  if (payload.categoryId) {
    formData.append('categoryId', payload.categoryId);
  }

  if (payload.subcategory) {
    formData.append('subcategory', payload.subcategory);
  }

  if (payload.description) {
    formData.append('description', payload.description);
  }

  formData.append('tags', JSON.stringify(payload.tags ?? []));
  formData.append('price', String(payload.price));
  formData.append('currency', payload.currency || 'MMK');
  formData.append('stock', String(payload.stock || 0));
  formData.append('rating', String(payload.rating || 0));
  formData.append('status', payload.status || 'active');

  if (payload.image) {
    formData.append('image', payload.image);
  }

  if (payload.removeImage) {
    formData.append('removeImage', 'true');
  }

  return formData;
};

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
      productFormData(payload),
    );
    return { ...response.data, data: mapId(response.data.data) };
  },
  async bulkImportProducts(payload: AdminProductBulkPayload) {
    return (
      await apiClient.post<ApiResponse<AdminProductBulkResult>>(
        endpoints.admin.productBulk,
        payload,
      )
    ).data;
  },
  async createPromotion(payload: AdminPromotionPayload) {
    const response = await apiClient.post<ApiResponse<BackendEntity<AdminPromotion>>>(
      endpoints.admin.promotions,
      payload,
    );
    return { ...response.data, data: mapId(response.data.data) };
  },
  async approveWalletTopUp(id: string, payload: { adminNote?: string; approvedAmount: number }) {
    const response = await apiClient.put<ApiResponse<BackendEntity<AdminWalletTopUpRequest>>>(
      endpoints.admin.walletTopUpApprove(id),
      payload,
    );
    return { ...response.data, data: mapId(response.data.data) };
  },
  async rejectWalletTopUp(id: string, payload: { adminNote?: string }) {
    const response = await apiClient.put<ApiResponse<BackendEntity<AdminWalletTopUpRequest>>>(
      endpoints.admin.walletTopUpReject(id),
      payload,
    );
    return { ...response.data, data: mapId(response.data.data) };
  },
  async createRegion(payload: AdminRegionPayload) {
    const response = await apiClient.post<ApiResponse<BackendEntity<AdminRegion>>>(
      endpoints.admin.regions,
      payload,
    );
    return { ...response.data, data: mapRegion(response.data.data) };
  },
  async createSecondaryCategory(payload: AdminSecondaryCategoryPayload) {
    const response = await apiClient.post<ApiResponse<BackendEntity<AdminSecondaryCategory>>>(
      endpoints.admin.secondaryCategories,
      payload,
    );
    return { ...response.data, data: mapSecondaryCategory(response.data.data) };
  },
  async createTownship(payload: AdminTownshipPayload) {
    const response = await apiClient.post<ApiResponse<BackendEntity<AdminTownship>>>(
      endpoints.admin.townships,
      payload,
    );
    return { ...response.data, data: mapTownship(response.data.data) };
  },
  async createUser(payload: AdminDashboardUserPayload) {
    const response = await apiClient.post<ApiResponse<BackendEntity<AdminDashboardUser>>>(
      endpoints.admin.users,
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
  async deleteRegion(id: string) {
    return (await apiClient.delete<ApiResponse<{ id: string }>>(endpoints.admin.region(id))).data;
  },
  async deleteSecondaryCategory(id: string) {
    return (
      await apiClient.delete<ApiResponse<{ id: string }>>(endpoints.admin.secondaryCategory(id))
    ).data;
  },
  async deleteTownship(id: string) {
    return (await apiClient.delete<ApiResponse<{ id: string }>>(endpoints.admin.township(id))).data;
  },
  async deleteUser(id: string) {
    return (await apiClient.delete<ApiResponse<{ id: string }>>(endpoints.admin.user(id))).data;
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
  async getDashboard(options: ListOptions = {}) {
    const response = await apiClient.get<
      ApiResponse<
        Omit<AdminDashboard, 'inventoryAlerts' | 'recentOrders'> & {
          inventoryAlerts: Array<
            Omit<AdminDashboard['inventoryAlerts'][number], 'id'> & MongoEntity
          >;
          recentOrders: Array<Omit<AdminDashboard['recentOrders'][number], 'id'> & MongoEntity>;
        }
      >
    >(endpoints.admin.dashboard, { signal: options.signal });
    const data = response.data.data;

    return {
      ...data,
      inventoryAlerts: (data.inventoryAlerts ?? []).map(mapId),
      recentOrders: (data.recentOrders ?? []).map(mapId),
      weeklySales: data.weeklySales ?? [],
    };
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
  async listRegions(query: Query, options: ListOptions = {}) {
    const response = await apiClient.get<ApiResponse<Array<BackendEntity<AdminRegion>>>>(
      endpoints.admin.regions,
      { params: params(query), signal: options.signal },
    );
    return response.data.data.map(mapRegion);
  },
  async listSecondaryCategories(query: Query, options: ListOptions = {}) {
    const response = await apiClient.get<ApiResponse<Array<BackendEntity<AdminSecondaryCategory>>>>(
      endpoints.admin.secondaryCategories,
      { params: params(query), signal: options.signal },
    );
    return response.data.data.map(mapSecondaryCategory);
  },
  async listTownships(query: Query, options: ListOptions = {}) {
    const response = await apiClient.get<ApiResponse<Array<BackendEntity<AdminTownship>>>>(
      endpoints.admin.townships,
      { params: params(query), signal: options.signal },
    );
    return response.data.data.map(mapTownship);
  },
  async listWalletTopUps(query: Query, options: ListOptions = {}) {
    const response = await apiClient.get<ApiResponse<Array<BackendEntity<AdminWalletTopUpRequest>>>>(
      endpoints.admin.walletTopUps,
      { params: params(query), signal: options.signal },
    );
    return response.data.data.map(mapId);
  },
  async listUsers(options: ListOptions = {}) {
    const response = await apiClient.get<ApiResponse<Array<BackendEntity<AdminDashboardUser>>>>(
      endpoints.admin.users,
      { signal: options.signal },
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
      productFormData(payload),
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
  async updateRegion(id: string, payload: AdminRegionPayload) {
    const response = await apiClient.put<ApiResponse<BackendEntity<AdminRegion>>>(
      endpoints.admin.region(id),
      payload,
    );
    return { ...response.data, data: mapRegion(response.data.data) };
  },
  async updateSecondaryCategory(id: string, payload: AdminSecondaryCategoryPayload) {
    const response = await apiClient.put<ApiResponse<BackendEntity<AdminSecondaryCategory>>>(
      endpoints.admin.secondaryCategory(id),
      payload,
    );
    return { ...response.data, data: mapSecondaryCategory(response.data.data) };
  },
  async updateTownship(id: string, payload: AdminTownshipPayload) {
    const response = await apiClient.put<ApiResponse<BackendEntity<AdminTownship>>>(
      endpoints.admin.township(id),
      payload,
    );
    return { ...response.data, data: mapTownship(response.data.data) };
  },
  async updateUser(id: string, payload: AdminDashboardUserPayload) {
    const response = await apiClient.put<ApiResponse<BackendEntity<AdminDashboardUser>>>(
      endpoints.admin.user(id),
      payload,
    );
    return { ...response.data, data: mapId(response.data.data) };
  },
};
