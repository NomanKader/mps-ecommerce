import { BaseService } from '@core/base/BaseService';
import { CategoryRepository } from '@modules/categories/category.repository';
import { Category } from '@modules/categories/category.types';

export class CategoryService extends BaseService {
  constructor() {
    super();
  }

  async listCategories(tenantId?: string): Promise<Category[]> {
    if (!tenantId) return [];
    return new CategoryRepository(tenantId).findSorted({
      tenantId,
      isDeleted: { $ne: true }
    });
  }
}
