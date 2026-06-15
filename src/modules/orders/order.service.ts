import { BaseService } from '@core/base/BaseService';
import { OrderRepository } from '@modules/orders/order.repository';
import { Order } from '@modules/orders/order.types';

export class OrderService extends BaseService {
  constructor() {
    super();
  }

  async listOrders(tenantId?: string): Promise<Order[]> {
    if (!tenantId) return [];
    return new OrderRepository(tenantId).find({ tenantId });
  }
}
