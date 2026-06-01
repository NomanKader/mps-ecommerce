import { BaseRepository } from '@core/base/BaseRepository';
import { CartModel } from '@modules/carts/cart.model';
import { Cart } from '@modules/carts/cart.types';

export class CartRepository extends BaseRepository<Cart> {
  constructor() {
    super(CartModel);
  }
}
