import { BaseRepository } from '@core/base/BaseRepository';
import { getTenantModels } from '@core/database/tenant-database';
import { Category } from '@modules/categories/category.types';

export class CategoryRepository extends BaseRepository<Category> {
  constructor(tenantId: string) {
    super(getTenantModels(tenantId).CategoryModel);
  }
}
