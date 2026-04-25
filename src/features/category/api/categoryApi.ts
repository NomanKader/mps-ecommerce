import { endpoints } from '@shared/api/endpoints';
import { mockCategories } from '@shared/lib/mockData';

import type { Category } from '@entities/category/types/category.types';

export const categoryApi = {
  async getCategories(): Promise<Category[]> {
    void endpoints.categories.list;

    return Promise.resolve(mockCategories);
  },
};
