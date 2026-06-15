import { BaseService } from '@core/base/BaseService';
import { ProductRepository } from '@modules/products/product.repository';
import { Product } from '@modules/products/product.types';

export class ProductService extends BaseService {
  constructor() {
    super();
  }

  async listProducts(tenantId?: string): Promise<Product[]> {
    if (!tenantId) return [];
    return new ProductRepository(tenantId).find({ tenantId });
  }
}
