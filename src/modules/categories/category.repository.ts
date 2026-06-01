import { BaseRepository } from '@core/base/BaseRepository';
import { CategoryModel } from '@modules/categories/category.model';
import { Category } from '@modules/categories/category.types';

export class CategoryRepository extends BaseRepository<Category> {
  constructor() {
    super(CategoryModel);
  }
}
