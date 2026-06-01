import { BaseService } from '@core/base/BaseService';
import { CategoryRepository } from '@modules/categories/category.repository';
import { Category } from '@modules/categories/category.types';

export class CategoryService extends BaseService {
  constructor(private readonly categoryRepository = new CategoryRepository()) {
    super();
  }

  async listCategories(tenantId?: string): Promise<Category[]> {
    return this.categoryRepository.find(tenantId ? { tenantId } : {});
  }
}
