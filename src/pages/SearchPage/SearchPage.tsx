import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import type { Product } from '@entities/product/types/product.types';
import { storefrontColors } from '@app/providers/theme/tokens';
import { categoryApi } from '@features/category/api/categoryApi';
import { useCart } from '@features/cart/hooks/useCart';
import { productApi } from '@features/product/api/productApi';
import { mapHomeProductToProduct } from '@features/home/utils/mapHomeProductToProduct';
import { allStorefrontProducts } from '@features/home/utils/storefrontProducts';
import { routePaths } from '@routes/routePaths';
import { formatCurrency } from '@utils/formatCurrency';

const resultLimit = 18;

const categoryPath = (categoryId: string, title: string, search?: string) => {
  const params = new URLSearchParams({ category: categoryId, title });

  if (search) {
    params.set('search', search);
  }

  return `${routePaths.catalog}?${params.toString()}`;
};

const productPath = (productId: string) =>
  routePaths.productDetails.replace(':productId', productId);

const normalizeSearchTerms = (value: string) =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((term) => (term.length > 3 && term.endsWith('s') ? term.slice(0, -1) : term))
    .filter(Boolean);

const matchesProduct = (product: Product, search: string) => {
  const productTerms = normalizeSearchTerms(
    [
      product.name,
      product.description,
      product.categoryName,
      product.subcategory,
      product.sku,
      ...product.tags,
    ]
      .filter(Boolean)
      .join(' '),
  );
  const searchableValue = productTerms.join(' ');

  return normalizeSearchTerms(search).every((term) => searchableValue.includes(term));
};

const toCartProduct = (product: Product) => ({
  badges: [],
  categoryId: product.categoryId,
  currency: product.currency,
  description: product.description,
  id: product.id,
  imageUrl: product.imageUrl,
  inventory: product.inventory,
  name: product.name,
  origin: product.categoryName ?? product.subcategory ?? '',
  price: product.price,
  rating: product.rating,
  sku: product.sku,
  slug: product.slug,
  tags: product.tags,
  tenantId: product.tenantId,
  unit: product.subcategory ?? 'item',
});

export const SearchPage = () => {
  const { addToCart } = useCart();
  const [searchParams] = useSearchParams();
  const searchValue = searchParams.get('search') ?? '';
  const normalizedSearch = searchValue.trim().toLowerCase();
  const categoriesQuery = useQuery({
    queryFn: ({ signal }) => categoryApi.getCategories({ signal }),
    queryKey: ['searchpage', 'categories'],
  });
  const productsQuery = useQuery({
    queryFn: ({ signal }) => productApi.getProducts({ signal }),
    queryKey: ['searchpage', 'products'],
  });
  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);
  const products = useMemo(() => {
    const productsById = new Map(
      allStorefrontProducts.map((product) => [
        product.id,
        mapHomeProductToProduct(product),
      ]),
    );

    (productsQuery.data ?? []).forEach((product) => productsById.set(product.id, product));

    return [...productsById.values()];
  }, [productsQuery.data]);
  const matchedProducts = useMemo(() => {
    if (!normalizedSearch) {
      return products.slice(0, 8);
    }

    return products.filter((product) => matchesProduct(product, normalizedSearch)).slice(0, resultLimit);
  }, [normalizedSearch, products]);
  const matchedCategories = useMemo(() => {
    if (!normalizedSearch) {
      return categories;
    }

    return categories.filter((category) =>
      [category.name, category.slug, ...(category.subcategories ?? []).map((item) => item.name)]
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [categories, normalizedSearch]);
  const isLoading = categoriesQuery.isLoading || productsQuery.isLoading;

  return (
    <Box
      sx={{
        backgroundColor: storefrontColors.surface,
        minHeight: '100dvh',
        pb: { md: 5, xs: 'calc(92px + env(safe-area-inset-bottom, 0px))' },
      }}
    >
      <Stack
        spacing={{ md: 3, xs: 2.2 }}
        sx={{
          mx: 'auto',
          maxWidth: 980,
          px: { md: 3, xs: 2 },
          py: { md: 4, xs: 2.2 },
        }}
      >
        <Box sx={{ display: { md: 'block', xs: 'none' } }}>
          <Typography sx={{ color: storefrontColors.navy, fontSize: '2.2rem', fontWeight: 900 }}>
            Search
          </Typography>
        </Box>

        {isLoading ? (
          <Stack sx={{ alignItems: 'center', py: 8 }}>
            <CircularProgress sx={{ color: storefrontColors.navy }} />
          </Stack>
        ) : (
          <>
            <Stack spacing={1.1}>
              <Typography sx={{ color: storefrontColors.navy, fontSize: '1.25rem', fontWeight: 900 }}>
                {normalizedSearch ? 'Categories' : 'Shop by category'}
              </Typography>
              <Stack
                sx={{
                  border: `1px solid ${storefrontColors.border}`,
                  borderRadius: 1,
                  overflow: 'hidden',
                }}
              >
                {matchedCategories.slice(0, normalizedSearch ? 8 : 14).map((category) => (
                  <Box
                    component={Link}
                    key={category.id}
                    sx={{
                      alignItems: 'center',
                      backgroundColor: '#ffffff',
                      borderBottom: `1px solid ${storefrontColors.border}`,
                      color: storefrontColors.slate,
                      display: 'grid',
                      gap: 1.4,
                      gridTemplateColumns: '44px 1fr auto',
                      minHeight: 64,
                      px: 1.4,
                      textDecoration: 'none',
                      '&:last-of-type': { borderBottom: 0 },
                    }}
                    to={categoryPath(category.id, category.name)}
                  >
                    <Box
                      sx={{
                        alignItems: 'center',
                        backgroundColor: category.color ?? storefrontColors.accentSoft,
                        borderRadius: 1,
                        display: 'flex',
                        fontSize: 25,
                        height: 44,
                        justifyContent: 'center',
                        width: 44,
                      }}
                    >
                      {category.icon || '🏷️'}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: '1rem', fontWeight: 900, lineHeight: 1.15 }}>
                        {category.name}
                      </Typography>
                      {category.subcategories?.length ? (
                        <Typography
                          sx={{
                            color: storefrontColors.muted,
                            fontSize: '0.82rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {category.subcategories.slice(0, 3).map((item) => item.name).join(', ')}
                        </Typography>
                      ) : null}
                    </Box>
                    <ChevronRightRoundedIcon sx={{ color: storefrontColors.muted }} />
                  </Box>
                ))}
              </Stack>
            </Stack>

            <Stack spacing={1.1}>
              <Typography sx={{ color: storefrontColors.navy, fontSize: '1.25rem', fontWeight: 900 }}>
                {normalizedSearch ? 'Search results' : 'Popular products'}
              </Typography>
              {matchedProducts.length ? (
                <Stack spacing={1}>
                  {matchedProducts.map((product) => (
                    <Box
                      key={product.id}
                      sx={{
                        alignItems: 'center',
                        border: `1px solid ${storefrontColors.border}`,
                        borderRadius: 1,
                        display: 'grid',
                        gap: 1.2,
                        gridTemplateColumns: '68px 1fr auto',
                        minHeight: 88,
                        p: 1,
                      }}
                    >
                      <Box
                        alt={product.name}
                        component="img"
                        src={product.imageUrl}
                        sx={{
                          aspectRatio: '1 / 1',
                          borderRadius: 1,
                          display: 'block',
                          objectFit: 'cover',
                          width: '100%',
                        }}
                      />
                      <Box
                        component={Link}
                        state={{ product }}
                        sx={{ color: 'inherit', minWidth: 0, textDecoration: 'none' }}
                        to={productPath(product.id)}
                      >
                        <Typography sx={{ fontSize: '0.96rem', fontWeight: 900, lineHeight: 1.2 }}>
                          {product.name}
                        </Typography>
                        <Typography
                          sx={{
                            color: storefrontColors.muted,
                            fontSize: '0.78rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {product.description || product.categoryName || product.subcategory}
                        </Typography>
                        <Typography sx={{ color: storefrontColors.navy, fontSize: '0.9rem', fontWeight: 900 }}>
                          {formatCurrency(product.price, product.currency)}
                        </Typography>
                      </Box>
                      <Button
                        aria-label={`Add ${product.name} to cart`}
                        onClick={() => addToCart(toCartProduct(product))}
                        sx={{
                          alignSelf: 'center',
                          background: `linear-gradient(180deg, ${storefrontColors.navy} 0%, ${storefrontColors.navyDark} 100%)`,
                          borderRadius: 999,
                          boxShadow: `0 10px 22px ${alpha(storefrontColors.navyDark, 0.18)}`,
                          color: '#ffffff',
                          height: 48,
                          minHeight: 48,
                          minWidth: 48,
                          p: 0,
                          width: 48,
                          '&:hover': {
                            background: storefrontColors.navyDark,
                          },
                        }}
                        variant="contained"
                      >
                        <AddRoundedIcon sx={{ fontSize: 30 }} />
                      </Button>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Box
                  sx={{
                    border: `1px dashed ${storefrontColors.border}`,
                    borderRadius: 1,
                    color: storefrontColors.muted,
                    p: 3,
                    textAlign: 'center',
                  }}
                >
                  No products found.
                </Box>
              )}
            </Stack>
          </>
        )}
      </Stack>
    </Box>
  );
};
