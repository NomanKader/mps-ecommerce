import AddRoundedIcon from '@mui/icons-material/AddRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded';
import {
  Box,
  Card,
  Fab,
  Grid,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { storefrontColors } from '@app/providers/theme/tokens';
import type { Product } from '@entities/product/types/product.types';
import { useCart } from '@features/cart/hooks/useCart';
import type { StoreProduct } from '@features/home/types/home.types';
import { mapHomeProductToProduct } from '@features/home/utils/mapHomeProductToProduct';
import { allStorefrontProducts, findStorefrontProductById, getRelatedStorefrontProducts } from '@features/home/utils/storefrontProducts';
import { useProducts } from '@features/product/hooks/useProducts';
import { StoreProductCard } from '@shared/components/storefront/StoreProductCard';
import { storefrontMutedPanelSx, storefrontPanelSx, storefrontSectionTitleSx } from '@shared/styles/storefront';
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
      'This selection is positioned as an everyday produce staple with consistent sizing, a smooth pale skin tone, and a flavour that deepens when cooked. The layout below mirrors the supplied Kibsons-inspired product detail experience with gallery, pricing, description, and related picks.',
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
  const previousPrice = !Number.isNaN(parsedAmount) && qualifier && parsedAmount > price ? parsedAmount : null;

  return {
    oldPrice: previousPrice,
    qualifier: qualifier ?? '',
  };
};

const isStoreProduct = (product: StoreProduct | Product): product is StoreProduct =>
  'origin' in product && 'unit' in product;

const toGenericProduct = (product: StoreProduct | Product) =>
  isStoreProduct(product) ? mapHomeProductToProduct(product) : product;

const getProductCategoryLabel = (product: StoreProduct | Product) => {
  if ('tags' in product && product.tags.includes('root-veg')) {
    return 'Root Vegetables';
  }

  if ('categoryId' in product) {
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

export const ProductDetailsPage = () => {
  const { productId = '' } = useParams();
  const { addToCart } = useCart();
  const { data = [] } = useProducts();

  const storefrontProduct = useMemo(() => findStorefrontProductById(productId), [productId]);
  const catalogProduct = useMemo(() => data.find((item) => item.id === productId), [data, productId]);
  const product = storefrontProduct ?? catalogProduct;
  const detailContent = useMemo(() => (product ? getProductDetailContent(product) : null), [product]);
  const relatedProducts = useMemo(
    () => (storefrontProduct ? getRelatedStorefrontProducts(storefrontProduct) : allStorefrontProducts.slice(0, 4)),
    [storefrontProduct],
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(0);

  useEffect(() => {
    setQuantity(0);
    setSelectedImageIndex(0);
  }, [productId]);

  if (!product || !detailContent) {
    return (
      <Card sx={{ ...storefrontPanelSx, p: { md: 4, xs: 2.5 } }}>
        <Stack spacing={1.5}>
          <Typography sx={storefrontSectionTitleSx} variant="h3">
            Product not found
          </Typography>
          <Typography color={storefrontColors.muted} variant="body1">
            The detail route is ready, but this product id does not exist in the current storefront data.
          </Typography>
        </Stack>
      </Card>
    );
  }

  const selectedImage = detailContent.gallery[selectedImageIndex] ?? product.imageUrl;
  const relatedTitle = `More in ${getProductCategoryLabel(product)}`;
  const productForCart = toGenericProduct(product);
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
                <IconButton sx={{ color: '#d9d4cf' }}>
                  <FavoriteBorderRoundedIcon sx={{ fontSize: 34 }} />
                </IconButton>
                <IconButton sx={{ color: storefrontColors.navy }}>
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
                gridTemplateColumns: { md: 'repeat(3, minmax(0, 220px))', xs: 'repeat(3, minmax(0, 1fr))' },
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
                    sx={{ display: 'block', height: { md: 204, xs: 116 }, objectFit: 'cover', width: '100%' }}
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
              <Typography sx={{ color: storefrontColors.navy, fontSize: '2rem', fontWeight: 700, minWidth: 32, textAlign: 'center' }}>
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

            <Typography sx={{ color: storefrontColors.muted, lineHeight: 1.8, maxWidth: 460 }} variant="body1">
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
                <Typography key={paragraph} sx={{ color: '#4e535c', lineHeight: 1.75 }} variant="body1">
                  {paragraph}
                </Typography>
              ))}

              <Box>
                <Typography sx={{ color: '#4e535c', fontWeight: 700, mb: 1.5 }} variant="h6">
                  Key Features:
                </Typography>
                <Stack spacing={1}>
                  {detailContent.keyFeatures.map((feature) => (
                    <Typography key={feature} sx={{ color: '#4e535c', lineHeight: 1.65 }} variant="body1">
                      - {feature}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            </Stack>
          </Card>
        </Stack>
      </Box>

      <Box sx={{ ...storefrontMutedPanelSx, borderRadius: 1, px: { md: 3, xs: 2 }, py: { md: 3, xs: 2.5 } }}>
        <Stack spacing={2.5}>
          <Typography sx={{ ...storefrontSectionTitleSx, fontSize: { md: '2.2rem', xs: '1.8rem' } }} variant="h3">
            {relatedTitle}
          </Typography>
          <Grid container spacing={2}>
            {relatedProducts.map((item) => (
              <Grid key={item.id} size={{ lg: 3, md: 6, xs: 12 }}>
                <StoreProductCard onAddToCart={(storeProduct) => addToCart(mapHomeProductToProduct(storeProduct))} product={item} />
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Box>

      <Fab
        aria-label="Scroll to top"
        onClick={() => window.scrollTo({ behavior: 'smooth', top: 0 })}
        sx={{
          backgroundColor: alpha(storefrontColors.navyDark, 0.92),
          bottom: 24,
          color: storefrontColors.surface,
          position: 'fixed',
          right: 24,
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
