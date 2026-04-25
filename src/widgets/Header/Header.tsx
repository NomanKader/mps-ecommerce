import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import FmdGoodOutlinedIcon from '@mui/icons-material/FmdGoodOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import PhoneInTalkOutlinedIcon from '@mui/icons-material/PhoneInTalkOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import { Badge, Box, Button, IconButton, Stack, Toolbar, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { storefrontColors } from '@app/providers/theme/tokens';
import logoImage from '@assets/images/kibs_flag_logo_en.png';
import { AuthDrawer } from '@widgets/AuthDrawer/AuthDrawer';
import { routePaths } from '@routes/routePaths';
import { storefrontCategories } from '@features/home/data/homePage.data';
import { useCart } from '@features/cart/hooks/useCart';
import { storefrontIconButtonSx } from '@shared/styles/storefront';

type CategoryMenuItem = {
  icon: string;
  label: string;
};

const categoryMenuItems: Record<string, CategoryMenuItem[]> = {
  bakery: [
    { icon: '🍞', label: 'Bread' },
    { icon: '🥯', label: 'Bagels' },
    { icon: '🥐', label: 'Croissants' },
    { icon: '🧁', label: 'Cakes' },
    { icon: '🍪', label: 'Cookies' },
    { icon: '🥖', label: 'Rolls' },
  ],
  care: [
    { icon: '🧴', label: 'Body Care' },
    { icon: '🧼', label: 'Soap' },
    { icon: '🪥', label: 'Dental Care' },
    { icon: '🧻', label: 'Paper Goods' },
    { icon: '🧽', label: 'Cleaning' },
    { icon: '🧖', label: 'Beauty' },
  ],
  dairy: [
    { icon: '🥛', label: 'Milk' },
    { icon: '🧀', label: 'Cheese' },
    { icon: '🧈', label: 'Butter' },
    { icon: '🍦', label: 'Yoghurt' },
    { icon: '🥚', label: 'Eggs' },
    { icon: '🍮', label: 'Desserts' },
  ],
  drinks: [
    { icon: '🥤', label: 'Soft Drinks' },
    { icon: '🧃', label: 'Juices' },
    { icon: '💧', label: 'Water' },
    { icon: '☕', label: 'Coffee' },
    { icon: '🍵', label: 'Tea' },
    { icon: '🧊', label: 'Ice' },
  ],
  flowers: [
    { icon: '💐', label: 'Bouquets' },
    { icon: '🌹', label: 'Roses' },
    { icon: '🌷', label: 'Tulips' },
    { icon: '🪴', label: 'Plants' },
    { icon: '🌻', label: 'Sunflowers' },
    { icon: '🎀', label: 'Arrangements' },
  ],
  frozen: [
    { icon: '🍱', label: 'Frozen Ready Meals' },
    { icon: '🍓', label: 'Frozen Fruit' },
    { icon: '🥦', label: 'Frozen Vegetables' },
    { icon: '🐟', label: 'Frozen Seafood' },
    { icon: '🍗', label: 'Frozen Chicken & Meat' },
    { icon: '🍟', label: 'Frozen Chips' },
    { icon: '🥐', label: 'Frozen Bakery' },
    { icon: '🍨', label: 'Ice Cream & Desserts' },
    { icon: '🍕', label: 'Frozen Pizza' },
    { icon: '🥟', label: 'Frozen Appetizers' },
  ],
  fruits: [
    { icon: '🍎', label: 'Apples & Pears' },
    { icon: '🍌', label: 'Bananas' },
    { icon: '🍇', label: 'Berries & Grapes' },
    { icon: '🍊', label: 'Citrus' },
    { icon: '🥭', label: 'Tropical Fruit' },
    { icon: '🍉', label: 'Melons' },
  ],
  gifts: [
    { icon: '🎁', label: 'Gift Boxes' },
    { icon: '💳', label: 'E-Gift Cards' },
    { icon: '🍫', label: 'Chocolate Gifts' },
    { icon: '💐', label: 'Flower Gifts' },
    { icon: '🧺', label: 'Hampers' },
    { icon: '🎀', label: 'Custom Gifts' },
  ],
  home: [
    { icon: '🧻', label: 'Kitchen Rolls' },
    { icon: '🧽', label: 'Cleaning' },
    { icon: '🕯️', label: 'Home Fragrance' },
    { icon: '🧺', label: 'Laundry' },
    { icon: '🍽️', label: 'Tableware' },
    { icon: '🔋', label: 'Household' },
  ],
  kids: [
    { icon: '🍼', label: 'Baby Food' },
    { icon: '🥣', label: 'Kids Breakfast' },
    { icon: '🧃', label: 'Lunchbox Drinks' },
    { icon: '🍪', label: 'Kids Snacks' },
    { icon: '🧸', label: 'Toys' },
    { icon: '🧼', label: 'Baby Care' },
  ],
  meat: [
    { icon: '🥩', label: 'Beef' },
    { icon: '🍗', label: 'Chicken' },
    { icon: '🍖', label: 'Lamb' },
    { icon: '🥓', label: 'Cold Cuts' },
    { icon: '🌭', label: 'Sausages' },
    { icon: '🍔', label: 'Burgers' },
  ],
  pantry: [
    { icon: '🥣', label: 'Breakfast Cereals' },
    { icon: '🥫', label: 'Cans, Jars & Packets' },
    { icon: '🍫', label: 'Chocolates & Sweets' },
    { icon: '🧂', label: 'Condiments & Dressings' },
    { icon: '🍪', label: 'Crackers & Biscuits' },
    { icon: '🥨', label: 'Crisps & Snacks' },
    { icon: '🫒', label: 'Oil & Vinegar' },
    { icon: '🍝', label: 'Pasta & Noodles' },
    { icon: '🍚', label: 'Rice & Grains' },
    { icon: '🌶️', label: 'Spices & Seasonings' },
    { icon: '🍯', label: 'Honey, Jams & Spreads' },
    { icon: '🌰', label: 'Nuts, Seeds & Dried Fruits' },
  ],
  pets: [
    { icon: '🐶', label: 'Dog Food' },
    { icon: '🐱', label: 'Cat Food' },
    { icon: '🦴', label: 'Treats' },
    { icon: '🧸', label: 'Pet Toys' },
    { icon: '🧼', label: 'Pet Care' },
    { icon: '🐾', label: 'Accessories' },
  ],
  'quick-meals': [
    { icon: '🥟', label: 'Appetizers' },
    { icon: '🍜', label: 'Asian' },
    { icon: '🥣', label: 'Breakfast' },
    { icon: '🍰', label: 'Desserts' },
    { icon: '🥘', label: 'European' },
    { icon: '🍱', label: 'Freshly Prepared' },
    { icon: '🥪', label: 'Grab & Go' },
    { icon: '🍲', label: 'Heat & Eat' },
    { icon: '🍕', label: 'Italian' },
    { icon: '🧒', label: 'Kids Meals' },
    { icon: '🥖', label: 'Sides' },
    { icon: '🥗', label: 'Soups & Salads' },
  ],
  seafood: [
    { icon: '🐟', label: 'Fresh Fish' },
    { icon: '🦐', label: 'Prawns' },
    { icon: '🦀', label: 'Crab' },
    { icon: '🦞', label: 'Lobster' },
    { icon: '🍣', label: 'Sushi' },
    { icon: '🥫', label: 'Smoked & Canned' },
  ],
  vegetables: [
    { icon: '🥬', label: 'Leafy Greens' },
    { icon: '🥕', label: 'Root Vegetables' },
    { icon: '🍅', label: 'Tomatoes' },
    { icon: '🥦', label: 'Broccoli & Cauliflower' },
    { icon: '🥒', label: 'Cucumbers' },
    { icon: '🌶️', label: 'Peppers & Chillies' },
  ],
};

export const Header = () => {
  const { totalItems } = useCart();
  const [isAuthDrawerOpen, setIsAuthDrawerOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const activeCategory = storefrontCategories.find((category) => category.id === activeCategoryId);
  const activeMenuItems = activeCategoryId ? (categoryMenuItems[activeCategoryId] ?? []) : [];

  useEffect(() => {
    const updateScrolledState = () => {
      setIsScrolled(window.scrollY > 80);
    };

    updateScrolledState();
    window.addEventListener('scroll', updateScrolledState, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateScrolledState);
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
                800 KIBSONS
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
            alt="Kibsons International"
            component="img"
            src={logoImage}
            sx={{ display: 'block', height: { md: 68, xs: 46 }, objectFit: 'contain' }}
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
              component="button"
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
                transition: 'min-height 180ms ease, min-width 180ms ease, padding 180ms ease, gap 180ms ease',
                '&:focus-visible': {
                  outline: `3px solid ${alpha(storefrontColors.navy, 0.28)}`,
                  outlineOffset: 2,
                },
              }}
              type="button"
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
              boxShadow: `0 22px 50px ${alpha('#102b5d', 0.16)}`,
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
                  key={item.label}
                  sx={{
                    alignItems: 'center',
                    color: storefrontColors.slate,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    minWidth: 0,
                    textAlign: 'center',
                  }}
                >
                  <Box
                    aria-hidden="true"
                    sx={{
                      alignItems: 'center',
                      display: 'flex',
                      fontSize: { md: '2.45rem', xs: '2rem' },
                      height: 56,
                      justifyContent: 'center',
                      lineHeight: 1,
                      width: 72,
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography
                    sx={{
                      color: '#555a64',
                      fontSize: { md: '0.95rem', xs: '0.84rem' },
                      fontWeight: 700,
                      lineHeight: 1.25,
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
