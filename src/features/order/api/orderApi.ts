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
  city: string;
  customerEmail?: string;
  customerName: string;
  customerPhone?: string;
  deliveryAddress: string;
  itemCount: number;
  items: Array<{ productId: string; quantity: number; message?: string }>;
  paymentMethod: 'wallet' | 'cash_on_delivery' | 'mopayments';
  promoCode?: string;
  productIds: string[];
  region?: string;
  township?: string;
  subtotalAmount: number;
};

export type DeliveryQuotePayload = Pick<
  CreateOrderPayload,
  'city' | 'promoCode' | 'region' | 'subtotalAmount' | 'township'
>;

export type DeliveryQuote = {
  city: string;
  deliveryFee: number;
  eta: string;
  freeDeliveryApplied: boolean;
  freeOver: number;
  promoCode?: string;
  promoDiscountAmount: number;
  promoDiscountLabel?: string;
  region: string;
  subtotalAmount: number;
  totalAmount: number;
  totalBeforeDiscount: number;
  township: string;
};

export type ActivePromotion = {
  campaign: string;
  code: string;
  discount: string;
  endsAt: string;
  id: string;
  startsAt: string;
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
  async getDeliveryQuote(payload: DeliveryQuotePayload): Promise<DeliveryQuote> {
    const response = await apiClient.post<ApiResponse<DeliveryQuote>>(
      endpoints.orders.deliveryQuote,
      payload,
    );
    return response.data.data;
  },
  async getActivePromotions(options: ListOptions = {}): Promise<ActivePromotion[]> {
    const response = await apiClient.get<
      ApiResponse<Array<Omit<ActivePromotion, 'id'> & { _id: string }>>
    >(endpoints.orders.promotions, { signal: options.signal });

    return response.data.data.map(({ _id, ...promotion }) => ({ ...promotion, id: _id }));
  },
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
