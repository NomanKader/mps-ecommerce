import type { Order } from '@entities/order/types/order.types';
import { apiClient } from '@shared/api/axios';
import { endpoints } from '@shared/api/endpoints';
import type { ApiResponse } from '../../../types/api';

type BackendOrder = Omit<Order, 'id' | 'createdAt' | 'itemCount'> & {
  _id: string;
  createdAt?: string;
  itemCount?: number;
  itemsCount?: number;
  placedAt?: string;
};

type ListOptions = { signal?: globalThis.AbortSignal };

export type CreateOrderPayload = {
  customerEmail?: string;
  customerName: string;
  customerPhone?: string;
  deliveryAddress: string;
  itemCount: number;
  region?: string;
  township?: string;
  totalAmount: number;
};

const mapOrder = ({
  _id,
  createdAt,
  placedAt,
  itemCount,
  itemsCount,
  ...order
}: BackendOrder): Order => ({
  ...order,
  createdAt: placedAt ?? createdAt ?? new Date().toISOString(),
  id: _id,
  itemCount: itemCount ?? itemsCount ?? 0,
});

export const orderApi = {
  async getOrders(options: ListOptions = {}): Promise<Order[]> {
    const response = await apiClient.get<ApiResponse<BackendOrder[]>>(endpoints.orders.list, {
      signal: options.signal,
    });

    return response.data.data.map(mapOrder);
  },
  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    const response = await apiClient.post<ApiResponse<BackendOrder>>(
      endpoints.orders.list,
      payload,
    );
    return mapOrder(response.data.data);
  },
};
