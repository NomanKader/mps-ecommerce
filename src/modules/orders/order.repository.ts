import { BaseRepository } from '@core/base/BaseRepository';
import { getTenantModels } from '@core/database/tenant-database';
import { Order } from '@modules/orders/order.types';

export class OrderRepository extends BaseRepository<Order> {
  constructor(tenantId: string) {
    super(getTenantModels(tenantId).OrderModel);
  }
}
