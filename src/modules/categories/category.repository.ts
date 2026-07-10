import { BaseRepository } from '@core/base/BaseRepository';
import { getTenantModels } from '@core/database/tenant-database';
import { Category } from '@modules/categories/category.types';

export class CategoryRepository extends BaseRepository<Category> {
  constructor(tenantId: string) {
    super(getTenantModels(tenantId).CategoryModel);
  }

  async findSorted(filter: Record<string, unknown>): Promise<Category[]> {
    return this.model.find(filter).sort({ sortOrder: 1, name: 1 }).lean<Category[]>().exec();
  }
}
