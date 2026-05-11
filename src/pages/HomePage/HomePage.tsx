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
  storefrontCategories,
  topBlooms,
  topOffers,
} from '@features/home/data/homePage.data';
import { mapHomeProductToProduct } from '@features/home/utils/mapHomeProductToProduct';
import {
  StoreProductCard,
  StoreProductCardSkeleton,
} from '@shared/components/storefront/StoreProductCard';
import { StorefrontSectionHeader } from '@shared/components/storefront/StorefrontSectionHeader';
import { storefrontMutedPanelSx, storefrontPanelSx } from '@shared/styles/storefront';
import type { StoreProduct } from '@features/home/types/home.types';

const promoTileThemes: Record<string, { accent: string; icon: string }> = {
  beauty: { accent: '#ab3a1e', icon: '🔪' },
  flowers: { accent: '#ffbc18', icon: '🍪' },
  meat: { accent: '#c97b22', icon: '🍽️' },
  milk: { accent: '#d62967', icon: '👜' },
  snacks: { accent: '#e05458', icon: '⬡' },
};

const getPromoTilePath = (tile: {
  targetCategoryId: string;
  targetSearch?: string;
  title: string;
}) => {
  const params = new URLSearchParams({
    category: tile.targetCategoryId,
    title: tile.title,
  });

  if (tile.targetSearch) {
    params.set('search', tile.targetSearch);
  }

  return `${routePaths.catalog}?${params.toString()}`;
};

const highlightCatalogTargets: Record<string, { category?: string; search?: string; title: string }> = {
  bulk: { category: 'pantry', search: 'bulk', title: 'Buy Bulk' },
  'coming-soon': { search: 'new', title: 'Coming Soon' },
  'custom-gift-boxes': { category: 'gifts', search: 'gift', title: 'Customised Gift Boxes' },
  frozen: { category: 'frozen', search: 'frozen', title: 'Frozen' },
  'gift-cards': { category: 'gifts', search: 'gift card', title: 'E-Gift Cards' },
  'gluten-free': { category: 'pantry', search: 'gluten-free', title: 'Gluten-free' },
  imperfect: { category: 'vegetables', search: 'ugly', title: 'Imperfect' },
  keto: { category: 'quick-meals', search: 'keto', title: 'Keto' },
  local: { search: 'local', title: 'Local' },
  'must-try': { search: 'fresh', title: 'Must Try' },
  new: { search: 'new', title: 'New' },
  'no-sugar': { category: 'pantry', search: 'sugar', title: 'No Added Sugar' },
  organic: { search: 'organic', title: 'Organic' },
  promotion: { search: 'offer', title: 'Promotion' },
  recipes: { category: 'quick-meals', search: 'recipe', title: 'Recipes' },
  vegan: { category: 'quick-meals', search: 'vegan', title: 'Vegan' },
};

const getHighlightCatalogPath = (item: { id: string; label: string }) => {
  const target = highlightCatalogTargets[item.id] ?? { search: item.label, title: item.label };
  const params = new URLSearchParams({
    category: target.category ?? 'all',
    title: target.title,
  });

  if (target.search) {
    params.set('search', target.search);
  }

  return `${routePaths.catalog}?${params.toString()}`;
};

const merchandisingHighlights = [
  ...featuredCategoryHighlights,
  {
    color: '#d2aa2d',
    icon: '🎁',
    id: 'custom-gift-boxes',
    label: 'Customised Gift Boxes',
    surfaceColor: '#fff9e8',
  },
  { color: '#e43224', icon: '👍', id: 'must-try', label: 'Must Try', surfaceColor: '#fff2b8' },
  { color: '#b9263d', icon: '🏬', id: 'local', label: 'Local', surfaceColor: '#fff0f3' },
  {
    color: '#e43224',
    icon: '⏳',
    id: 'coming-soon',
    label: 'Coming Soon',
    surfaceColor: '#fff2b8',
  },
];

type HomeHeroSlide = {
  cta: string;
  description: string;
  eyebrow: string;
  headline: string;
  id: string;
  imageUrl: string;
  metric: string;
  partner: string;
  title: string;
};

const defaultHomeHeroSlide: HomeHeroSlide = {
  cta: heroBanner.cta,
  description: heroBanner.description,
  eyebrow: heroBanner.eyebrow,
  headline: 'Cashback',
  id: 'cashback',
  imageUrl: heroBanner.imageUrl,
  metric: '10%',
  partner: 'Wio Personal',
  title: heroBanner.title,
};

const homeHeroSlides: HomeHeroSlide[] = [
  defaultHomeHeroSlide,
  {
    cta: 'Shop now',
    description: showcaseBanners[0]?.description ?? heroBanner.description,
    eyebrow: 'Fresh picks',
    headline: 'Picks',
    id: showcaseBanners[0]?.id ?? 'fresh-picks',
    imageUrl: showcaseBanners[0]?.imageUrl ?? heroBanner.imageUrl,
    metric: 'Fresh',
    partner: 'Seasonal picks',
    title: showcaseBanners[0]?.title ?? heroBanner.title,
  },
  {
    cta: 'Explore more',
    description: showcaseBanners[1]?.description ?? heroBanner.description,
    eyebrow: 'Weekly edit',
    headline: 'In Store',
    id: showcaseBanners[1]?.id ?? 'weekly-edit',
    imageUrl: showcaseBanners[1]?.imageUrl ?? heroBanner.imageUrl,
    metric: 'New',
    partner: 'Storefront edit',
    title: showcaseBanners[1]?.title ?? heroBanner.title,
  },
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
        <Typography
          sx={{
            color: '#ffffff',
            fontSize: '1.02rem',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            lineHeight: 1,
          }}
        >
          NEW
        </Typography>
      );
    case 'imperfect':
      return (
        <Stack spacing={0.15} sx={{ alignItems: 'center' }}>
          <Typography sx={{ color: '#ffffff', fontSize: '1.55rem', lineHeight: 1 }}>🍓</Typography>
          <Typography
            sx={{
              color: '#ffffff',
              fontSize: '0.48rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              lineHeight: 1,
            }}
          >
            IMPERFECT
          </Typography>
        </Stack>
      );
    case 'gluten-free':
      return (
        <Stack spacing={0.1} sx={{ alignItems: 'center' }}>
          <Typography
            sx={{
              color: '#ffffff',
              fontSize: '0.56rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              lineHeight: 1,
            }}
          >
            GLUTEN
          </Typography>
          <Typography sx={{ color: '#ffffff', fontSize: '1.45rem', lineHeight: 1 }}>🌾</Typography>
          <Typography
            sx={{
              color: '#ffffff',
              fontSize: '0.54rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              lineHeight: 1,
            }}
          >
            FREE
          </Typography>
        </Stack>
      );
    case 'no-sugar':
      return (
        <Stack spacing={0.05} sx={{ alignItems: 'center' }}>
          <Typography
            sx={{
              color: '#ffffff',
              fontSize: '0.44rem',
              fontWeight: 800,
              letterSpacing: '0.07em',
              lineHeight: 1,
            }}
          >
            NO ADDED
          </Typography>
          <Typography sx={{ color: '#ffffff', fontSize: '1.25rem', lineHeight: 1 }}>🍬</Typography>
          <Typography
            sx={{
              color: '#ffffff',
              fontSize: '0.5rem',
              fontWeight: 800,
              letterSpacing: '0.07em',
              lineHeight: 1,
            }}
          >
            SUGAR
          </Typography>
        </Stack>
      );
    case 'vegan':
      return (
        <Stack spacing={0.05} sx={{ alignItems: 'center' }}>
          <Typography
            sx={{
              color: '#ffffff',
              fontSize: '1.35rem',
              fontStyle: 'italic',
              fontWeight: 900,
              letterSpacing: '-0.04em',
              lineHeight: 1,
            }}
          >
            Vegan
          </Typography>
          <Typography
            sx={{
              color: alpha('#ffffff', 0.92),
              fontSize: '0.5rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              lineHeight: 1,
            }}
          >
            CHOICE
          </Typography>
        </Stack>
      );
    case 'keto':
      return (
        <Typography
          sx={{
            color: '#ffffff',
            fontSize: '1.1rem',
            fontWeight: 900,
            letterSpacing: '-0.04em',
            lineHeight: 1,
          }}
        >
          KETO
        </Typography>
      );
    case 'gift-cards':
      return (
        <Stack spacing={0.12} sx={{ alignItems: 'center' }}>
          <Typography sx={{ color: '#ffffff', fontSize: '1.35rem', lineHeight: 1 }}>🎁</Typography>
          <Typography
            sx={{
              color: '#ffffff',
              fontSize: '0.5rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              lineHeight: 1,
            }}
          >
            GIFT
          </Typography>
        </Stack>
      );
    case 'custom-gift-boxes':
      return (
        <Typography sx={{ color: '#ffffff', fontSize: '1.45rem', lineHeight: 1 }}>🎁</Typography>
      );
    case 'must-try':
      return (
        <Stack spacing={0.02} sx={{ alignItems: 'center' }}>
          <Typography
            sx={{
              color: '#fff4bf',
              fontSize: '0.68rem',
              fontStyle: 'italic',
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            Must
          </Typography>
          <Typography
            sx={{
              color: '#ffffff',
              fontSize: '1.28rem',
              fontWeight: 900,
              letterSpacing: '-0.05em',
              lineHeight: 1,
            }}
          >
            TRY
          </Typography>
        </Stack>
      );
    case 'local':
      return (
        <Stack spacing={0.05} sx={{ alignItems: 'center' }}>
          <Typography
            sx={{
              color: '#ffffff',
              fontSize: '0.5rem',
              fontWeight: 800,
              letterSpacing: '0.1em',
              lineHeight: 1,
            }}
          >
            PROUDLY
          </Typography>
          <Typography sx={{ color: '#ffffff', fontSize: '1.15rem', lineHeight: 1 }}>🏬</Typography>
          <Typography
            sx={{
              color: '#ffffff',
              fontSize: '0.5rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              lineHeight: 1,
            }}
          >
            LOCAL
          </Typography>
        </Stack>
      );
    case 'coming-soon':
      return (
        <Stack spacing={0.02} sx={{ alignItems: 'center' }}>
          <Typography
            sx={{
              color: '#ffffff',
              fontSize: '0.92rem',
              fontStyle: 'italic',
              fontWeight: 800,
              lineHeight: 1,
            }}
          >
            Coming
          </Typography>
          <Typography
            sx={{
              color: '#ffffff',
              fontSize: '0.9rem',
              fontStyle: 'italic',
              fontWeight: 800,
              lineHeight: 1,
            }}
          >
            Soon
          </Typography>
        </Stack>
      );
    default:
      return (
        <Typography sx={{ color: '#ffffff', fontSize: '1.35rem', lineHeight: 1 }}>•</Typography>
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
  mobileHorizontal?: boolean;
  onAddToCart: (product: StoreProduct) => void;
  products: StoreProduct[];
  title: string;
};

const LazyProductSection = ({
  description,
  gridSize,
  mobileHorizontal = false,
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
      <StorefrontSectionHeader description={description} title={title} />
      {mobileHorizontal ? (
        <Box
          sx={{
            columnGap: 2,
            display: { md: 'none', xs: 'grid' },
            gridAutoFlow: 'column',
            gridAutoColumns: 'minmax(252px, 78vw)',
            overflowX: 'auto',
            pb: 1,
            scrollSnapType: 'x proximity',
            WebkitOverflowScrolling: 'touch',
            '&::-webkit-scrollbar': {
              height: 8,
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: alpha(storefrontColors.navy, 0.18),
              borderRadius: 999,
            },
          }}
        >
          {(isLoaded ? products : Array.from({ length: products.length }, () => null)).map(
            (product, index) => (
              <Box
                key={product?.id ?? `${title}-mobile-skeleton-${index}`}
                sx={{ minWidth: 0, scrollSnapAlign: 'start' }}
              >
                {isLoaded && product ? (
                  <StoreProductCard onAddToCart={(item) => onAddToCart(item)} product={product} />
                ) : (
                  <StoreProductCardSkeleton />
                )}
              </Box>
            ),
          )}
        </Box>
      ) : null}
      <Grid
        container
        spacing={2.5}
        sx={{ display: mobileHorizontal ? { md: 'flex', xs: 'none' } : 'flex' }}
      >
        {(isLoaded ? products : Array.from({ length: products.length }, () => null)).map(
          (product, index) => (
            <Grid key={product?.id ?? `${title}-skeleton-${index}`} size={gridSize}>
              {isLoaded && product ? (
                <StoreProductCard onAddToCart={(item) => onAddToCart(item)} product={product} />
              ) : (
                <StoreProductCardSkeleton />
              )}
            </Grid>
          ),
        )}
      </Grid>
    </Stack>
  );
};

type MobileHomeLandingProps = {
  activeSlideIndex: number;
  onSlideChange: (index: number) => void;
};

const MobileHomeLanding = ({ activeSlideIndex, onSlideChange }: MobileHomeLandingProps) => {
  return (
    <Stack
      spacing={2.7}
      sx={{
        backgroundColor: storefrontColors.surface,
        display: { md: 'none', xs: 'flex' },
        mx: -2,
        pb: 1,
        px: 2.4,
        pt: 1,
      }}
    >
      <Box
        component={Link}
        sx={{
          border: `1px solid ${storefrontColors.border}`,
          display: 'block',
          height: 39,
          textDecoration: 'none',
          width: '100%',
        }}
        to={routePaths.catalog}
      />

      <Box>
        <Box
          sx={{
            borderRadius: 0.6,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              transform: `translateX(-${activeSlideIndex * 100}%)`,
              transition: 'transform 260ms ease',
              width: `${homeHeroSlides.length * 100}%`,
            }}
          >
            {homeHeroSlides.map((slide) => (
              <Box
                component={Link}
                key={slide.id}
                sx={{
                  background: storefrontGradients.hero,
                  color: '#ffffff',
                  display: 'grid',
                  flex: `0 0 ${100 / homeHeroSlides.length}%`,
                  gridTemplateColumns: '1.03fr 0.97fr',
                  minHeight: 292,
                  overflow: 'hidden',
                  position: 'relative',
                  textDecoration: 'none',
                }}
                to={routePaths.catalog}
              >
                <Box
                  alt={slide.title}
                  component="img"
                  src={slide.imageUrl}
                  sx={{
                    borderRadius: 1,
                    bottom: 32,
                    boxShadow: '0 14px 24px rgba(0, 0, 0, 0.24)',
                    height: 108,
                    left: 30,
                    objectFit: 'cover',
                    position: 'absolute',
                    width: 182,
                  }}
                />
                <Box
                  sx={{
                    border: '5px solid rgba(255,255,255,0.88)',
                    borderLeftColor: 'transparent',
                    borderRadius: '50%',
                    height: 150,
                    left: 16,
                    position: 'absolute',
                    top: 58,
                    transform: 'rotate(-28deg)',
                    width: 150,
                  }}
                />
                <Box sx={{ minWidth: 0, position: 'relative' }} />
                <Stack
                  spacing={1.35}
                  sx={{
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    minWidth: 0,
                    p: { xs: 2.4 },
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  <Typography sx={{ fontSize: '3.15rem', fontWeight: 300, lineHeight: 0.9 }}>
                    {slide.metric}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '1.36rem',
                      fontWeight: 900,
                      letterSpacing: '0.08em',
                      lineHeight: 1,
                      textTransform: 'uppercase',
                    }}
                  >
                    {slide.headline}
                  </Typography>
                  <Box sx={{ backgroundColor: storefrontColors.accent, height: 3, width: 128 }} />
                  <Typography sx={{ fontSize: '1rem', fontWeight: 900, lineHeight: 1.1 }}>
                    {slide.partner}
                  </Typography>
                  <Box
                    component="span"
                    sx={{
                      backgroundColor: storefrontColors.surface,
                      color: storefrontColors.navy,
                      display: 'inline-flex',
                      fontSize: '0.8rem',
                      fontWeight: 900,
                      px: 1.45,
                      py: 0.75,
                      textTransform: 'uppercase',
                    }}
                  >
                    {slide.cta}
                  </Box>
                </Stack>
              </Box>
            ))}
          </Box>
        </Box>
        <Stack direction="row" spacing={1.2} sx={{ justifyContent: 'center', pt: 1.8 }}>
          {homeHeroSlides.map((slide, dot) => (
            <Box
              aria-label={`Go to banner ${dot + 1}`}
              component="button"
              key={slide.id}
              onClick={() => onSlideChange(dot)}
              sx={{
                backgroundColor:
                  dot === activeSlideIndex
                    ? storefrontColors.navy
                    : alpha(storefrontColors.navy, 0.22),
                border: 0,
                cursor: 'pointer',
                height: 3,
                p: 0,
                transition: 'background-color 180ms ease',
                width: 30,
              }}
            />
          ))}
        </Stack>
      </Box>

      <Stack spacing={1.4}>
        <Typography
          sx={{
            color: storefrontColors.navy,
            fontSize: '1.82rem',
            fontWeight: 900,
            lineHeight: 1.1,
          }}
        >
          Shop Categories
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gap: 1,
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          }}
        >
          {storefrontCategories.map((category) => (
            <Stack
              component={Link}
              key={category.id}
              spacing={0.7}
              sx={{
                alignItems: 'center',
                aspectRatio: '1 / 1',
                backgroundColor: category.color,
                borderRadius: 0.75,
                color: category.id === 'gifts' ? storefrontColors.navy : '#ffffff',
                justifyContent: 'center',
                minWidth: 0,
                overflow: 'hidden',
                p: 0.8,
                textAlign: 'center',
                textDecoration: 'none',
              }}
              to={`${routePaths.catalog}?${new URLSearchParams({ category: category.id, title: category.label }).toString()}`}
            >
              <Typography
                aria-hidden="true"
                sx={{
                  filter: category.id === 'gifts' ? 'brightness(0) invert(1)' : 'none',
                  fontSize: '2.65rem',
                  lineHeight: 1,
                }}
              >
                {category.icon}
              </Typography>
              <Typography
                sx={{ color: '#ffffff', fontSize: '0.78rem', fontWeight: 900, lineHeight: 1.05 }}
              >
                {category.label.toUpperCase()}
              </Typography>
            </Stack>
          ))}
        </Box>
      </Stack>
    </Stack>
  );
};

export const HomePage = () => {
  const { addToCart } = useCart();
  const [activeHeroSlideIndex, setActiveHeroSlideIndex] = useState(0);
  const [activeShowcaseIndex, setActiveShowcaseIndex] = useState(0);
  const activeHeroSlide = homeHeroSlides[activeHeroSlideIndex] ?? defaultHomeHeroSlide;
  const activeShowcase = showcaseBanners[activeShowcaseIndex] ??
    showcaseBanners[0] ?? {
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
    <>
      <MobileHomeLanding
        activeSlideIndex={activeHeroSlideIndex}
        onSlideChange={setActiveHeroSlideIndex}
      />
      <Stack spacing={{ md: 5.5, xs: 2.5 }}>
        <Grid container spacing={3} sx={{ display: { md: 'flex', xs: 'none' } }}>
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
              <Grid
                container
                spacing={{ md: 3, xs: 2.5 }}
                sx={{ alignItems: 'center', position: 'relative', zIndex: 1 }}
              >
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
                      {activeHeroSlide.eyebrow}
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
                      {activeHeroSlide.title}
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
                      {activeHeroSlide.description}
                    </Typography>
                    <Stack
                      direction={{ sm: 'row', xs: 'column' }}
                      spacing={1.25}
                      sx={{ alignItems: { sm: 'center', xs: 'stretch' }, pt: 0.5 }}
                    >
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
                        {activeHeroSlide.cta}
                      </Button>
                      <Typography
                        sx={{
                          color: alpha('#ffffff', 0.72),
                          maxWidth: 260,
                        }}
                        variant="body2"
                      >
                        {activeHeroSlide.partner}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ pt: 0.5 }}>
                      {homeHeroSlides.map((slide, index) => (
                        <Box
                          aria-label={`Go to hero banner ${index + 1}`}
                          component="button"
                          key={slide.id}
                          onClick={() => setActiveHeroSlideIndex(index)}
                          sx={{
                            backgroundColor:
                              index === activeHeroSlideIndex
                                ? storefrontColors.surface
                                : alpha('#ffffff', 0.34),
                            border: 0,
                            borderRadius: 999,
                            cursor: 'pointer',
                            height: 8,
                            p: 0,
                            transition: 'width 180ms ease, background-color 180ms ease',
                            width: index === activeHeroSlideIndex ? 32 : 18,
                          }}
                        />
                      ))}
                    </Stack>
                  </Stack>
                </Grid>
                <Grid size={{ md: 5.2, xs: 12 }}>
                  <Box sx={{ position: 'relative' }}>
                    <Box
                      sx={{
                        background:
                          'linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0.04))',
                        border: `1px solid ${alpha('#ffffff', 0.18)}`,
                        borderRadius: { md: '2rem', xs: '1.4rem' },
                        boxShadow: '0 26px 60px rgba(5, 18, 56, 0.3)',
                        p: { md: 1, xs: 0.9 },
                      }}
                    >
                      <Box
                        alt={activeHeroSlide.title}
                        component="img"
                        loading="lazy"
                        src={activeHeroSlide.imageUrl}
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
                        <Typography
                          sx={{ color: storefrontColors.surface, fontWeight: 900 }}
                          variant="subtitle1"
                        >
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
                  sx={{
                    color: storefrontColors.navy,
                    fontWeight: 900,
                    letterSpacing: '-0.05em',
                    lineHeight: 0.95,
                  }}
                  variant="h3"
                >
                  Our Shops
                </Typography>
                <Typography
                  color={storefrontColors.muted}
                  sx={{ maxWidth: 220, lineHeight: 1.5 }}
                  variant="body2"
                >
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
          <Stack direction="row" spacing={{ md: 1.5, xs: 1.25 }} sx={{ overflowX: 'auto', pb: 1 }}>
            {featuredCategoryHighlights.map((item) => (
              <Stack
                component={Link}
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
                  textDecoration: 'none',
                  transition: 'transform 180ms ease, box-shadow 180ms ease',
                  '&:hover': {
                    boxShadow: `0 18px 28px ${alpha(item.color, 0.12)}`,
                    transform: 'translateY(-2px)',
                  },
                }}
                to={getHighlightCatalogPath(item)}
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
          <Box
            sx={{
              columnGap: 2,
              display: 'grid',
              gridTemplateColumns: {
                lg: 'repeat(5, minmax(0, 1fr))',
                md: 'repeat(3, minmax(0, 1fr))',
                xs: 'repeat(5, minmax(276px, 78vw))',
              },
              overflowX: { md: 'visible', xs: 'auto' },
              pb: { md: 0, xs: 1 },
              rowGap: 2,
              scrollPaddingLeft: 16,
              scrollSnapType: { md: 'none', xs: 'x proximity' },
              WebkitOverflowScrolling: 'touch',
              '&::-webkit-scrollbar': {
                height: 8,
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: alpha(storefrontColors.navy, 0.18),
                borderRadius: 999,
              },
            }}
          >
            {promoTiles.map((tile) => (
              <Box
                component={Link}
                key={tile.id}
                sx={{
                  backgroundColor: storefrontColors.surface,
                  borderRadius: 1.25,
                  border: `1px solid ${alpha(tile.accent, 0.12)}`,
                  color: 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 248,
                  minWidth: 0,
                  overflow: 'hidden',
                  position: 'relative',
                  scrollSnapAlign: 'start',
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
            ))}
          </Box>
        </Box>

        <LazyProductSection
          description="Promo-led pricing blocks inspired by the provided design, implemented as reusable card and section primitives."
          gridSize={{ lg: 2.4, md: 4, sm: 6, xs: 12 }}
          mobileHorizontal
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
                  sx={{
                    borderRadius: 2,
                    display: 'block',
                    height: 220,
                    objectFit: 'cover',
                    width: '100%',
                  }}
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
                component={Link}
                key={item.id}
                spacing={0.75}
                sx={{
                  alignItems: 'center',
                  minWidth: 0,
                  pb: 1.2,
                  position: 'relative',
                  textAlign: 'center',
                  textDecoration: 'none',
                  transition: 'transform 180ms ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                  },
                }}
                to={getHighlightCatalogPath(item)}
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
                  <Box
                    sx={{
                      alignItems: 'center',
                      display: 'flex',
                      justifyContent: 'center',
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
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
          gridSize={{ lg: 3, md: 6, xs: 6 }}
          onAddToCart={(item) => addToCart(mapHomeProductToProduct(item))}
          products={pantryProducts}
          title="Pantry & Ready Meals"
        />
      </Stack>
    </>
  );
};
