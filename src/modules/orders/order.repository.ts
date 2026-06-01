import { BaseRepository } from '@core/base/BaseRepository';
import { OrderModel } from '@modules/orders/order.model';
import { Order } from '@modules/orders/order.types';

export class OrderRepository extends BaseRepository<Order> {
  constructor() {
    super(OrderModel);
  }
}
