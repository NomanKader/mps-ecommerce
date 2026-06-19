import type { Category } from '@entities/category/types/category.types';
import { apiClient } from '@shared/api/axios';
import { endpoints } from '@shared/api/endpoints';
import type { ApiResponse } from '../../../types/api';

type BackendCategory = Omit<Category, 'id' | 'subcategories'> & {
  _id: string;
  subcategories?: string[];
};

type ListOptions = { signal?: globalThis.AbortSignal };

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const mapCategory = ({ _id, subcategories = [], ...category }: BackendCategory): Category => ({
  ...category,
  id: _id,
  subcategories: subcategories.map((subcategory) => ({
    icon: category.icon ?? '',
    id: `${_id}-${slugify(subcategory)}`,
    name: subcategory,
    slug: slugify(subcategory),
  })),
});

export const categoryApi = {
  async getCategories(options: ListOptions = {}): Promise<Category[]> {
    const response = await apiClient.get<ApiResponse<BackendCategory[]>>(
      endpoints.categories.list,
      {
        signal: options.signal,
      },
    );

    return response.data.data.map(mapCategory);
  },
};
