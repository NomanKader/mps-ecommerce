import { BaseService } from '@core/base/BaseService';
import { CartRepository } from '@modules/carts/cart.repository';
import { Cart } from '@modules/carts/cart.types';

export class CartService extends BaseService {
  constructor() {
    super();
  }

  async listCarts(tenantId?: string): Promise<Cart[]> {
    if (!tenantId) return [];
    return new CartRepository(tenantId).find({ tenantId });
  }
}
