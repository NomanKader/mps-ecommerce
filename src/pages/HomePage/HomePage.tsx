import AcUnitRoundedIcon from '@mui/icons-material/AcUnitRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import { Box, Button, Grid, IconButton, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { routePaths } from '@routes/routePaths';
import { storefrontColors, storefrontGradients } from '@app/providers/theme/tokens';
import { useCart } from '@features/cart/hooks/useCart';
import {
  featuredCategoryHighlights,
  heroBanner,
  pantryProducts,
  promoTiles,
  seasonalProducts,
  showcaseBanners,
  shopBrands,
  topBlooms,
  topOffers,
} from '@features/home/data/homePage.data';
import { mapHomeProductToProduct } from '@features/home/utils/mapHomeProductToProduct';
import { StoreProductCard, StoreProductCardSkeleton } from '@shared/components/storefront/StoreProductCard';
import { StorefrontSectionHeader } from '@shared/components/storefront/StorefrontSectionHeader';
import {
  storefrontMutedPanelSx,
  storefrontPanelSx,
} from '@shared/styles/storefront';
import type { StoreProduct } from '@features/home/types/home.types';

const promoTileThemes: Record<string, { accent: string; icon: string }> = {
  beauty: { accent: '#ab3a1e', icon: '🔪' },
  flowers: { accent: '#ffbc18', icon: '🍪' },
  meat: { accent: '#c97b22', icon: '🍽️' },
  milk: { accent: '#d62967', icon: '👜' },
  snacks: { accent: '#e05458', icon: '⬡' },
};

const getPromoTilePath = (tile: { targetCategoryId: string; targetSearch?: string; title: string }) => {
  const params = new URLSearchParams({
    category: tile.targetCategoryId,
    title: tile.title,
  });

  if (tile.targetSearch) {
    params.set('search', tile.targetSearch);
  }

  return `${routePaths.catalog}?${params.toString()}`;
};

const merchandisingHighlights = [
  ...featuredCategoryHighlights,
  { color: '#d2aa2d', icon: '🎁', id: 'custom-gift-boxes', label: 'Customised Gift Boxes', surfaceColor: '#fff9e8' },
  { color: '#e43224', icon: '👍', id: 'must-try', label: 'Must Try', surfaceColor: '#fff2b8' },
  { color: '#b9263d', icon: '🏬', id: 'local', label: 'Local', surfaceColor: '#fff0f3' },
  { color: '#e43224', icon: '⏳', id: 'coming-soon', label: 'Coming Soon', surfaceColor: '#fff2b8' },
];

const renderMerchandisingBadge = (itemId: string) => {
  const iconSx = { color: '#ffffff', fontSize: 32 };

  switch (itemId) {
    case 'promotion':
      return <LocalOfferOutlinedIcon sx={{ color: '#ffffff', fontSize: 30 }} />;
    case 'bulk':
      return <Inventory2OutlinedIcon sx={iconSx} />;
    case 'frozen':
      return <AcUnitRoundedIcon sx={iconSx} />;
    case 'organic':
      return <SpaOutlinedIcon sx={iconSx} />;
    case 'recipes':
      return <MenuBookRoundedIcon sx={iconSx} />;
    case 'new':
      return (
        <Typography sx={{ color: '#ffffff', fontSize: '1.02rem', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1 }}>
          NEW
        </Typography>
      );
    case 'imperfect':
      return (
        <Stack spacing={0.15} sx={{ alignItems: 'center' }}>
          <Typography sx={{ color: '#ffffff', fontSize: '1.55rem', lineHeight: 1 }}>
            🍓
          </Typography>
          <Typography sx={{ color: '#ffffff', fontSize: '0.48rem', fontWeight: 800, letterSpacing: '0.06em', lineHeight: 1 }}>
            IMPERFECT
          </Typography>
        </Stack>
      );
    case 'gluten-free':
      return (
        <Stack spacing={0.1} sx={{ alignItems: 'center' }}>
          <Typography sx={{ color: '#ffffff', fontSize: '0.56rem', fontWeight: 800, letterSpacing: '0.08em', lineHeight: 1 }}>
            GLUTEN
          </Typography>
          <Typography sx={{ color: '#ffffff', fontSize: '1.45rem', lineHeight: 1 }}>
            🌾
          </Typography>
          <Typography sx={{ color: '#ffffff', fontSize: '0.54rem', fontWeight: 800, letterSpacing: '0.06em', lineHeight: 1 }}>
            FREE
          </Typography>
        </Stack>
      );
    case 'no-sugar':
      return (
        <Stack spacing={0.05} sx={{ alignItems: 'center' }}>
          <Typography sx={{ color: '#ffffff', fontSize: '0.44rem', fontWeight: 800, letterSpacing: '0.07em', lineHeight: 1 }}>
            NO ADDED
          </Typography>
          <Typography sx={{ color: '#ffffff', fontSize: '1.25rem', lineHeight: 1 }}>
            🍬
          </Typography>
          <Typography sx={{ color: '#ffffff', fontSize: '0.5rem', fontWeight: 800, letterSpacing: '0.07em', lineHeight: 1 }}>
            SUGAR
          </Typography>
        </Stack>
      );
    case 'vegan':
      return (
        <Stack spacing={0.05} sx={{ alignItems: 'center' }}>
          <Typography sx={{ color: '#ffffff', fontSize: '1.35rem', fontStyle: 'italic', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1 }}>
            Vegan
          </Typography>
          <Typography sx={{ color: alpha('#ffffff', 0.92), fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.14em', lineHeight: 1 }}>
            CHOICE
          </Typography>
        </Stack>
      );
    case 'keto':
      return (
        <Typography sx={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1 }}>
          KETO
        </Typography>
      );
    case 'gift-cards':
      return (
        <Stack spacing={0.12} sx={{ alignItems: 'center' }}>
          <Typography sx={{ color: '#ffffff', fontSize: '1.35rem', lineHeight: 1 }}>
            🎁
          </Typography>
          <Typography sx={{ color: '#ffffff', fontSize: '0.5rem', fontWeight: 800, letterSpacing: '0.08em', lineHeight: 1 }}>
            GIFT
          </Typography>
        </Stack>
      );
    case 'custom-gift-boxes':
      return <Typography sx={{ color: '#ffffff', fontSize: '1.45rem', lineHeight: 1 }}>🎁</Typography>;
    case 'must-try':
      return (
        <Stack spacing={0.02} sx={{ alignItems: 'center' }}>
          <Typography sx={{ color: '#fff4bf', fontSize: '0.68rem', fontStyle: 'italic', fontWeight: 700, lineHeight: 1 }}>
            Must
          </Typography>
          <Typography sx={{ color: '#ffffff', fontSize: '1.28rem', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1 }}>
            TRY
          </Typography>
        </Stack>
      );
    case 'local':
      return (
        <Stack spacing={0.05} sx={{ alignItems: 'center' }}>
          <Typography sx={{ color: '#ffffff', fontSize: '0.5rem', fontWeight: 800, letterSpacing: '0.1em', lineHeight: 1 }}>
            PROUDLY
          </Typography>
          <Typography sx={{ color: '#ffffff', fontSize: '1.15rem', lineHeight: 1 }}>
            🏬
          </Typography>
          <Typography sx={{ color: '#ffffff', fontSize: '0.5rem', fontWeight: 800, letterSpacing: '0.08em', lineHeight: 1 }}>
            LOCAL
          </Typography>
        </Stack>
      );
    case 'coming-soon':
      return (
        <Stack spacing={0.02} sx={{ alignItems: 'center' }}>
          <Typography sx={{ color: '#ffffff', fontSize: '0.92rem', fontStyle: 'italic', fontWeight: 800, lineHeight: 1 }}>
            Coming
          </Typography>
          <Typography sx={{ color: '#ffffff', fontSize: '0.9rem', fontStyle: 'italic', fontWeight: 800, lineHeight: 1 }}>
            Soon
          </Typography>
        </Stack>
      );
    default:
      return (
        <Typography sx={{ color: '#ffffff', fontSize: '1.35rem', lineHeight: 1 }}>
          •
        </Typography>
      );
  }
};

type ProductSectionGridSize = {
  lg?: number;
  md?: number;
  sm?: number;
  xs: number;
};

type LazyProductSectionProps = {
  description: string;
  gridSize: ProductSectionGridSize;
  onAddToCart: (product: StoreProduct) => void;
  products: StoreProduct[];
  title: string;
};

const LazyProductSection = ({
  description,
  gridSize,
  onAddToCart,
  products,
  title,
}: LazyProductSectionProps) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const loadTimerRef = useRef<number | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const target = rootRef.current;

    if (!target || shouldLoad) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        setShouldLoad(true);
        observer.disconnect();
      },
      { rootMargin: '260px 0px' },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [shouldLoad]);

  useEffect(() => {
    if (!shouldLoad || isLoaded) {
      return undefined;
    }

    loadTimerRef.current = window.setTimeout(() => {
      setIsLoaded(true);
    }, 650);

    return () => {
      if (loadTimerRef.current) {
        window.clearTimeout(loadTimerRef.current);
      }
    };
  }, [isLoaded, shouldLoad]);

  return (
    <Stack ref={rootRef} spacing={3}>
      <StorefrontSectionHeader
        description={description}
        title={title}
      />
      <Grid container spacing={2.5}>
        {(isLoaded ? products : Array.from({ length: products.length }, () => null)).map((product, index) => (
          <Grid key={product?.id ?? `${title}-skeleton-${index}`} size={gridSize}>
            {isLoaded && product ? (
              <StoreProductCard
                onAddToCart={(item) => onAddToCart(item)}
                product={product}
              />
            ) : (
              <StoreProductCardSkeleton />
            )}
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
};

export const HomePage = () => {
  const { addToCart } = useCart();
  const [activeShowcaseIndex, setActiveShowcaseIndex] = useState(0);
  const activeShowcase = showcaseBanners[activeShowcaseIndex] ?? showcaseBanners[0] ?? {
    description: '',
    id: 'fallback-showcase',
    imageUrl: '',
    title: '',
  };

  const goToPreviousShowcase = () => {
    setActiveShowcaseIndex((currentIndex) =>
      currentIndex === 0 ? showcaseBanners.length - 1 : currentIndex - 1,
    );
  };

  const goToNextShowcase = () => {
    setActiveShowcaseIndex((currentIndex) =>
      currentIndex === showcaseBanners.length - 1 ? 0 : currentIndex + 1,
    );
  };

  return (
    <Stack spacing={5.5}>
      <Grid container spacing={3}>
        <Grid size={{ lg: 9.5, xs: 12 }}>
          <Box
            sx={{
              ...storefrontPanelSx,
              background: storefrontGradients.hero,
              color: storefrontColors.surface,
              overflow: 'hidden',
              position: 'relative',
              p: { md: 4, xs: 2.5 },
              '&::before': {
                background:
                  'radial-gradient(circle at 18% 20%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 34%), radial-gradient(circle at 78% 16%, rgba(147,200,62,0.2) 0%, rgba(147,200,62,0) 28%)',
                content: '""',
                inset: 0,
                pointerEvents: 'none',
                position: 'absolute',
              },
            }}
          >
            <Grid container spacing={{ md: 3, xs: 2.5 }} sx={{ alignItems: 'center', position: 'relative', zIndex: 1 }}>
              <Grid size={{ md: 6.8, xs: 12 }}>
                <Stack spacing={1.75}>
                  <Typography
                    sx={{
                      backdropFilter: 'blur(14px)',
                      backgroundColor: alpha('#ffffff', 0.14),
                      borderRadius: 999,
                      color: alpha('#ffffff', 0.8),
                      display: 'inline-flex',
                      fontWeight: 800,
                      letterSpacing: '0.01em',
                      px: 2.25,
                      py: 0.9,
                      width: 'fit-content',
                    }}
                    variant="body2"
                  >
                    {heroBanner.eyebrow}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { lg: '3.8rem', md: '3.15rem', sm: '2.75rem', xs: '2.15rem' },
                      fontWeight: 900,
                      letterSpacing: '-0.05em',
                      lineHeight: 0.98,
                      maxWidth: 640,
                      textWrap: 'balance',
                    }}
                    variant="h1"
                  >
                    {heroBanner.title}
                  </Typography>
                  <Typography
                    sx={{
                      color: alpha('#ffffff', 0.82),
                      fontSize: { md: '1.35rem', xs: '1.02rem' },
                      lineHeight: 1.4,
                      maxWidth: 560,
                    }}
                    variant="h5"
                  >
                    {heroBanner.description}
                  </Typography>
                  <Stack direction={{ sm: 'row', xs: 'column' }} spacing={1.25} sx={{ alignItems: { sm: 'center', xs: 'stretch' }, pt: 0.5 }}>
                    <Button
                      endIcon={<ArrowForwardRoundedIcon />}
                      sx={{
                        alignSelf: 'flex-start',
                        backgroundColor: storefrontColors.surface,
                        borderRadius: 999,
                        boxShadow: '0 14px 30px rgba(6, 19, 54, 0.22)',
                        color: storefrontColors.navy,
                        fontSize: '0.95rem',
                        fontWeight: 900,
                        px: 3,
                        py: 1.15,
                        textTransform: 'uppercase',
                        '&:hover': {
                          backgroundColor: '#eef3ff',
                          transform: 'translateY(-1px)',
                        },
                      }}
                    >
                      {heroBanner.cta}
                    </Button>
                    <Typography
                      sx={{
                        color: alpha('#ffffff', 0.72),
                        maxWidth: 260,
                      }}
                      variant="body2"
                    >
                      Hand-picked seasonal essentials with a cleaner, faster shopping flow.
                    </Typography>
                  </Stack>
                </Stack>
              </Grid>
              <Grid size={{ md: 5.2, xs: 12 }}>
                <Box sx={{ position: 'relative' }}>
                  <Box
                    sx={{
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0.04))',
                      border: `1px solid ${alpha('#ffffff', 0.18)}`,
                      borderRadius: { md: '2rem', xs: '1.4rem' },
                      boxShadow: '0 26px 60px rgba(5, 18, 56, 0.3)',
                      p: { md: 1, xs: 0.9 },
                    }}
                  >
                    <Box
                      alt={heroBanner.title}
                      component="img"
                      loading="lazy"
                      src={heroBanner.imageUrl}
                      sx={{
                        borderRadius: { md: '1.6rem', xs: '1.1rem' },
                        display: 'block',
                        height: { md: 300, xs: 210 },
                        objectFit: 'cover',
                        width: '100%',
                      }}
                    />
                  </Box>
                  <Box
                    sx={{
                      backdropFilter: 'blur(18px)',
                      backgroundColor: alpha('#ffffff', 0.12),
                      border: `1px solid ${alpha('#ffffff', 0.2)}`,
                      borderRadius: 2,
                      bottom: { md: 14, xs: 10 },
                      left: { md: -24, xs: 12 },
                      p: 1.25,
                      position: 'absolute',
                    }}
                  >
                    <Stack spacing={0.25}>
                      <Typography sx={{ color: storefrontColors.surface, fontWeight: 900 }} variant="subtitle1">
                        Curated this week
                      </Typography>
                      <Typography sx={{ color: alpha('#ffffff', 0.72) }} variant="body2">
                        Fresh produce, pantry staples, and home essentials.
                      </Typography>
                    </Stack>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Grid>

        <Grid size={{ lg: 2.5, xs: 12 }}>
          <Box
            sx={{
              ...storefrontMutedPanelSx,
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(241,245,252,0.98) 100%)',
              height: '100%',
              overflow: 'hidden',
              p: { md: 2.5, xs: 2.1 },
              position: 'relative',
              '&::before': {
                background:
                  'radial-gradient(circle at top right, rgba(24,58,122,0.09), rgba(24,58,122,0) 42%), radial-gradient(circle at bottom left, rgba(147,200,62,0.08), rgba(147,200,62,0) 30%)',
                content: '""',
                inset: 0,
                position: 'absolute',
              },
            }}
          >
            <Stack spacing={0.65} sx={{ mb: 1.5, position: 'relative', zIndex: 1 }}>
              <Box
                sx={{
                  alignItems: 'center',
                  backgroundColor: alpha(storefrontColors.navy, 0.07),
                  borderRadius: 999,
                  color: storefrontColors.navy,
                  display: 'inline-flex',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  px: 1.1,
                  py: 0.55,
                  textTransform: 'uppercase',
                  width: 'fit-content',
                }}
              >
                Partner Brands
              </Box>
              <Typography
                sx={{ color: storefrontColors.navy, fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 0.95 }}
                variant="h3"
              >
                Our Shops
              </Typography>
              <Typography color={storefrontColors.muted} sx={{ maxWidth: 220, lineHeight: 1.5 }} variant="body2">
                Explore trusted partner ranges in one place.
              </Typography>
            </Stack>
            <Grid container spacing={0.8} sx={{ position: 'relative', zIndex: 1 }}>
              {shopBrands.map((brand) => (
                <Grid key={brand.id} size={12}>
                  <Box
                    sx={{
                      alignItems: 'center',
                      background:
                        brand.color === '#ffffff'
                          ? 'linear-gradient(180deg, #ffffff 0%, #f9fbff 100%)'
                          : `linear-gradient(180deg, ${brand.color} 0%, ${brand.color} 100%)`,
                      border: `1px solid ${brand.color === '#ffffff' ? alpha('#e43224', 0.12) : 'transparent'}`,
                      borderRadius: 2,
                      boxShadow:
                        brand.color === '#ffffff'
                          ? `0 12px 24px ${alpha('#9f1714', 0.08)}`
                          : `0 16px 28px ${alpha(brand.color, 0.2)}`,
                      color: brand.textColor ?? '#ffffff',
                      display: 'flex',
                      justifyContent: 'center',
                      minHeight: 50,
                      p: 0.8,
                      position: 'relative',
                      textAlign: 'center',
                      transition: 'transform 180ms ease, box-shadow 180ms ease',
                      '&:hover': {
                        boxShadow:
                          brand.color === '#ffffff'
                            ? `0 18px 30px ${alpha('#9f1714', 0.11)}`
                            : `0 20px 34px ${alpha(brand.color, 0.28)}`,
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <Typography
                      sx={{
                        color: brand.textColor ?? storefrontColors.navy,
                        fontSize: { md: '0.92rem', xs: '0.86rem' },
                        fontWeight: 900,
                        letterSpacing: '-0.02em',
                        lineHeight: 1.05,
                      }}
                    >
                      {brand.label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ ...storefrontMutedPanelSx, borderRadius: 2, px: { md: 3, xs: 2 }, py: 3 }}>
        <Stack
          direction="row"
          spacing={{ md: 1.5, xs: 1.25 }}
          sx={{ overflowX: 'auto', pb: 1 }}
        >
          {featuredCategoryHighlights.map((item) => (
            <Stack
              key={item.id}
              spacing={1}
              sx={{
                alignItems: 'center',
                backgroundColor: item.surfaceColor ?? storefrontColors.surface,
                border: `1px solid ${alpha(item.color, 0.1)}`,
                borderRadius: 2,
                boxShadow: `0 14px 22px ${alpha(item.color, 0.08)}`,
                flex: '0 0 auto',
                minWidth: 112,
                px: 1.1,
                py: 1.25,
                textAlign: 'center',
              }}
            >
              <Box
                sx={{
                  alignItems: 'center',
                  backgroundColor: item.color,
                  borderRadius: '50%',
                  boxShadow: `0 12px 20px ${alpha(item.color, 0.22)}`,
                  color: '#fff',
                  display: 'flex',
                  fontSize: 30,
                  height: 68,
                  justifyContent: 'center',
                  width: 68,
                }}
              >
                {item.icon}
              </Box>
              <Typography
                sx={{
                  color: storefrontColors.slate,
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  lineHeight: 1.15,
                  maxWidth: 92,
                }}
                variant="body1"
              >
                {item.label}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Box>

      <Box sx={{ ...storefrontMutedPanelSx, p: { md: 3, xs: 2 } }}>
        <Grid container spacing={2}>
          {promoTiles.map((tile) => (
            <Grid key={tile.id} size={{ lg: 2.4, md: 4, sm: 6, xs: 12 }}>
              <Box
                component={Link}
                sx={{
                  backgroundColor: storefrontColors.surface,
                  borderRadius: 1.25,
                  border: `1px solid ${alpha(tile.accent, 0.12)}`,
                  color: 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 248,
                  overflow: 'hidden',
                  position: 'relative',
                  textDecoration: 'none',
                }}
                to={getPromoTilePath(tile)}
              >
                <Box
                  alt={tile.title}
                  component="img"
                  loading="lazy"
                  src={tile.imageUrl}
                  sx={{
                    display: 'block',
                    height: { sm: 138, xs: 158 },
                    objectFit: 'cover',
                    width: '100%',
                  }}
                />
                <Stack
                  sx={{
                    background: `linear-gradient(180deg, ${alpha(tile.accent, 0.96)} 0%, ${tile.accent} 100%)`,
                    color: '#fff',
                    flexGrow: 1,
                    justifyContent: 'space-between',
                    p: { sm: 1.7, xs: 1.35 },
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: { sm: '0.95rem', xs: '0.88rem' },
                      fontWeight: 800,
                      letterSpacing: '-0.02em',
                      lineHeight: 1.15,
                      maxWidth: 180,
                    }}
                    variant="h6"
                  >
                    {tile.title}
                  </Typography>
                  <Button
                    component="span"
                    size="small"
                    sx={{
                      alignSelf: 'flex-start',
                      backgroundColor: storefrontColors.surface,
                      borderRadius: 1,
                      boxShadow: `0 8px 18px ${alpha('#9f1714', 0.14)}`,
                      color: storefrontColors.navy,
                      fontSize: { sm: '0.78rem', xs: '0.74rem' },
                      fontWeight: 800,
                      minWidth: 'auto',
                      px: 1.25,
                      py: 0.5,
                      textTransform: 'none',
                      '&:hover': { backgroundColor: '#eef3ff' },
                    }}
                    tabIndex={-1}
                  >
                    {tile.cta}
                  </Button>
                </Stack>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      <LazyProductSection
        description="Promo-led pricing blocks inspired by the provided design, implemented as reusable card and section primitives."
        gridSize={{ lg: 2.4, md: 4, sm: 6, xs: 12 }}
        onAddToCart={(item) => addToCart(mapHomeProductToProduct(item))}
        products={topOffers}
        title="Top Offers"
      />

      <Box
        sx={{
          ...storefrontPanelSx,
          background: storefrontGradients.softHero,
          overflow: 'hidden',
          position: 'relative',
          p: { md: 4, xs: 2.5 },
        }}
      >
        <Grid container spacing={3} sx={{ alignItems: 'center' }}>
          <Grid size={{ md: 8, xs: 12 }}>
            <Stack spacing={1.5}>
              <Typography sx={{ color: storefrontColors.navy, fontWeight: 800 }} variant="h2">
                {activeShowcase.title}
              </Typography>
              <Typography color={storefrontColors.muted} variant="h5">
                {activeShowcase.description}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
                {showcaseBanners.map((banner, index) => (
                  <Box
                    aria-label={`Go to showcase banner ${index + 1}`}
                    component="button"
                    key={banner.id}
                    onClick={() => setActiveShowcaseIndex(index)}
                    sx={{
                      backgroundColor:
                        index === activeShowcaseIndex
                          ? storefrontColors.navy
                          : alpha(storefrontColors.navy, 0.18),
                      border: 0,
                      borderRadius: 999,
                      cursor: 'pointer',
                      height: 8,
                      p: 0,
                      transition: 'width 180ms ease, background-color 180ms ease',
                      width: index === activeShowcaseIndex ? 28 : 8,
                    }}
                  />
                ))}
              </Stack>
            </Stack>
          </Grid>
          <Grid size={{ md: 4, xs: 12 }}>
            <Box sx={{ position: 'relative' }}>
              <Box
                alt={activeShowcase.title}
                component="img"
                loading="lazy"
                src={activeShowcase.imageUrl}
                sx={{ borderRadius: 2, display: 'block', height: 220, objectFit: 'cover', width: '100%' }}
              />
              <IconButton
                aria-label="Previous showcase banner"
                onClick={goToPreviousShowcase}
                sx={{
                  backdropFilter: 'blur(8px)',
                  backgroundColor: alpha('#ffffff', 0.76),
                  boxShadow: `0 8px 20px ${alpha('#9f1714', 0.12)}`,
                  color: storefrontColors.navy,
                  height: 40,
                  left: -20,
                  position: 'absolute',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 40,
                  '&:hover': {
                    backgroundColor: storefrontColors.surface,
                  },
                }}
              >
                <ChevronLeftRoundedIcon />
              </IconButton>
              <IconButton
                aria-label="Next showcase banner"
                onClick={goToNextShowcase}
                sx={{
                  backdropFilter: 'blur(8px)',
                  backgroundColor: alpha('#ffffff', 0.76),
                  boxShadow: `0 8px 20px ${alpha('#9f1714', 0.12)}`,
                  color: storefrontColors.navy,
                  height: 40,
                  position: 'absolute',
                  right: -20,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 40,
                  '&:hover': {
                    backgroundColor: storefrontColors.surface,
                  },
                }}
              >
                <ChevronRightRoundedIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <LazyProductSection
        description="Fresh-cut bouquets and floral gift picks presented in the same storefront card style for quick browsing."
        gridSize={{ lg: 2, md: 4, sm: 6, xs: 12 }}
        onAddToCart={(item) => addToCart(mapHomeProductToProduct(item))}
        products={topBlooms}
        title="Top Blooms"
      />

      <LazyProductSection
        description="Seasonal, produce-led content blocks stay separate from the catalog API and can later be replaced with CMS or backend-fed content."
        gridSize={{ lg: 2, md: 4, sm: 6, xs: 12 }}
        onAddToCart={(item) => addToCart(mapHomeProductToProduct(item))}
        products={seasonalProducts}
        title="New In Season"
      />

      <Box
        sx={{
          ...storefrontMutedPanelSx,
          backgroundColor: '#f6f6fb',
          px: { md: 2.5, xs: 1.25 },
          py: { md: 1.75, xs: 1.25 },
        }}
      >
        <Box
          sx={{
            columnGap: { md: 1.5, xs: 1 },
            display: 'grid',
            gridTemplateColumns: { md: 'repeat(5, minmax(0, 1fr))', xs: 'repeat(5, 232px)' },
            overflowX: { md: 'visible', xs: 'auto' },
            pb: 0.5,
            rowGap: 1.5,
          }}
        >
          {promoTiles.map((tile) => {
            const theme = promoTileThemes[tile.id] ?? { accent: tile.accent, icon: '✦' };

            return (
              <Box
                component={Link}
                key={tile.id}
                sx={{
                  backgroundColor: storefrontColors.surface,
                  border: `1px solid ${alpha(theme.accent, 0.14)}`,
                  borderRadius: 1,
                  color: 'inherit',
                  display: 'flex',
                  minWidth: 0,
                  overflow: 'hidden',
                  textDecoration: 'none',
                }}
                to={getPromoTilePath(tile)}
              >
                <Stack
                  sx={{
                    backgroundColor: theme.accent,
                    color: storefrontColors.surface,
                    justifyContent: 'space-between',
                    minWidth: { md: 102, xs: 94 },
                    p: { md: 1.05, xs: 0.9 },
                  }}
                >
                  <Stack spacing={0.8}>
                    <Box
                      sx={{
                        alignItems: 'center',
                        backgroundColor: storefrontColors.surface,
                        borderRadius: 0.6,
                        color: storefrontColors.navy,
                        display: 'inline-flex',
                        fontSize: '1rem',
                        height: 34,
                        justifyContent: 'center',
                        width: 54,
                      }}
                    >
                      {theme.icon}
                    </Box>
                    <Typography
                      sx={{
                        fontSize: { md: '0.78rem', xs: '0.7rem' },
                        fontWeight: 500,
                        letterSpacing: '-0.02em',
                        lineHeight: 1.12,
                        maxWidth: 88,
                      }}
                    >
                      {tile.title}
                    </Typography>
                  </Stack>
                  <Button
                    component="span"
                    size="small"
                    sx={{
                      alignSelf: 'flex-start',
                      backgroundColor: storefrontColors.surface,
                      borderRadius: 0.6,
                      color: storefrontColors.navy,
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      minWidth: 'auto',
                      px: 1.05,
                      py: 0.42,
                      textTransform: 'none',
                      '&:hover': { backgroundColor: '#eef3ff' },
                    }}
                    tabIndex={-1}
                  >
                    {tile.cta}
                  </Button>
                </Stack>

                <Box
                  alt={tile.title}
                  component="img"
                  loading="lazy"
                  src={tile.imageUrl}
                  sx={{
                    display: 'block',
                    flex: 1,
                    height: { md: 154, xs: 130 },
                    minWidth: 0,
                    objectFit: 'cover',
                    width: '100%',
                  }}
                />
              </Box>
            );
          })}
        </Box>
      </Box>

      <Box
        sx={{
          ...storefrontPanelSx,
          borderRadius: 2,
          boxShadow: 'none',
          px: { md: 1.3, xs: 0.9 },
          py: { md: 1.5, xs: 1.1 },
        }}
      >
        <Box
          sx={{
            alignItems: 'start',
            columnGap: { md: 1.1, xs: 0.9 },
            display: 'grid',
            gridTemplateColumns: { md: 'repeat(16, minmax(0, 1fr))', xs: 'repeat(16, 96px)' },
            overflowX: { md: 'visible', xs: 'auto' },
            rowGap: 1,
          }}
        >
          {merchandisingHighlights.map((item, index) => (
            <Stack
              key={item.id}
              spacing={0.75}
              sx={{
                alignItems: 'center',
                minWidth: 0,
                pb: 1.2,
                position: 'relative',
                textAlign: 'center',
              }}
            >
              <Box
                sx={{
                  alignItems: 'center',
                  backgroundColor: item.color,
                  borderRadius: '50%',
                  boxShadow: 'none',
                  color: storefrontColors.surface,
                  display: 'flex',
                  height: { md: 60, xs: 56 },
                  justifyContent: 'center',
                  position: 'relative',
                  width: { md: 60, xs: 56 },
                  '&::before': {
                    border: '2px solid rgba(255,255,255,0.92)',
                    borderRadius: '50%',
                    content: '""',
                    inset: 7,
                    position: 'absolute',
                  },
                }}
              >
                <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
                  {renderMerchandisingBadge(item.id)}
                </Box>
              </Box>
              <Typography
                sx={{
                  color: '#5d5d5d',
                  fontSize: { md: '0.74rem', xs: '0.68rem' },
                  fontWeight: 800,
                  lineHeight: 1.35,
                  maxWidth: { md: 88, xs: 92 },
                }}
              >
                {item.label}
              </Typography>
              {index === 0 ? (
                <Box
                  sx={{
                    backgroundColor: '#be1f3f',
                    borderRadius: 999,
                    bottom: 0,
                    height: 4,
                    position: 'absolute',
                    width: 82,
                  }}
                />
              ) : null}
            </Stack>
          ))}
        </Box>
      </Box>

      <LazyProductSection
        description="Prepared meals, bakery, and pantry modules can reuse the exact same card component and only swap data."
        gridSize={{ lg: 3, md: 6, xs: 12 }}
        onAddToCart={(item) => addToCart(mapHomeProductToProduct(item))}
        products={pantryProducts}
        title="Pantry & Ready Meals"
      />
    </Stack>
  );
};
