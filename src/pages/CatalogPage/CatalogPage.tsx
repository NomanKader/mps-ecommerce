import { useMemo } from 'react';
import { Stack } from '@mui/material';
import { useSearchParams } from 'react-router-dom';

import { useCart } from '@features/cart/hooks/useCart';
import { useProducts } from '@features/product/hooks/useProducts';
import { mapHomeProductToProduct } from '@features/home/utils/mapHomeProductToProduct';
import { allStorefrontProducts } from '@features/home/utils/storefrontProducts';
import { EmptyState } from '@shared/components/ui/EmptyState/EmptyState';
import { PageSection } from '@shared/components/ui/SectionTitle/PageSection';
import { ProductFilters } from '@widgets/ProductFilters/ProductFilters';
import { ProductGrid } from '@widgets/ProductGrid/ProductGrid';

const categoryLabels: Record<string, string> = {
  all: 'Catalog',
  bakery: 'Bakery',
  care: 'Self-care',
  'cat-1': 'Fresh Produce',
  'cat-2': 'Bakery',
  'cat-3': 'Pantry',
  dairy: 'Dairy',
  drinks: 'Drinks',
  flowers: 'Flowers',
  fruits: 'Fruits',
  gifts: 'Gifts',
  home: 'Home',
  kids: 'Kids',
  meat: 'Meat',
  pantry: 'Pantry',
  pets: 'Pets',
  'quick-meals': 'Quick Meals',
  seafood: 'Seafood',
  vegetables: 'Vegetables',
};

export const CatalogPage = () => {
  const { addToCart } = useCart();
  const { data = [] } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') ?? '';
  const category = searchParams.get('category') ?? 'all';
  const pageTitle = searchParams.get('title') ?? categoryLabels[category] ?? 'Catalog';
  const catalogProducts = useMemo(
    () => [...data, ...allStorefrontProducts.map(mapHomeProductToProduct)],
    [data],
  );

  const filteredProducts = useMemo(
    () =>
      catalogProducts.filter((product) => {
        const matchesCategory = category === 'all' || product.categoryId === category;
        const matchesSearch =
          search.length === 0 ||
          [product.name, product.description, product.sku, ...product.tags]
            .join(' ')
            .toLowerCase()
            .includes(search.toLowerCase());

        return matchesCategory && matchesSearch;
      }),
    [catalogProducts, category, search],
  );

  const updateSearchParams = (updates: { category?: string; search?: string }) => {
    const nextParams = new URLSearchParams(searchParams);

    if (updates.category !== undefined) {
      nextParams.set('category', updates.category);
      nextParams.set('title', categoryLabels[updates.category] ?? 'Catalog');
    }

    if (updates.search !== undefined) {
      if (updates.search.trim()) {
        nextParams.set('search', updates.search);
      } else {
        nextParams.delete('search');
      }
    }

    setSearchParams(nextParams, { replace: true });
  };

  return (
    <Stack spacing={4}>
      <PageSection
        description="Browse all matching products for the selected storefront category."
        title={pageTitle}
      >
        <ProductFilters
          category={category}
          onCategoryChange={(value) => updateSearchParams({ category: value })}
          onSearchChange={(value) => updateSearchParams({ search: value })}
          search={search}
        />
        {filteredProducts.length ? (
          <ProductGrid onAddToCart={addToCart} products={filteredProducts} />
        ) : (
          <EmptyState
            description="Adjust filters or connect the live product API later."
            title="No products match the current filters"
          />
        )}
      </PageSection>
    </Stack>
  );
};
