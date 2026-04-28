import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import FmdGoodOutlinedIcon from '@mui/icons-material/FmdGoodOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import PhoneInTalkOutlinedIcon from '@mui/icons-material/PhoneInTalkOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import { Badge, Box, Button, IconButton, Stack, Toolbar, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { storefrontColors } from '@app/providers/theme/tokens';
import logoImage from '@assets/images/logo.png';
import { AuthDrawer } from '@widgets/AuthDrawer/AuthDrawer';
import { routePaths } from '@routes/routePaths';
import { storefrontCategories, storefrontCategoryMenuItems } from '@features/home/data/homePage.data';
import { useCart } from '@features/cart/hooks/useCart';
import { storefrontIconButtonSx } from '@shared/styles/storefront';

const getCatalogPath = (categoryId: string, title: string, search?: string) => {
  const params = new URLSearchParams({
    category: categoryId,
    title,
  });

  if (search) {
    params.set('search', search);
  }

  return `${routePaths.catalog}?${params.toString()}`;
};

export const Header = () => {
  const { totalItems } = useCart();
  const [isAuthDrawerOpen, setIsAuthDrawerOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollFrameRef = useRef<number | null>(null);
  const activeCategory = storefrontCategories.find((category) => category.id === activeCategoryId);
  const activeMenuItems = activeCategoryId ? (storefrontCategoryMenuItems[activeCategoryId] ?? []) : [];

  useEffect(() => {
    const updateScrolledState = () => {
      scrollFrameRef.current = null;
      setIsScrolled(window.scrollY > 0);
    };

    const handleScroll = () => {
      if (scrollFrameRef.current === null) {
        scrollFrameRef.current = window.requestAnimationFrame(updateScrolledState);
      }
    };

    updateScrolledState();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);

      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current);
      }
    };
  }, []);

  return (
    <Box
      component="header"
      sx={{
        backgroundColor: storefrontColors.surface,
        borderBottom: `1px solid ${storefrontColors.border}`,
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}
    >
      <Box
        sx={{
          backgroundColor: storefrontColors.navy,
          color: storefrontColors.surface,
          px: { lg: 5, xs: 2 },
          py: 1.25,
        }}
      >
        <Stack
          direction={{ lg: 'row', xs: 'column' }}
          spacing={1.5}
          sx={{ alignItems: { lg: 'center', xs: 'flex-start' }, justifyContent: 'space-between', maxWidth: 1600, mx: 'auto' }}
        >
          <Stack direction="row" spacing={3} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <LocalShippingOutlinedIcon sx={{ fontSize: 22 }} />
              <Typography sx={{ fontWeight: 700 }} variant="body2">
                Delivery all over UAE
              </Typography>
            </Stack>
            <Button
              startIcon={<FmdGoodOutlinedIcon />}
              sx={{
                border: `1px solid ${alpha('#ffffff', 0.28)}`,
                borderRadius: 2,
                color: storefrontColors.surface,
                px: 2,
                textTransform: 'none',
              }}
            >
              Add your address
            </Button>
          </Stack>
          <Stack direction="row" spacing={3} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="body2">Sustainable Grocery Shopping</Typography>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <PhoneInTalkOutlinedIcon sx={{ fontSize: 18 }} />
              <Typography sx={{ fontWeight: 800 }} variant="body2">
                800 AVS
              </Typography>
            </Stack>
            <Stack
              component="button"
              direction="row"
              onClick={() => setIsAuthDrawerOpen(true)}
              spacing={1}
              sx={{
                alignItems: 'center',
                background: 'transparent',
                border: 0,
                color: 'inherit',
                cursor: 'pointer',
                p: 0,
              }}
              type="button"
            >
              <PersonOutlineRoundedIcon sx={{ fontSize: 18 }} />
              <Typography sx={{ fontWeight: 700 }} variant="body2">
                Login / Register
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Box>

      <Toolbar
        sx={{
          gap: 2,
          justifyContent: 'space-between',
          maxWidth: 1600,
          mx: 'auto',
          px: { lg: '20px !important', xs: '0 !important' },
          py: 1.1,
          minHeight: 'unset',
          width: '100%',
        }}
      >
        <Box component={Link} sx={{ display: 'inline-flex', flexShrink: 0 }} to={routePaths.home}>
          <Box
            alt="AV's Store"
            component="img"
            src={logoImage}
            sx={{ display: 'block', height: { md: 86, xs: 58 }, objectFit: 'contain' }}
          />
        </Box>

        <Stack
          direction="row"
          spacing={0}
          sx={{
            border: `1px solid ${storefrontColors.border}`,
            borderRadius: 3,
            display: { md: 'flex', xs: 'none' },
            flex: 1,
            maxWidth: 760,
            minHeight: 58,
            overflow: 'hidden',
          }}
        >
          <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', flex: 1, px: 2 }}>
            <SearchRoundedIcon sx={{ color: '#97a4ba', fontSize: 28 }} />
            <Typography color="#a1acc0" sx={{ fontSize: { md: '1.05rem', lg: '1.1rem' }, fontWeight: 700 }} variant="h6">
              Search for pantry essentials
            </Typography>
          </Stack>
          <IconButton
            aria-label="Search"
            sx={{
              backgroundColor: storefrontColors.navy,
              borderRadius: 0,
              color: storefrontColors.surface,
              minWidth: 84,
              px: 2.5,
              '&:hover': {
                backgroundColor: storefrontColors.navyDark,
              },
            }}
          >
            <SearchRoundedIcon />
          </IconButton>
        </Stack>

        <Stack direction="row" spacing={1.1} sx={{ alignItems: 'center', flexShrink: 0 }}>
          <Badge badgeContent={0} color="secondary">
            <IconButton component={Link} sx={{ ...storefrontIconButtonSx, height: 56, width: 56 }} to={routePaths.accountFavourites}>
              <FavoriteBorderRoundedIcon />
            </IconButton>
          </Badge>
          <Badge badgeContent={totalItems} color="secondary">
            <IconButton component={Link} sx={{ ...storefrontIconButtonSx, height: 56, width: 56 }} to={routePaths.cart}>
              <ShoppingBagOutlinedIcon />
            </IconButton>
          </Badge>
        </Stack>
      </Toolbar>

      <Box
        onMouseLeave={() => setActiveCategoryId(null)}
        sx={{
          borderTop: `1px solid ${storefrontColors.border}`,
          px: { lg: 5, xs: 2 },
          position: 'relative',
          py: isScrolled ? 0.45 : 1.2,
          transition: 'padding 180ms ease',
        }}
      >
        <Stack
          direction="row"
          spacing={isScrolled ? 0.65 : 0.9}
          sx={{
            flexWrap: 'nowrap',
            maxWidth: 1600,
            mx: 'auto',
            overflowX: 'auto',
            pb: isScrolled ? 0.35 : 0.5,
            transition: 'padding 180ms ease, gap 180ms ease',
            '&::-webkit-scrollbar': {
              height: 8,
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: alpha(storefrontColors.navy, 0.18),
              borderRadius: 999,
            },
          }}
        >
          {storefrontCategories.map((category) => (
            <Box
              component={Link}
              key={category.id}
              onFocus={() => setActiveCategoryId(category.id)}
              onMouseEnter={() => setActiveCategoryId(category.id)}
              sx={{
                alignItems: 'center',
                backgroundColor: category.color,
                border: 0,
                borderRadius: 1.25,
                color: category.id === 'gifts' ? storefrontColors.navy : storefrontColors.surface,
                cursor: 'pointer',
                display: 'inline-flex',
                flexDirection: 'column',
                flex: '0 0 auto',
                gap: isScrolled ? 0 : 0.85,
                justifyContent: 'center',
                minHeight: isScrolled ? 34 : 102,
                minWidth: isScrolled ? 112 : 104,
                px: isScrolled ? 1.4 : 1.1,
                py: isScrolled ? 0.45 : 1,
                textAlign: 'center',
                textDecoration: 'none',
                transition: 'min-height 180ms ease, min-width 180ms ease, padding 180ms ease, gap 180ms ease',
                '&:hover': {
                  boxShadow: `0 10px 22px ${alpha(category.color, 0.28)}`,
                  filter: 'brightness(1.06)',
                  transform: 'translateY(-2px)',
                },
                '&:focus-visible': {
                  outline: `3px solid ${alpha(storefrontColors.navy, 0.28)}`,
                  outlineOffset: 2,
                },
                }}
              to={getCatalogPath(category.id, category.label)}
            >
              <Typography sx={{ display: isScrolled ? 'none' : 'block', fontSize: '2rem', lineHeight: 1 }} variant="body1">
                {category.icon}
              </Typography>
              <Typography
                sx={{
                  fontSize: isScrolled ? '0.74rem' : '0.8rem',
                  fontWeight: 800,
                  lineHeight: 1.1,
                  maxWidth: isScrolled ? 'none' : 78,
                  whiteSpace: isScrolled ? 'nowrap' : 'normal',
                  textTransform: 'uppercase',
                }}
                variant="caption"
              >
                {category.label}
              </Typography>
            </Box>
          ))}
        </Stack>

        {activeCategory && activeMenuItems.length > 0 ? (
          <Box
            onMouseEnter={() => setActiveCategoryId(activeCategory.id)}
            sx={{
              backgroundColor: storefrontColors.surface,
              borderRadius: 1.5,
              boxShadow: `0 22px 50px ${alpha('#9f1714', 0.16)}`,
              left: { lg: 5, xs: 2 },
              minHeight: isScrolled ? 280 : 360,
              p: { md: 2.5, xs: 2 },
              position: 'absolute',
              right: { lg: 5, xs: 2 },
              top: '100%',
              zIndex: 30,
            }}
          >
            <Typography
              sx={{
                color: storefrontColors.navy,
                fontSize: { md: '1.8rem', xs: '1.35rem' },
                fontWeight: 700,
                lineHeight: 1.2,
                mb: 2.4,
              }}
              variant="h3"
            >
              {activeCategory.label}
            </Typography>
            <Box
              sx={{
                borderRight: { md: `1px solid ${storefrontColors.border}`, xs: 0 },
                display: 'grid',
                gap: { md: '26px 28px', xs: '18px 16px' },
                gridTemplateColumns: {
                  lg: 'repeat(8, minmax(96px, 1fr))',
                  md: 'repeat(6, minmax(90px, 1fr))',
                  sm: 'repeat(4, minmax(88px, 1fr))',
                  xs: 'repeat(2, minmax(88px, 1fr))',
                },
                maxWidth: { lg: '74%', md: '82%', xs: '100%' },
                minHeight: isScrolled ? 190 : 250,
                pr: { md: 4, xs: 0 },
              }}
            >
              {activeMenuItems.map((item) => (
                <Box
                  component={Link}
                  key={item.label}
                  onClick={() => setActiveCategoryId(null)}
                  sx={{
                    alignItems: 'center',
                    color: storefrontColors.slate,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    p: 1,
                    borderRadius: 1.25,
                    minWidth: 0,
                    textDecoration: 'none',
                    textAlign: 'center',
                    transition: 'background-color 160ms ease, box-shadow 160ms ease, transform 160ms ease',
                    '&:hover': {
                      backgroundColor: alpha(storefrontColors.navy, 0.06),
                      boxShadow: `0 10px 22px ${alpha('#9f1714', 0.08)}`,
                      transform: 'translateY(-3px)',
                    },
                    '&:hover .category-menu-icon': {
                      transform: 'scale(1.12)',
                    },
                    '&:hover .category-menu-label': {
                      color: storefrontColors.navy,
                    },
                    '&:focus-visible': {
                      outline: `3px solid ${alpha(storefrontColors.navy, 0.24)}`,
                      outlineOffset: 2,
                    },
                  }}
                  to={getCatalogPath(activeCategory.id, `${activeCategory.label}: ${item.label}`, item.label)}
                >
                  <Box
                    aria-hidden="true"
                    className="category-menu-icon"
                    sx={{
                      alignItems: 'center',
                      display: 'flex',
                      fontSize: { md: '2.45rem', xs: '2rem' },
                      height: 56,
                      justifyContent: 'center',
                      lineHeight: 1,
                      transition: 'transform 160ms ease',
                      width: 72,
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography
                    className="category-menu-label"
                    sx={{
                      color: '#555a64',
                      fontSize: { md: '0.95rem', xs: '0.84rem' },
                      fontWeight: 700,
                      lineHeight: 1.25,
                      transition: 'color 160ms ease',
                    }}
                    variant="body2"
                  >
                    {item.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        ) : null}
      </Box>

      <AuthDrawer onClose={() => setIsAuthDrawerOpen(false)} open={isAuthDrawerOpen} />
    </Box>
  );
};
