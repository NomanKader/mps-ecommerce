import { BaseService } from '@core/base/BaseService';
import { CartRepository } from '@modules/carts/cart.repository';
import { Cart } from '@modules/carts/cart.types';

export class CartService extends BaseService {
  constructor(private readonly cartRepository = new CartRepository()) {
    super();
  }

  async listCarts(tenantId?: string): Promise<Cart[]> {
    return this.cartRepository.find(tenantId ? { tenantId } : {});
  }
}
