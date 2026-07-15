import { BaseRepository } from '@core/base/BaseRepository';
import { getTenantModels } from '@core/database/tenant-database';
import { Order } from '@modules/orders/order.types';

export class OrderRepository extends BaseRepository<Order> {
  constructor(tenantId: string) {
    super(getTenantModels(tenantId).OrderModel);
  }

  async findNewestFirst(filter: Record<string, unknown>): Promise<Order[]> {
    return this.model
      .find(filter)
      .sort({ placedAt: -1, createdAt: -1, _id: -1 })
      .lean<Order[]>()
      .exec();
  }
}
