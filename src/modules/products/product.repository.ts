import { BaseRepository } from '@core/base/BaseRepository';
import { getTenantModels } from '@core/database/tenant-database';
import { Product } from '@modules/products/product.types';

export class ProductRepository extends BaseRepository<Product> {
  constructor(tenantId: string) {
    super(getTenantModels(tenantId).ProductModel);
  }
}
