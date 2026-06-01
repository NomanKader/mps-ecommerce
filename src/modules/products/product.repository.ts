import { BaseRepository } from '@core/base/BaseRepository';
import { ProductModel } from '@modules/products/product.model';
import { Product } from '@modules/products/product.types';

export class ProductRepository extends BaseRepository<Product> {
  constructor() {
    super(ProductModel);
  }
}
