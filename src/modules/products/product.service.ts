import { BaseService } from '@core/base/BaseService';
import { ProductRepository } from '@modules/products/product.repository';
import { Product } from '@modules/products/product.types';

export class ProductService extends BaseService {
  constructor(private readonly productRepository = new ProductRepository()) {
    super();
  }

  async listProducts(tenantId?: string): Promise<Product[]> {
    return this.productRepository.find(tenantId ? { tenantId } : {});
  }
}
