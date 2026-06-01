import { BaseService } from '@core/base/BaseService';
import { OrderRepository } from '@modules/orders/order.repository';
import { Order } from '@modules/orders/order.types';

export class OrderService extends BaseService {
  constructor(private readonly orderRepository = new OrderRepository()) {
    super();
  }

  async listOrders(tenantId?: string): Promise<Order[]> {
    return this.orderRepository.find(tenantId ? { tenantId } : {});
  }
}
