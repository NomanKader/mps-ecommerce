import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { Box, Button, Grid, IconButton, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { routePaths } from '@routes/routePaths';
import { storefrontColors, storefrontGradients } from '@app/providers/theme/tokens';
import { useCart } from '@features/cart/hooks/useCart';
import { merchandisingApi } from '@features/home/api/merchandisingApi';
import {
  defaultCarouselSlides,
  defaultHighlightItems,
  pantryProducts,
  promoTiles,
  seasonalProducts,
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
import type {
  StoreProduct,
  StorefrontCarouselPlacement,
  StorefrontCarouselSlide,
  StorefrontHighlightItem,
  StorefrontHighlightSection,
  StorefrontProductSectionId,
} from '@features/home/types/home.types';

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

const shopMegaMenuColumns = [
  [
    {
      categoryId: 'quick-meals',
      items: ['Appetizers', 'Sides', 'Heat & Eat', 'Italian', 'Desserts'],
      title: 'Quick Meals',
    },
    {
      categoryId: 'seafood',
      items: ['Fish', 'Smoked Seafood', 'Prawns & Shellfish', 'Breaded Seafood', 'Canned Seafood'],
      title: 'Seafood',
    },
    { categoryId: 'bakery', items: ['Cakes & Cupcakes'], title: 'Bakery' },
    { categoryId: 'dairy', items: ['Cheese'], title: 'Dairy' },
  ],
  [
    {
      categoryId: 'dairy',
      items: [
        'Ice Cream & Frozen Desserts',
        'Butter & Ghee',
        'Long Life Milk',
        'Plant-Based',
        'Yoghurt',
      ],
      title: 'Dairy',
    },
    {
      categoryId: 'pantry',
      items: [
        'Breakfast Cereals',
        'Cans, Jars & Packets',
        'Chocolates & Sweets',
        'Deli & Dips',
        'Condiments & Dressings',
        'Crackers & Biscuits',
        'Flours & Mixes',
        'Honey, Jams & Spreads',
        'Oil & Vinegar',
        'Sauces & Ingredients',
        'Pasta & Noodles',
      ],
      title: 'Pantry',
    },
  ],
  [
    {
      categoryId: 'pantry',
      items: [
        'Pulses & Seeds',
        'Crisps & Snacks',
        'Rice & Grains',
        'Spices & Seasonings',
        'Sugar & Baking',
        'World Foods',
      ],
      title: 'Pantry',
    },
    {
      categoryId: 'drinks',
      items: [
        'Carbonated Drinks',
        'Chocolate & Malt Drinks',
        'Coffee',
        'Cordials',
        'Juice',
        'Non Alcoholic Drinks',
        'Tea',
      ],
      title: 'Drinks',
    },
    {
      categoryId: 'frozen',
      items: ['Frozen Ready Meals', 'Frozen Fruit', 'Frozen Vegetables'],
      title: 'Frozen',
    },
  ],
  [
    {
      categoryId: 'frozen',
      items: [
        'Frozen Seafood',
        'Frozen Chips, Potatoes & Rice',
        'Frozen Bakery',
        'Ice Cream & Frozen Desserts',
        'Frozen Pizza',
        'Frozen Appetizers',
        'Vegetarian & Vegan Food',
      ],
      title: 'Frozen',
    },
    {
      categoryId: 'home',
      items: [
        'Home Fragrance',
        'Tissue Rolls & Paper Towels',
        'Cleaning Supplies',
        'Kitchenware',
        'Laundry Care',
      ],
      title: 'Home',
    },
    { categoryId: 'kids', items: ['Bathing & Grooming'], title: 'Kids' },
  ],
  [
    {
      categoryId: 'kids',
      items: [
        'Teething & Dental',
        'Baby Food',
        'Bottles & Pacifiers',
        'Nappies & Potty Training',
        'Nursery Items',
      ],
      title: 'Kids',
    },
    { categoryId: 'pets', items: ['Cat Care'], title: 'Pets' },
    {
      categoryId: 'care',
      items: [
        'Suncare & Outdoor',
        'Facial Care',
        'Bath & Shower',
        'Dental Care',
        'Body Care',
        'Feminine Care',
        'Hair Care',
        "Men's Grooming & Skin Care",
      ],
      title: 'Self Care',
    },
    { categoryId: 'gifts', items: ['Cakes & Cupcakes'], title: 'Gifting' },
  ],
];

const shopBrandCatalogTargets: Record<string, { category: string; search: string; title: string }> =
  {
    Iceland: { category: 'frozen', search: 'iceland', title: 'Iceland' },
    'M&S': { category: 'quick-meals', search: 'marks spencer', title: 'M&S' },
    Morrisons: { category: 'fruits', search: 'morrisons', title: 'Morrisons' },
    redmart: { category: 'pantry', search: 'redmart', title: 'redmart' },
    "Sainsbury's": { category: 'pantry', search: 'sainsbury', title: "Sainsbury's" },
    SuperValu: { category: 'quick-meals', search: 'supervalu', title: 'SuperValu' },
  };

const getShopCatalogPath = (brandLabel: string, categoryId = 'all', itemLabel?: string) => {
  const brandTarget = shopBrandCatalogTargets[brandLabel] ?? {
    category: categoryId,
    search: brandLabel,
    title: brandLabel,
  };
  const title = itemLabel ? `${brandLabel}: ${itemLabel}` : brandLabel;
  const params = new URLSearchParams({
    category: itemLabel ? categoryId : brandTarget.category,
    search: itemLabel ?? brandTarget.search,
    title,
  });

  return `${routePaths.catalog}?${params.toString()}`;
};

const fallbackCarouselSlide = defaultCarouselSlides[0] as StorefrontCarouselSlide;

const defaultHomeHeroSlide =
  defaultCarouselSlides.find((slide) => slide.placement === 'hero' && slide.status === 'active') ??
  fallbackCarouselSlide;

const defaultShowcaseSlide =
  defaultCarouselSlides.find(
    (slide) => slide.placement === 'showcase' && slide.status === 'active',
  ) ?? fallbackCarouselSlide;

const getDefaultCarouselSlides = (placement: StorefrontCarouselPlacement) =>
  defaultCarouselSlides
    .filter((slide) => slide.placement === placement && slide.status === 'active')
    .sort((first, second) => first.sortOrder - second.sortOrder);

const getDefaultHighlightItems = (section: StorefrontHighlightSection) =>
  defaultHighlightItems.filter((item) => item.section === section && item.status === 'active');

const getCarouselSlidePath = (slide: StorefrontCarouselSlide) => {
  const params = new URLSearchParams({
    category: slide.targetCategoryId || 'all',
    title: slide.cta || slide.title,
  });

  if (slide.targetSearch) {
    params.set('search', slide.targetSearch);
  }

  return `${routePaths.catalog}?${params.toString()}`;
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
  slides: StorefrontCarouselSlide[];
};

const MobileHomeLanding = ({ activeSlideIndex, onSlideChange, slides }: MobileHomeLandingProps) => {
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
              width: `${slides.length * 100}%`,
            }}
          >
            {slides.map((slide) => (
              <Box
                component={Link}
                key={slide.id}
                sx={{
                  background: storefrontGradients.hero,
                  color: '#ffffff',
                  display: 'grid',
                  flex: `0 0 ${100 / slides.length}%`,
                  gridTemplateColumns: '1.03fr 0.97fr',
                  minHeight: 292,
                  overflow: 'hidden',
                  position: 'relative',
                  textDecoration: 'none',
                }}
                to={getCarouselSlidePath(slide)}
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
          {slides.map((slide, dot) => (
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
  const heroCarouselQuery = useQuery({
    queryFn: ({ signal }) => merchandisingApi.listStorefrontCarousel('hero', { signal }),
    queryKey: ['storefront', 'carousel', 'hero'],
  });
  const showcaseCarouselQuery = useQuery({
    queryFn: ({ signal }) => merchandisingApi.listStorefrontCarousel('showcase', { signal }),
    queryKey: ['storefront', 'carousel', 'showcase'],
  });
  const featuredIconsQuery = useQuery({
    queryFn: ({ signal }) => merchandisingApi.listStorefrontIcons('featured', { signal }),
    queryKey: ['storefront', 'icons', 'featured'],
  });
  const merchandisingIconsQuery = useQuery({
    queryFn: ({ signal }) => merchandisingApi.listStorefrontIcons('merchandising', { signal }),
    queryKey: ['storefront', 'icons', 'merchandising'],
  });
  const productSectionsQuery = useQuery({
    queryFn: ({ signal }) => merchandisingApi.listStorefrontProductSections({ signal }),
    queryKey: ['storefront', 'product-sections'],
  });

  const homeHeroSlides = heroCarouselQuery.data?.length
    ? heroCarouselQuery.data
    : getDefaultCarouselSlides('hero');
  const showcaseSlides = showcaseCarouselQuery.data?.length
    ? showcaseCarouselQuery.data
    : getDefaultCarouselSlides('showcase');
  const featuredHighlights: StorefrontHighlightItem[] = featuredIconsQuery.data?.length
    ? featuredIconsQuery.data
    : getDefaultHighlightItems('featured');
  const merchandisingHighlights: StorefrontHighlightItem[] = merchandisingIconsQuery.data?.length
    ? merchandisingIconsQuery.data
    : getDefaultHighlightItems('merchandising');
  const getBackendSectionProducts = (sectionId: StorefrontProductSectionId) =>
    productSectionsQuery.data?.sections.find((section) => section.id === sectionId)?.products ?? [];
  const assignedTopOffers = getBackendSectionProducts('top-offers');
  const assignedTopBlooms = getBackendSectionProducts('top-blooms');
  const assignedSeasonalProducts = getBackendSectionProducts('new-season');
  const assignedPantryProducts = getBackendSectionProducts('pantry-ready');
  const visibleHeroSlides = homeHeroSlides.length ? homeHeroSlides : [defaultHomeHeroSlide];
  const visibleShowcaseSlides = showcaseSlides.length ? showcaseSlides : [defaultShowcaseSlide];
  const [activeHeroSlideIndex, setActiveHeroSlideIndex] = useState(0);
  const [activeShowcaseIndex, setActiveShowcaseIndex] = useState(0);
  const [activeShopBrandId, setActiveShopBrandId] = useState<string | null>(null);
  const activeHeroSlide = visibleHeroSlides[activeHeroSlideIndex] ?? defaultHomeHeroSlide;
  const activeShopBrand = shopBrands.find((brand) => brand.id === activeShopBrandId);
  const activeShopBrandIndex = shopBrands.findIndex((brand) => brand.id === activeShopBrandId);
  const activeShowcase = visibleShowcaseSlides[activeShowcaseIndex] ?? defaultShowcaseSlide;

  const goToPreviousShowcase = () => {
    setActiveShowcaseIndex((currentIndex) =>
      currentIndex === 0 ? visibleShowcaseSlides.length - 1 : currentIndex - 1,
    );
  };

  const goToNextShowcase = () => {
    setActiveShowcaseIndex((currentIndex) =>
      currentIndex === visibleShowcaseSlides.length - 1 ? 0 : currentIndex + 1,
    );
  };

  return (
    <>
      <MobileHomeLanding
        activeSlideIndex={activeHeroSlideIndex}
        onSlideChange={setActiveHeroSlideIndex}
        slides={visibleHeroSlides}
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
                        component={Link}
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
                          textDecoration: 'none',
                          '&:hover': {
                            backgroundColor: '#eef3ff',
                            transform: 'translateY(-1px)',
                          },
                        }}
                        to={getCarouselSlidePath(activeHeroSlide)}
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
                      {visibleHeroSlides.map((slide, index) => (
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
              onMouseLeave={() => setActiveShopBrandId(null)}
              sx={{
                ...storefrontMutedPanelSx,
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(241,245,252,0.98) 100%)',
                height: '100%',
                overflow: 'visible',
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
              {activeShopBrand ? (
                <Box
                  onMouseEnter={() => setActiveShopBrandId(activeShopBrand.id)}
                  sx={{
                    backgroundColor: storefrontColors.surface,
                    borderRadius: 1,
                    boxShadow: `0 18px 44px ${alpha(storefrontColors.navy, 0.16)}`,
                    display: { lg: 'block', xs: 'none' },
                    minHeight: 420,
                    p: { lg: 4.5, md: 3.5 },
                    position: 'absolute',
                    right: 'calc(100% + 18px)',
                    top: 42,
                    width: 'min(72vw, 1120px)',
                    zIndex: 20,
                  }}
                >
                  <Box
                    sx={{
                      display: 'grid',
                      gap: { lg: 5.5, md: 3.5 },
                      gridTemplateColumns: 'repeat(5, minmax(130px, 1fr))',
                    }}
                  >
                    {shopMegaMenuColumns.map((column, columnIndex) => (
                      <Stack key={columnIndex} spacing={1.45}>
                        {column.map((section) => (
                          <Box key={`${section.categoryId}-${section.title}`}>
                            <Typography
                              component={Link}
                              onClick={() => setActiveShopBrandId(null)}
                              sx={{
                                color: storefrontColors.navy,
                                display: 'inline-block',
                                fontSize: '1.05rem',
                                fontWeight: 900,
                                lineHeight: 1.2,
                                mb: 0.65,
                                textDecoration: 'none',
                                '&:hover': {
                                  color: activeShopBrand.color,
                                },
                              }}
                              to={getShopCatalogPath(
                                activeShopBrand.label,
                                section.categoryId,
                                section.title,
                              )}
                              variant="h6"
                            >
                              {section.title}
                            </Typography>
                            <Stack spacing={0.42}>
                              {section.items.map((item) => (
                                <Typography
                                  component={Link}
                                  key={item}
                                  onClick={() => setActiveShopBrandId(null)}
                                  sx={{
                                    color: '#555a64',
                                    display: 'block',
                                    fontSize: '0.98rem',
                                    fontWeight: 650,
                                    lineHeight: 1.25,
                                    textDecoration: 'none',
                                    transition: 'color 140ms ease',
                                    '&:hover': {
                                      color: storefrontColors.navy,
                                    },
                                  }}
                                  to={getShopCatalogPath(
                                    activeShopBrand.label,
                                    section.categoryId,
                                    item,
                                  )}
                                  variant="body2"
                                >
                                  {item}
                                </Typography>
                              ))}
                            </Stack>
                          </Box>
                        ))}
                      </Stack>
                    ))}
                  </Box>
                  <Box
                    sx={{
                      borderColor: `transparent transparent transparent ${activeShopBrand.color}`,
                      borderStyle: 'solid',
                      borderWidth: '14px 0 14px 22px',
                      filter: `drop-shadow(7px 0 8px ${alpha(storefrontColors.navy, 0.08)})`,
                      position: 'absolute',
                      right: -22,
                      top: 90 + Math.max(activeShopBrandIndex, 0) * 58,
                    }}
                  />
                </Box>
              ) : null}
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
                      component={Link}
                      onFocus={() => setActiveShopBrandId(brand.id)}
                      onMouseEnter={() => setActiveShopBrandId(brand.id)}
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
                        textDecoration: 'none',
                        transition: 'transform 180ms ease, box-shadow 180ms ease',
                        '&:hover': {
                          boxShadow:
                            brand.color === '#ffffff'
                              ? `0 18px 30px ${alpha('#9f1714', 0.11)}`
                              : `0 20px 34px ${alpha(brand.color, 0.28)}`,
                          transform: 'translateY(-2px)',
                        },
                        '&:focus-visible': {
                          outline: `3px solid ${alpha(brand.color, 0.24)}`,
                          outlineOffset: 2,
                        },
                      }}
                      to={getShopCatalogPath(brand.label)}
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
            {featuredHighlights.map((item) => (
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
                  transition: 'transform 180ms ease, box-shadow 180ms ease',
                  '&:hover': {
                    boxShadow: `0 18px 28px ${alpha(item.color, 0.12)}`,
                    transform: 'translateY(-2px)',
                  },
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
          products={assignedTopOffers.length ? assignedTopOffers : topOffers}
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
                  {visibleShowcaseSlides.map((banner, index) => (
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
          products={assignedTopBlooms.length ? assignedTopBlooms : topBlooms}
          title="Top Blooms"
        />

        <LazyProductSection
          description="Seasonal, produce-led content blocks stay separate from the catalog API and can later be replaced with CMS or backend-fed content."
          gridSize={{ lg: 2, md: 4, sm: 6, xs: 12 }}
          onAddToCart={(item) => addToCart(mapHomeProductToProduct(item))}
          products={assignedSeasonalProducts.length ? assignedSeasonalProducts : seasonalProducts}
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
                  transition: 'transform 180ms ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                  },
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
                  <Box
                    sx={{
                      alignItems: 'center',
                      display: 'flex',
                      justifyContent: 'center',
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    <Typography sx={{ color: '#ffffff', fontSize: '1.55rem', lineHeight: 1 }}>
                      {item.icon}
                    </Typography>
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
          products={assignedPantryProducts.length ? assignedPantryProducts : pantryProducts}
          title="Pantry & Ready Meals"
        />
      </Stack>
    </>
  );
};
