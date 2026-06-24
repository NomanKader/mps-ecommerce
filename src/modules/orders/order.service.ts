import { BaseService } from '@core/base/BaseService';
import { HTTP_STATUS } from '@core/response/http-status';
import { OrderRepository } from '@modules/orders/order.repository';
import { Order } from '@modules/orders/order.types';
import { ApiError } from '@utils/ApiError';

type CreateOrderInput = Pick<
  Order,
  | 'customerEmail'
  | 'customerName'
  | 'customerPhone'
  | 'deliveryAddress'
  | 'itemCount'
  | 'region'
  | 'totalAmount'
  | 'township'
>;

export class OrderService extends BaseService {
  constructor() {
    super();
  }

  async listOrders(tenantId?: string, userId?: string): Promise<Order[]> {
    if (!tenantId) return [];
    return new OrderRepository(tenantId).find({ tenantId, ...(userId ? { userId } : {}) });
  }

  async createOrder(
    tenantId: string | undefined,
    userId: string | undefined,
    payload: CreateOrderInput
  ): Promise<Order> {
    if (!tenantId || !userId) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Authorization token is required');
    }

    const itemCount = payload.itemCount;
    return new OrderRepository(tenantId).create({
      ...payload,
      currency: 'MMK',
      itemCount,
      itemsCount: itemCount,
      orderNumber: `ORD-${Date.now()}`,
      placedAt: new Date(),
      status: 'pending',
      tenantId,
      userId
    });
  }
}
