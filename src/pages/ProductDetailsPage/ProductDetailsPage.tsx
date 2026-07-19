import AddRoundedIcon from '@mui/icons-material/AddRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded';
import { Box, Card, Fab, Grid, IconButton, Skeleton, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';

import { storefrontColors } from '@app/providers/theme/tokens';
import type { Category } from '@entities/category/types/category.types';
import type { Product } from '@entities/product/types/product.types';
import { useCart } from '@features/cart/hooks/useCart';
import { categoryApi } from '@features/category/api/categoryApi';
import { useFavorites } from '@features/favorites/hooks/useFavorites';
import type { StoreProduct } from '@features/home/types/home.types';
import { mapHomeProductToProduct } from '@features/home/utils/mapHomeProductToProduct';
import { productApi } from '@features/product/api/productApi';
import { useProducts } from '@features/product/hooks/useProducts';
import { EmptyState } from '@shared/components/ui/EmptyState/EmptyState';
import { AppBackButton } from '@shared/components/ui/BackButton/AppBackButton';
import { routePaths } from '@routes/routePaths';
import { ProductGrid } from '@widgets/ProductGrid/ProductGrid';
import {
  storefrontMutedPanelSx,
  storefrontPanelSx,
  storefrontSectionTitleSx,
} from '@shared/styles/storefront';
import { formatCurrency } from '@utils/formatCurrency';

type ProductDetailContent = {
  description: string[];
  gallery: string[];
  highlightLabel?: string;
  keyFeatures: string[];
  packLabel: string;
};

const productDetailOverrides: Record<string, ProductDetailContent> = {
  'home-offer-2': {
    description: [
      'Parsnips from the United Kingdom, presented as 4 to 5 whole roots per kilogram. They have a naturally sweet, earthy profile that works especially well for roasting, soups, mash, and mixed vegetable trays.',
      "This selection is positioned as an everyday produce staple with consistent sizing, a smooth pale skin tone, and a flavour that deepens when cooked. The layout below mirrors the supplied AV's Store-inspired product detail experience with gallery, pricing, description, and related picks.",
    ],
    gallery: [
      'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1603048719539-9ecb74f38d79?auto=format&fit=crop&w=1200&q=80',
    ],
    highlightLabel: 'Ugly But Tasty',
    keyFeatures: [
      'Whole parsnips prepared for roasting, soups, or mash.',
      'Mildly sweet, earthy flavour with a firm texture.',
      'Suitable for everyday home cooking and meal prep.',
      'Selected for visual consistency and dependable sizing.',
      'Works well as a side dish or as part of mixed root-vegetable recipes.',
    ],
    packLabel: '4 to 5 pieces per kg',
  },
};

const parseStorefrontUnit = (unit: string, price: number) => {
  const [amount, qualifier] = unit.split('/').map((part) => part.trim());
  const parsedAmount = Number(amount);
  const previousPrice =
    !Number.isNaN(parsedAmount) && qualifier && parsedAmount > price ? parsedAmount : null;

  return {
    oldPrice: previousPrice,
    qualifier: qualifier ?? '',
  };
};

const isStoreProduct = (product: StoreProduct | Product): product is StoreProduct =>
  'origin' in product && 'unit' in product;

const toGenericProduct = (product: StoreProduct | Product) =>
  isStoreProduct(product) ? mapHomeProductToProduct(product) : product;

const isOpaqueId = (value: string) => /^[a-f0-9]{24}$/i.test(value);

const getProductCategoryLabel = (product: StoreProduct | Product, categories: Category[]) => {
  if ('tags' in product && product.tags.includes('root-veg')) {
    return 'Root Vegetables';
  }

  if ('categoryId' in product) {
    const category = categories.find((item) => item.id === product.categoryId);

    if (category) {
      return category.name;
    }

    if (isOpaqueId(product.categoryId)) {
      return null;
    }

    return product.categoryId
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  return 'Storefront Picks';
};

const getProductDetailContent = (product: StoreProduct | Product): ProductDetailContent => {
  if (isStoreProduct(product)) {
    return (
      productDetailOverrides[product.id] ?? {
        description: [
          `${product.name} from ${product.origin} is merchandised as a premium storefront product with a clean, image-led layout and simple purchase controls.`,
          product.description,
        ],
        gallery: [product.imageUrl, product.imageUrl, product.imageUrl],
        keyFeatures: [
          `Origin: ${product.origin}.`,
          `Pack / unit: ${product.unit}.`,
          `SKU: ${product.sku}.`,
          `Inventory available: ${product.inventory}.`,
          'Presented in the same reusable storefront structure as the homepage merchandising cards.',
        ],
        packLabel: product.unit,
      }
    );
  }

  return {
    description: [
      product.description,
      'This product is available through the same shared storefront shell, using the project’s reusable navigation, page container, and footer components.',
    ],
    gallery: [product.imageUrl, product.imageUrl, product.imageUrl].filter(Boolean),
    keyFeatures: [
      `SKU: ${product.sku}.`,
      `Inventory available: ${product.inventory}.`,
      `Price: ${formatCurrency(product.price, product.currency)}.`,
    ],
    packLabel: 'Storefront product',
  };
};

type ProductDetailsContentProps = {
  productId: string;
};

const ProductDetailsSkeleton = () => (
  <Stack spacing={{ md: 5, xs: 4 }}>
    <Grid container spacing={{ md: 4, xs: 3 }}>
      <Grid size={{ md: 7, xs: 12 }}>
        <Stack spacing={2.5}>
          <Card sx={{ ...storefrontPanelSx, borderRadius: 1, p: { md: 5, xs: 3 }, width: '100%' }}>
            <Skeleton
              animation="wave"
              sx={{ borderRadius: 1, minHeight: { md: 620, xs: 360 }, width: '100%' }}
              variant="rectangular"
            />
          </Card>
          <Box
            sx={{
              columnGap: 1.5,
              display: 'grid',
              gridTemplateColumns: {
                md: 'repeat(3, minmax(0, 220px))',
                xs: 'repeat(3, minmax(0, 1fr))',
              },
            }}
          >
            {[0, 1, 2].map((item) => (
              <Skeleton
                animation="wave"
                key={item}
                sx={{ borderRadius: 1, height: { md: 204, xs: 116 }, width: '100%' }}
                variant="rectangular"
              />
            ))}
          </Box>
        </Stack>
      </Grid>
      <Grid size={{ md: 5, xs: 12 }}>
        <Stack spacing={2}>
          <Stack spacing={1.1}>
            <Skeleton animation="wave" height={72} width="80%" />
            <Skeleton animation="wave" height={28} width="32%" />
            <Skeleton animation="wave" height={28} width="44%" />
          </Stack>
          <Skeleton animation="wave" height={64} width="42%" />
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Skeleton animation="wave" height={56} variant="rounded" width={56} />
            <Skeleton animation="wave" height={48} width={32} />
            <Skeleton animation="wave" height={56} variant="rounded" width={56} />
          </Stack>
          <Skeleton animation="wave" height={28} width="72%" />
          <Skeleton animation="wave" height={28} width="58%" />
          <Card sx={{ ...storefrontPanelSx, borderRadius: 1, p: 2.25, width: '100%' }}>
            <Stack spacing={1.1}>
              <Skeleton animation="wave" height={32} width="40%" />
              <Skeleton animation="wave" height={24} width="56%" />
              <Skeleton animation="wave" height={24} width="48%" />
              <Skeleton animation="wave" height={24} width="38%" />
            </Stack>
          </Card>
        </Stack>
      </Grid>
    </Grid>
    <Card sx={{ ...storefrontPanelSx, borderRadius: 1, p: { md: 3, xs: 2 } }}>
      <Stack spacing={2}>
        <Skeleton animation="wave" height={42} width="28%" />
        <Skeleton animation="wave" height={24} width="100%" />
        <Skeleton animation="wave" height={24} width="92%" />
        <Skeleton animation="wave" height={24} width="78%" />
      </Stack>
    </Card>
  </Stack>
);

const ProductDetailsContent = ({ productId }: ProductDetailsContentProps) => {
  const { addToCart } = useCart();
  const { isFavorite, isToggling, toggleFavorite } = useFavorites();
  const allProductsQuery = useProducts();
  const productQuery = useQuery({
    enabled: Boolean(productId),
    queryFn: ({ signal }) => productApi.getProductById(productId, { signal }),
    queryKey: ['products', productId],
    retry: false,
  });
  const categoriesQuery = useQuery({
    queryFn: ({ signal }) => categoryApi.getCategories({ signal }),
    queryKey: ['categories'],
  });
  const product = productQuery.data;
  const categories = categoriesQuery.data ?? [];
  const detailContent = useMemo(
    () => (product ? getProductDetailContent(product) : null),
    [product],
  );
  const relatedProducts = useMemo(
    () => {
      const products = allProductsQuery.data ?? [];

      return product
        ? products
            .filter((item) => item.id !== product.id && item.categoryId === product.categoryId)
            .slice(0, 4)
        : [];
    },
    [allProductsQuery.data, product],
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const isLoadingProduct = productQuery.isLoading || productQuery.isFetching;
  const isLoadingSupportingData = categoriesQuery.isLoading || allProductsQuery.isLoading;

  if (isLoadingProduct || isLoadingSupportingData) {
    return <ProductDetailsSkeleton />;
  }

  if (!product || !detailContent) {
    return (
      <Card sx={{ ...storefrontPanelSx, p: { md: 4, xs: 2.5 } }}>
        <Stack spacing={1.5}>
          <Typography sx={storefrontSectionTitleSx} variant="h3">
            Product not found
          </Typography>
          <Typography color={storefrontColors.muted} variant="body1">
            This item will be available soon. Check back after the catalog team publishes it.
          </Typography>
        </Stack>
      </Card>
    );
  }

  const selectedImage = detailContent.gallery[selectedImageIndex] ?? product.imageUrl;
  const categoryLabel = getProductCategoryLabel(product, categories);
  const relatedTitle = categoryLabel ? `More in ${categoryLabel}` : 'More products you may like';
  const productForCart = toGenericProduct(product);
  const productIsFavorite = isFavorite(product.id);
  const origin = isStoreProduct(product) ? product.origin : 'Storefront';
  const unit = isStoreProduct(product) ? product.unit : detailContent.packLabel;
  const { oldPrice, qualifier } = isStoreProduct(product)
    ? parseStorefrontUnit(product.unit, product.price)
    : { oldPrice: null, qualifier: '' };

  const handleIncreaseQuantity = () => {
    setQuantity((current) => current + 1);
    addToCart(productForCart);
  };

  const handleDecreaseQuantity = () => {
    setQuantity((current) => Math.max(0, current - 1));
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      text: product.description,
      title: product.name,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      toast.success('Product link copied');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

      toast.error('Unable to share this product');
    }
  };

  return (
    <Stack spacing={{ md: 5, xs: 4 }}>
      <Grid container spacing={{ md: 4, xs: 3 }}>
        <Grid size={{ md: 7, xs: 12 }}>
          <Stack spacing={2.5}>
            <Card
              sx={{
                ...storefrontPanelSx,
                borderRadius: 1,
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {detailContent.highlightLabel ? (
                <Box
                  sx={{
                    backgroundColor: alpha(storefrontColors.navy, 0.12),
                    borderRadius: '0 0 8px 0',
                    color: storefrontColors.navy,
                    left: 0,
                    px: 1,
                    py: 0.55,
                    position: 'absolute',
                    top: 0,
                    zIndex: 1,
                  }}
                >
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, lineHeight: 1 }}>
                    {detailContent.highlightLabel}
                  </Typography>
                </Box>
              ) : null}

              <Stack spacing={1} sx={{ position: 'absolute', right: 10, top: 12, zIndex: 1 }}>
                <IconButton
                  aria-label={`${productIsFavorite ? 'Remove' : 'Save'} ${product.name}`}
                  disabled={isToggling}
                  onClick={() => toggleFavorite(product.id)}
                  sx={{ color: productIsFavorite ? storefrontColors.navy : '#d9d4cf' }}
                >
                  {productIsFavorite ? (
                    <FavoriteRoundedIcon sx={{ fontSize: 34 }} />
                  ) : (
                    <FavoriteBorderRoundedIcon sx={{ fontSize: 34 }} />
                  )}
                </IconButton>
                <IconButton
                  aria-label={`Share ${product.name}`}
                  onClick={() => void handleShare()}
                  sx={{ color: storefrontColors.navy }}
                >
                  <ShareRoundedIcon />
                </IconButton>
              </Stack>

              <Box
                sx={{
                  alignItems: 'center',
                  display: 'flex',
                  justifyContent: 'center',
                  minHeight: { md: 620, xs: 360 },
                  p: { md: 5, xs: 3 },
                  position: 'relative',
                }}
              >
                <Box
                  alt={product.name}
                  component="img"
                  src={selectedImage}
                  sx={{ display: 'block', maxHeight: 540, objectFit: 'contain', width: '100%' }}
                />
                <IconButton
                  sx={{
                    backgroundColor: alpha('#ffffff', 0.88),
                    bottom: 18,
                    boxShadow: `0 12px 24px ${alpha(storefrontColors.navyDark, 0.12)}`,
                    color: '#111111',
                    position: 'absolute',
                    right: 18,
                    '&:hover': {
                      backgroundColor: storefrontColors.surface,
                    },
                  }}
                >
                  <ZoomInRoundedIcon />
                </IconButton>
              </Box>
            </Card>

            <Box
              sx={{
                columnGap: 1.5,
                display: 'grid',
                gridTemplateColumns: {
                  md: 'repeat(3, minmax(0, 220px))',
                  xs: 'repeat(3, minmax(0, 1fr))',
                },
              }}
            >
              {detailContent.gallery.slice(0, 3).map((image, index) => (
                <Box
                  component="button"
                  key={`${product.id}-gallery-${index}`}
                  onClick={() => setSelectedImageIndex(index)}
                  sx={{
                    backgroundColor: storefrontColors.surface,
                    border: `1px solid ${index === selectedImageIndex ? storefrontColors.navy : storefrontColors.border}`,
                    borderRadius: 1,
                    cursor: 'pointer',
                    overflow: 'hidden',
                    p: 0,
                  }}
                >
                  <Box
                    alt={`${product.name} preview ${index + 1}`}
                    component="img"
                    src={image}
                    sx={{
                      display: 'block',
                      height: { md: 204, xs: 116 },
                      objectFit: 'cover',
                      width: '100%',
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Stack>
        </Grid>

        <Grid size={{ md: 5, xs: 12 }}>
          <Stack spacing={2}>
            <Stack spacing={1.1}>
              <Typography sx={{ color: storefrontColors.navy, fontWeight: 500 }} variant="h2">
                {product.name}
              </Typography>
              <Typography
                sx={{
                  color: storefrontColors.accent,
                  fontSize: '1.05rem',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                }}
              >
                {origin}
              </Typography>
              <Typography sx={{ color: '#4f535d', fontSize: '1rem' }}>
                {detailContent.packLabel}
              </Typography>
            </Stack>

            <Box>
              <Typography
                component="span"
                sx={{
                  color: '#b1293d',
                  fontSize: { md: '2.1rem', xs: '1.85rem' },
                  fontWeight: 800,
                  letterSpacing: '-0.04em',
                }}
              >
                {formatCurrency(product.price, product.currency)}
              </Typography>
              {oldPrice ? (
                <Typography
                  component="span"
                  sx={{
                    color: '#5d6168',
                    fontSize: '1.4rem',
                    fontWeight: 700,
                    ml: 0.9,
                    textDecoration: 'line-through',
                  }}
                >
                  {formatCurrency(oldPrice, product.currency)}
                </Typography>
              ) : null}
              {qualifier ? (
                <Typography component="span" sx={{ color: '#56585e', fontSize: '1.2rem', ml: 0.3 }}>
                  /{qualifier}
                </Typography>
              ) : null}
            </Box>

            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', pt: 0.5 }}>
              <IconButton
                disabled={quantity === 0}
                onClick={handleDecreaseQuantity}
                sx={{
                  backgroundColor: storefrontColors.navy,
                  borderRadius: 0.5,
                  color: storefrontColors.surface,
                  height: 56,
                  width: 56,
                  '&.Mui-disabled': {
                    backgroundColor: alpha(storefrontColors.navy, 0.32),
                    color: storefrontColors.surface,
                  },
                  '&:hover': {
                    backgroundColor: storefrontColors.navyDark,
                  },
                }}
              >
                <RemoveRoundedIcon />
              </IconButton>
              <Typography
                sx={{
                  color: storefrontColors.navy,
                  fontSize: '2rem',
                  fontWeight: 700,
                  minWidth: 32,
                  textAlign: 'center',
                }}
              >
                {quantity}
              </Typography>
              <IconButton
                onClick={handleIncreaseQuantity}
                sx={{
                  backgroundColor: storefrontColors.navy,
                  borderRadius: 0.5,
                  color: storefrontColors.surface,
                  height: 56,
                  width: 56,
                  '&:hover': {
                    backgroundColor: storefrontColors.navyDark,
                  },
                }}
              >
                <AddRoundedIcon />
              </IconButton>
            </Stack>

            <Typography
              sx={{ color: storefrontColors.muted, lineHeight: 1.8, maxWidth: 460 }}
              variant="body1"
            >
              {product.description}
            </Typography>

            <Card sx={{ ...storefrontPanelSx, borderRadius: 1, p: 2.25 }}>
              <Stack spacing={1.1}>
                <Typography sx={{ color: storefrontColors.navy, fontWeight: 800 }} variant="h6">
                  Product Details
                </Typography>
                <Typography sx={{ color: storefrontColors.muted }} variant="body2">
                  SKU: {product.sku}
                </Typography>
                <Typography sx={{ color: storefrontColors.muted }} variant="body2">
                  Inventory: {product.inventory}
                </Typography>
                <Typography sx={{ color: storefrontColors.muted }} variant="body2">
                  Unit: {unit}
                </Typography>
              </Stack>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      <Box sx={{ maxWidth: 860 }}>
        <Stack spacing={2.3}>
          <Box sx={{ borderBottom: `1px solid ${storefrontColors.border}`, pb: 0.2 }}>
            <Typography
              sx={{
                borderBottom: `3px solid ${storefrontColors.navy}`,
                color: storefrontColors.navy,
                display: 'inline-block',
                fontSize: '1.95rem',
                fontWeight: 800,
                pb: 1.1,
                pr: 8,
              }}
            >
              Description
            </Typography>
          </Box>

          <Card sx={{ ...storefrontPanelSx, borderRadius: 1, p: { md: 3, xs: 2 } }}>
            <Stack spacing={2.4}>
              {detailContent.description.map((paragraph) => (
                <Typography
                  key={paragraph}
                  sx={{ color: '#4e535c', lineHeight: 1.75 }}
                  variant="body1"
                >
                  {paragraph}
                </Typography>
              ))}

              <Box>
                <Typography sx={{ color: '#4e535c', fontWeight: 700, mb: 1.5 }} variant="h6">
                  Key Features:
                </Typography>
                <Stack spacing={1}>
                  {detailContent.keyFeatures.map((feature) => (
                    <Typography
                      key={feature}
                      sx={{ color: '#4e535c', lineHeight: 1.65 }}
                      variant="body1"
                    >
                      - {feature}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            </Stack>
          </Card>
        </Stack>
      </Box>

      <Box
        sx={{
          ...storefrontMutedPanelSx,
          borderRadius: 1,
          px: { md: 3, xs: 2 },
          py: { md: 3, xs: 2.5 },
        }}
      >
        <Stack spacing={2.5}>
          <Typography
            sx={{ ...storefrontSectionTitleSx, fontSize: { md: '2.2rem', xs: '1.8rem' } }}
            variant="h3"
          >
            {relatedTitle}
          </Typography>
          {relatedProducts.length ? (
            <ProductGrid onAddToCart={addToCart} products={relatedProducts} />
          ) : (
            <EmptyState
              description="More products from this category will be available soon."
              title="Related items coming soon"
            />
          )}
        </Stack>
      </Box>

      <Fab
        aria-label="Scroll to top"
        onClick={() => window.scrollTo({ behavior: 'smooth', top: 0 })}
        sx={{
          backgroundColor: alpha(storefrontColors.navyDark, 0.92),
          bottom: { md: 24, xs: 'calc(72px + env(safe-area-inset-bottom, 0px) + 16px)' },
          color: storefrontColors.surface,
          height: { md: 56, xs: 48 },
          position: 'fixed',
          right: { md: 24, xs: 18 },
          width: { md: 56, xs: 48 },
          '&:hover': {
            backgroundColor: storefrontColors.navyDark,
          },
        }}
      >
        <KeyboardArrowUpRoundedIcon />
      </Fab>
    </Stack>
  );
};

export const ProductDetailsPage = () => {
  const { productId = '' } = useParams();

  return (
    <Stack spacing={2.5}>
      <AppBackButton label="Back to products" to={routePaths.catalog} />
      <ProductDetailsContent key={productId} productId={productId} />
    </Stack>
  );
};
