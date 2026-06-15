import { BaseRepository } from '@core/base/BaseRepository';
import { getTenantModels } from '@core/database/tenant-database';
import { Cart } from '@modules/carts/cart.types';

export class CartRepository extends BaseRepository<Cart> {
  constructor(tenantId: string) {
    super(getTenantModels(tenantId).CartModel);
  }
}
