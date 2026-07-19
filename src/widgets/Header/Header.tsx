import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import FmdGoodOutlinedIcon from '@mui/icons-material/FmdGoodOutlined';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import PhoneInTalkOutlinedIcon from '@mui/icons-material/PhoneInTalkOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import {
  Badge,
  Box,
  Button,
  ClickAwayListener,
  IconButton,
  InputBase,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, matchPath, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';

import { storefrontColors, storefrontGradients } from '@app/providers/theme/tokens';
import logoImage from '@assets/images/logo.png';
import { AuthDrawer } from '@widgets/AuthDrawer/AuthDrawer';
import { routePaths } from '@routes/routePaths';
import {
  storefrontCategories,
  storefrontCategoryMenuItems,
} from '@features/home/data/homePage.data';
import { useCart } from '@features/cart/hooks/useCart';
import { useAddresses } from '@features/addresses/hooks/useAddresses';
import { merchandisingApi } from '@features/home/api/merchandisingApi';
import { useSignOut } from '@features/auth/hooks/useSignOut';
import { storefrontIconButtonSx } from '@shared/styles/storefront';
import type { RootState } from '@store/index';
import type { CustomerAddress } from '@entities/address/types/address.types';

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

const groceryIconRules: Array<[string[], string]> = [
  [['tomato'], '🍅'],
  [['leafy', 'lettuce', 'green', 'spinach'], '🥬'],
  [['root', 'carrot'], '🥕'],
  [['broccoli', 'cauliflower'], '🥦'],
  [['cucumber'], '🥒'],
  [['pepper', 'chilli'], '🌶️'],
  [['vegetable', 'veg'], '🥬'],
  [['apple', 'pear'], '🍎'],
  [['banana'], '🍌'],
  [['berry', 'berries', 'strawberry'], '🍓'],
  [['grape'], '🍇'],
  [['citrus', 'orange'], '🍊'],
  [['fruit'], '🍓'],
  [['bread', 'roll'], '🍞'],
  [['bagel'], '🥯'],
  [['croissant'], '🥐'],
  [['cake', 'cupcake'], '🧁'],
  [['cookie', 'biscuit'], '🍪'],
  [['bakery'], '🥐'],
  [['milk'], '🥛'],
  [['cheese'], '🧀'],
  [['butter'], '🧈'],
  [['yoghurt', 'yogurt'], '🍦'],
  [['egg'], '🥚'],
  [['dairy'], '🥛'],
  [['meat', 'beef', 'steak'], '🥩'],
  [['chicken'], '🍗'],
  [['sausage'], '🌭'],
  [['seafood', 'fish'], '🐟'],
  [['prawn', 'shrimp'], '🦐'],
  [['crab'], '🦀'],
  [['lobster'], '🦞'],
  [['pantry', 'can', 'jar'], '🥫'],
  [['rice', 'grain'], '🍚'],
  [['pasta', 'noodle'], '🍝'],
  [['oil', 'vinegar'], '🫒'],
  [['honey', 'jam', 'spread'], '🍯'],
  [['drink', 'beverage', 'soft drink'], '🥤'],
  [['juice'], '🧃'],
  [['water'], '💧'],
  [['coffee'], '☕'],
  [['tea'], '🍵'],
  [['frozen', 'ice'], '❄️'],
  [['flower', 'bouquet'], '💐'],
  [['gift'], '🎁'],
  [['home', 'household'], '🏠'],
  [['cleaning'], '🧽'],
  [['care', 'beauty'], '🧴'],
  [['kid', 'baby'], '🧸'],
  [['pet'], '🐾'],
  [['quick meal', 'ready meal', 'heat'], '🍽️'],
  [['snack', 'crisps'], '🥨'],
];

const getGroceryIcon = (label: string, fallback = '🏷️') => {
  const normalizedLabel = label.toLowerCase();
  const matchedRule = groceryIconRules.find(([keywords]) =>
    keywords.some((keyword) => normalizedLabel.includes(keyword)),
  );

  return matchedRule?.[1] ?? fallback;
};

const sustainableShoppingLinks = [
  { label: 'Our Story', to: routePaths.sustainability.story },
  { label: 'Our Vision', to: routePaths.sustainability.vision },
  { label: 'Our Brand', to: routePaths.sustainability.brand },
  { label: "AV's Store Cares", to: routePaths.sustainability.cares },
  { label: 'Quality', to: routePaths.sustainability.quality },
  { label: 'Media', to: routePaths.sustainability.media },
  { label: 'Awards', to: routePaths.sustainability.awards },
  { label: "AV's Store Kitchen", to: routePaths.sustainability.kitchen },
];

const addressSummary = (address: CustomerAddress) =>
  [address.addressLine1, address.township, address.city].filter(Boolean).join(', ');

type AuthDrawerMode = 'login' | 'register';

export const Header = () => {
  const { totalItems } = useCart();
  const signOut = useSignOut();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { addresses, isLoading: isLoadingAddresses } = useAddresses();
  const [isAuthDrawerOpen, setIsAuthDrawerOpen] = useState(false);
  const [authDrawerMode, setAuthDrawerMode] = useState<AuthDrawerMode>('login');
  const [isAddressShortcutOpen, setIsAddressShortcutOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [isSustainableMenuOpen, setIsSustainableMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const headerSettingsQuery = useQuery({
    queryFn: ({ signal }) => merchandisingApi.getHeaderSettings({ signal }),
    queryKey: ['storefront', 'header-settings'],
  });
  const storefrontCategoriesQuery = useQuery({
    queryFn: ({ signal }) => merchandisingApi.listStorefrontCategories({ signal }),
    queryKey: ['storefront', 'categories'],
  });
  const pageSegmentMatch = matchPath(routePaths.pageSegmentDetails, location.pathname);
  const currentPageSegmentId = pageSegmentMatch?.params.segmentId;
  const pageSegmentQuery = useQuery({
    enabled: Boolean(currentPageSegmentId),
    queryFn: ({ signal }) =>
      merchandisingApi.getStorefrontPageSegment(String(currentPageSegmentId), { signal }),
    queryKey: ['storefront', 'page-segment', currentPageSegmentId],
  });
  const headerCategories = useMemo(() => {
    if (!storefrontCategoriesQuery.data?.length) {
      return storefrontCategories.map((category) => ({
        color: category.color,
        icon: category.icon,
        id: category.id,
        label: category.label,
        menuItems: storefrontCategoryMenuItems[category.id] ?? [],
      }));
    }

    return storefrontCategoriesQuery.data.map((category) => ({
      color: category.color ?? storefrontColors.success,
      icon: getGroceryIcon(category.name, category.icon ?? '🏷️'),
      id: category.id,
      label: category.name,
      menuItems: (category.subcategories ?? []).map((subcategory) => ({
        icon: getGroceryIcon(subcategory.name, subcategory.icon || category.icon || '•'),
        label: subcategory.name,
      })),
    }));
  }, [storefrontCategoriesQuery.data]);
  const activeCategory = headerCategories.find((category) => category.id === activeCategoryId);
  const activeMenuItems = activeCategory?.menuItems ?? [];
  const isCustomer = isAuthenticated && user?.role === 'customer';
  const isTenantAdmin = isAuthenticated && user?.role === 'tenant_admin';
  const defaultAddress = addresses.find((address) => address.isDefault) ?? addresses[0];
  const addressButtonLabel = defaultAddress
    ? `${defaultAddress.label.toUpperCase()} · ${defaultAddress.township || defaultAddress.city}`
    : 'Add your address';
  const deliveryHeadline =
    headerSettingsQuery.data?.deliveryHeadline ?? user?.deliveryHeadline ?? 'Delivery all over UAE';
  const supportPhoneLabel = headerSettingsQuery.data
    ? `${headerSettingsQuery.data.supportPhoneCountryCode} ${headerSettingsQuery.data.supportPhoneNumber}`.trim()
    : (user?.supportPhoneLabel ?? '800 AVS');
  const topBarTagline =
    headerSettingsQuery.data?.topBarTagline ??
    user?.topBarTagline ??
    'Sustainable Grocery Shopping';
  const appLogoUrl = headerSettingsQuery.data?.logoUrl || user?.logoUrl || logoImage;
  const isAccountRoute =
    location.pathname.startsWith(routePaths.account) &&
    location.pathname !== routePaths.accountFavourites;
  const productDetailsPathPrefix = routePaths.productDetails.split('/:')[0];
  const pageSegmentDetailsPathPrefix = routePaths.pageSegmentDetails.split('/:')[0];
  const shouldShowCategoryNavigation =
    location.pathname === routePaths.home ||
    location.pathname === routePaths.catalog ||
    location.pathname.startsWith(`${productDetailsPathPrefix}/`) ||
    location.pathname.startsWith(`${pageSegmentDetailsPathPrefix}/`);

  const openAuthDrawer = (mode: AuthDrawerMode = 'login') => {
    setAuthDrawerMode(mode);
    setIsAuthDrawerOpen(true);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const authMode = params.get('auth');

    if (authMode !== 'login' && authMode !== 'register') {
      return;
    }

    setAuthDrawerMode(authMode);
    setIsAuthDrawerOpen(true);
    params.delete('auth');
    navigate(
      {
        pathname: location.pathname,
        search: params.toString() ? `?${params.toString()}` : '',
      },
      { replace: true },
    );
  }, [location.pathname, location.search, navigate]);

  useEffect(() => {
    const updateScrolledState = () => {
      setIsScrolled(window.scrollY > 0);
    };

    updateScrolledState();
    window.addEventListener('scroll', updateScrolledState, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateScrolledState);
    };
  }, []);

  useEffect(() => {
    if (!shouldShowCategoryNavigation) {
      const timeoutId = window.setTimeout(() => setActiveCategoryId(null), 0);

      return () => window.clearTimeout(timeoutId);
    }
  }, [shouldShowCategoryNavigation]);

  useEffect(() => {
    if (currentPageSegmentId) {
      const categoryName = pageSegmentQuery.data?.category?.name;

      if (categoryName) {
        const timeoutId = window.setTimeout(() => setSearchValue(categoryName), 0);

        return () => window.clearTimeout(timeoutId);
      }
    }

    if (location.pathname === routePaths.catalog || location.pathname === routePaths.search) {
      const nextSearchValue = new URLSearchParams(location.search).get('search') ?? '';
      const timeoutId = window.setTimeout(() => setSearchValue(nextSearchValue), 0);

      return () => window.clearTimeout(timeoutId);
    }
  }, [currentPageSegmentId, location.pathname, location.search, pageSegmentQuery.data?.category?.name]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedSearch = searchValue.trim();
    const params = new URLSearchParams();

    if (normalizedSearch) {
      params.set('search', normalizedSearch);
      params.set('title', `Search: ${normalizedSearch}`);
    }

    const searchRoute = window.matchMedia('(max-width: 899px)').matches
      ? routePaths.search
      : routePaths.catalog;

    navigate(`${searchRoute}${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const handleAddressButtonClick = () => {
    if (!isAuthenticated) {
      openAuthDrawer();
      return;
    }

    if (!addresses.length) {
      void navigate(routePaths.accountAddresses);
      return;
    }

    setIsAddressShortcutOpen((isOpen) => !isOpen);
  };

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
          background: storefrontGradients.brandBar,
          display: { md: 'none', xs: 'block' },
          px: 2.4,
          py: 1.4,
        }}
      >
        <Stack
          component="form"
          direction="row"
          onSubmit={handleSearchSubmit}
          spacing={1.6}
          sx={{ alignItems: 'center' }}
        >
          <Box
            sx={{
              alignItems: 'center',
              backgroundColor: storefrontColors.surface,
              borderRadius: 1,
              color: alpha(storefrontColors.navy, 0.42),
              display: 'flex',
              flex: 1,
              gap: 1.5,
              minHeight: 55,
              minWidth: 0,
              px: 1.65,
              textDecoration: 'none',
            }}
          >
            <Box
              alt="AV's Store"
              component="img"
              src={appLogoUrl}
              sx={{ display: 'block', height: 28, objectFit: 'contain', width: 28 }}
            />
            <InputBase
              fullWidth
              inputProps={{ 'aria-label': 'Search products' }}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search for fruits"
              sx={{
                color: storefrontColors.navy,
                fontSize: '1.02rem',
                fontWeight: 800,
                minWidth: 0,
                '& input': {
                  p: 0,
                },
                '& input::placeholder': {
                  color: alpha(storefrontColors.navy, 0.58),
                  fontWeight: 800,
                  opacity: 1,
                },
              }}
              value={searchValue}
            />
          </Box>
          <IconButton
            aria-label="Call support"
            component="a"
            href="tel:+959447188997"
            sx={{ color: '#ffffff', flexShrink: 0, height: 42, width: 42 }}
          >
            <PhoneInTalkOutlinedIcon sx={{ fontSize: 31 }} />
          </IconButton>
        </Stack>
      </Box>

      <Box
        sx={{
          background: storefrontGradients.brandBar,
          color: storefrontColors.surface,
          display: { md: 'block', xs: 'none' },
          px: { lg: 5, xs: 2 },
          py: 1.25,
        }}
      >
        <Stack
          direction={{ lg: 'row', xs: 'column' }}
          spacing={1.5}
          sx={{
            alignItems: { lg: 'center', xs: 'flex-start' },
            justifyContent: 'space-between',
            maxWidth: 1600,
            mx: 'auto',
          }}
        >
          <Stack direction="row" spacing={3} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <LocalShippingOutlinedIcon sx={{ fontSize: 22 }} />
              <Typography sx={{ fontWeight: 700 }} variant="body2">
                {deliveryHeadline}
              </Typography>
            </Stack>
            <ClickAwayListener onClickAway={() => setIsAddressShortcutOpen(false)}>
              <Box sx={{ position: 'relative' }}>
                <Button
                  onClick={handleAddressButtonClick}
                  startIcon={<FmdGoodOutlinedIcon />}
                  sx={{
                    border: `1px solid ${alpha('#ffffff', 0.28)}`,
                    borderRadius: 2,
                    color: storefrontColors.surface,
                    maxWidth: 310,
                    px: 2,
                    textTransform: 'none',
                  }}
                >
                  <Typography noWrap sx={{ fontWeight: 800 }} variant="body2">
                    {isLoadingAddresses && isAuthenticated ? 'Checking address...' : addressButtonLabel}
                  </Typography>
                </Button>
                {isAddressShortcutOpen && defaultAddress ? (
                  <Box
                    sx={{
                      backgroundColor: '#ffffff',
                      border: `1px solid ${alpha(storefrontColors.navy, 0.12)}`,
                      borderRadius: 1,
                      boxShadow: `0 18px 44px ${alpha(storefrontColors.navyDark, 0.18)}`,
                      color: storefrontColors.navy,
                      left: 0,
                      minWidth: 340,
                      p: 2,
                      position: 'absolute',
                      top: 'calc(100% + 10px)',
                      zIndex: 40,
                    }}
                  >
                    <Stack spacing={1.35}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                        <FmdGoodOutlinedIcon color="primary" sx={{ mt: 0.15 }} />
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 900 }} variant="body2">
                            {defaultAddress.label.toUpperCase()}
                            {defaultAddress.isDefault ? ' · Default' : ''}
                          </Typography>
                          <Typography sx={{ color: '#4b5563', fontWeight: 800 }} variant="body2">
                            {defaultAddress.recipientName} · {defaultAddress.phone}
                          </Typography>
                          <Typography color="text.secondary" variant="body2">
                            {addressSummary(defaultAddress)}
                          </Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" spacing={1}>
                        <Button
                          fullWidth
                          onClick={() => {
                            setIsAddressShortcutOpen(false);
                            void navigate(routePaths.accountAddresses);
                          }}
                          size="small"
                          sx={{ fontWeight: 900, textTransform: 'none' }}
                          variant="contained"
                        >
                          Manage address
                        </Button>
                      </Stack>
                    </Stack>
                  </Box>
                ) : null}
              </Box>
            </ClickAwayListener>
          </Stack>
          <Stack direction="row" spacing={3} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            {topBarTagline ? (
              <ClickAwayListener onClickAway={() => setIsSustainableMenuOpen(false)}>
                <Box sx={{ position: 'relative' }}>
                  <Stack
                    aria-expanded={isSustainableMenuOpen}
                    aria-haspopup="menu"
                    component="button"
                    direction="row"
                    onClick={() => setIsSustainableMenuOpen((isOpen) => !isOpen)}
                    spacing={0.45}
                    sx={{
                      alignItems: 'center',
                      background: 'transparent',
                      border: 0,
                      color: 'inherit',
                      cursor: 'pointer',
                      font: 'inherit',
                      p: 0,
                    }}
                    type="button"
                  >
                    <Typography sx={{ fontWeight: 700 }} variant="body2">
                      {topBarTagline}
                    </Typography>
                    <KeyboardArrowDownRoundedIcon
                      sx={{
                        fontSize: 20,
                        transform: isSustainableMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 160ms ease',
                      }}
                    />
                  </Stack>

                  {isSustainableMenuOpen ? (
                    <Box
                      role="menu"
                      sx={{
                        backgroundColor: '#ffffff',
                        borderRadius: 0.5,
                        boxShadow: `0 14px 34px ${alpha(storefrontColors.navyDark, 0.24)}`,
                        color: '#55565c',
                        minWidth: 260,
                        overflow: 'hidden',
                        position: 'absolute',
                        right: 0,
                        top: 'calc(100% + 15px)',
                        zIndex: 60,
                      }}
                    >
                      {sustainableShoppingLinks.map((item) => (
                        <Box
                          component={Link}
                          key={item.to}
                          onClick={() => setIsSustainableMenuOpen(false)}
                          role="menuitem"
                          sx={{
                            color: '#55565c',
                            display: 'block',
                            fontSize: '0.98rem',
                            fontWeight: 700,
                            lineHeight: 1.25,
                            px: 2.2,
                            py: 1.25,
                            textDecoration: 'none',
                            transition: 'background-color 140ms ease, color 140ms ease',
                            '&:hover, &:focus-visible': {
                              backgroundColor: alpha(storefrontColors.navy, 0.08),
                              color: storefrontColors.navy,
                              outline: 'none',
                            },
                          }}
                          to={item.to}
                        >
                          {item.label}
                        </Box>
                      ))}
                    </Box>
                  ) : null}
                </Box>
              </ClickAwayListener>
            ) : null}
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <PhoneInTalkOutlinedIcon sx={{ fontSize: 18 }} />
              <Typography sx={{ fontWeight: 800 }} variant="body2">
                {supportPhoneLabel}
              </Typography>
            </Stack>
            {isAuthenticated ? (
              <Stack direction="row" spacing={1.4} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                {isCustomer ? (
                  <Stack
                    component={Link}
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center' }}
                    to={routePaths.accountWallet}
                  >
                    <PersonOutlineRoundedIcon sx={{ fontSize: 18 }} />
                    <Typography sx={{ fontWeight: 700 }} variant="body2">
                      {user.firstName} / Wallet
                    </Typography>
                  </Stack>
                ) : (
                  <Typography sx={{ fontWeight: 700 }} variant="body2">
                    {user?.firstName ?? 'Account'}
                  </Typography>
                )}
                {isTenantAdmin ? (
                  <Stack
                    component={Link}
                    direction="row"
                    spacing={0.7}
                    sx={{
                      alignItems: 'center',
                      color: 'inherit',
                      textDecoration: 'none',
                    }}
                    to={routePaths.tenantAdmin.dashboard}
                  >
                    <DashboardOutlinedIcon sx={{ fontSize: 18 }} />
                    <Typography sx={{ fontWeight: 700 }} variant="body2">
                      Dashboard
                    </Typography>
                  </Stack>
                ) : null}
                <Stack
                  component="button"
                  direction="row"
                  onClick={() => void signOut()}
                  spacing={0.7}
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
                  <LogoutRoundedIcon sx={{ fontSize: 18 }} />
                  <Typography sx={{ fontWeight: 700 }} variant="body2">
                    Sign out
                  </Typography>
                </Stack>
              </Stack>
            ) : (
              <Stack
                component="button"
                direction="row"
                onClick={() => openAuthDrawer()}
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
            )}
          </Stack>
        </Stack>
      </Box>

      <Toolbar
        sx={{
          gap: 2,
          display: { md: 'flex', xs: 'none' },
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
            src={appLogoUrl}
            sx={{ display: 'block', height: { md: 86, xs: 58 }, objectFit: 'contain' }}
          />
        </Box>

        <Stack
          component="form"
          direction="row"
          onSubmit={handleSearchSubmit}
          spacing={0}
          sx={{
            border: `1px solid ${storefrontColors.border}`,
            borderRadius: 1,
            display: { md: 'flex', xs: 'none' },
            flex: 1,
            maxWidth: 760,
            minHeight: 58,
            overflow: 'hidden',
          }}
        >
          <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', flex: 1, px: 2 }}>
            <SearchRoundedIcon sx={{ color: '#97a4ba', fontSize: 28 }} />
            <InputBase
              fullWidth
              inputProps={{ 'aria-label': 'Search products' }}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search items, categories, or sub categories"
              sx={{
                color: storefrontColors.navy,
                fontSize: { md: '1.05rem', lg: '1.1rem' },
                fontWeight: 800,
                minWidth: 0,
                '& input::placeholder': {
                  color: alpha(storefrontColors.navy, 0.34),
                  fontWeight: 700,
                  opacity: 1,
                },
              }}
              value={searchValue}
            />
          </Stack>
          <IconButton
            aria-label="Search"
            type="submit"
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
          {isCustomer ? (
            <Badge color="secondary" variant="dot">
              <IconButton
                component={Link}
                sx={{ ...storefrontIconButtonSx, height: 56, width: 56 }}
                to={routePaths.accountWallet}
              >
                <AccountBalanceWalletOutlinedIcon />
              </IconButton>
            </Badge>
          ) : null}
          <Badge badgeContent={0} color="secondary">
            <IconButton
              component={Link}
              sx={{ ...storefrontIconButtonSx, height: 56, width: 56 }}
              to={routePaths.accountFavourites}
            >
              <FavoriteBorderRoundedIcon />
            </IconButton>
          </Badge>
          <Badge badgeContent={totalItems} color="secondary">
            <IconButton
              component={Link}
              sx={{ ...storefrontIconButtonSx, height: 56, width: 56 }}
              to={routePaths.cart}
            >
              <ShoppingBagOutlinedIcon />
            </IconButton>
          </Badge>
        </Stack>
      </Toolbar>

      {shouldShowCategoryNavigation ? (
        <Box
          onMouseLeave={() => setActiveCategoryId(null)}
          sx={{
            borderTop: `1px solid ${storefrontColors.border}`,
            display: { md: 'block', xs: 'none' },
            px: { lg: 5, xs: 2 },
            position: 'relative',
            py: 1.2,
          }}
        >
        <Box
          sx={{
            display: 'flex',
            gap: isScrolled ? 0.65 : 0.9,
            maxWidth: 1600,
            mx: 'auto',
            overflowX: 'auto',
            overflowY: 'hidden',
            pb: isScrolled ? 0.35 : 0.5,
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
          {headerCategories.map((category) => (
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
                color:
                  category.color.toLowerCase() === '#ffffff' || category.id === 'gifts'
                    ? storefrontColors.navy
                    : storefrontColors.surface,
                cursor: 'pointer',
                display: 'inline-flex',
                flexDirection: 'column',
                flex: {
                  xl: isScrolled ? '0 0 116px' : '1 0 168px',
                  lg: isScrolled ? '0 0 108px' : '1 0 148px',
                  md: isScrolled ? '0 0 104px' : '0 0 126px',
                },
                gap: isScrolled ? 0 : { xl: 1, lg: 0.85, md: 0.65 },
                height: {
                  xl: isScrolled ? 36 : 118,
                  lg: isScrolled ? 34 : 108,
                  md: isScrolled ? 34 : 92,
                },
                justifyContent: 'center',
                minHeight: {
                  xl: isScrolled ? 36 : 118,
                  lg: isScrolled ? 34 : 108,
                  md: isScrolled ? 34 : 92,
                },
                minWidth: 0,
                px: isScrolled ? 0.6 : { xl: 1.1, lg: 0.9, md: 0.75 },
                py: isScrolled ? 0.45 : 1,
                scrollSnapAlign: 'start',
                textAlign: 'center',
                textDecoration: 'none',
                transform: 'translateZ(0)',
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
              <Typography
                sx={{
                  fontSize: { xl: '2.55rem', lg: '2.25rem', md: '1.9rem' },
                  height: isScrolled ? 0 : { xl: 42, lg: 38, md: 32 },
                  lineHeight: 1,
                  opacity: isScrolled ? 0 : 1,
                  overflow: 'hidden',
                  transform: isScrolled
                    ? 'scale(0.72) translateY(-8px)'
                    : 'scale(1) translateY(0)',
                }}
                variant="body1"
              >
                {category.icon}
              </Typography>
              <Typography
                sx={{
                  fontSize: {
                    xl: isScrolled ? '0.72rem' : '0.86rem',
                    lg: isScrolled ? '0.68rem' : '0.78rem',
                    md: isScrolled ? '0.64rem' : '0.72rem',
                  },
                  fontWeight: 800,
                  lineHeight: 1.1,
                  maxWidth: '100%',
                  overflowWrap: 'anywhere',
                  whiteSpace: 'normal',
                  textTransform: 'uppercase',
                }}
                variant="caption"
              >
                {category.label}
              </Typography>
            </Box>
          ))}
        </Box>

        {activeCategory && activeMenuItems.length > 0 ? (
          <Box
            onMouseEnter={() => setActiveCategoryId(activeCategory.id)}
            sx={{
              backgroundColor: storefrontColors.surface,
              borderRadius: 1.5,
              boxShadow: `0 22px 50px ${alpha('#9f1714', 0.16)}`,
              left: { lg: 5, xs: 2 },
              maxHeight: {
                md: isScrolled
                  ? 'min(420px, calc(100vh - 170px))'
                  : 'min(460px, calc(100vh - 260px))',
                xs: 'min(70vh, 520px)',
              },
              overflowY: 'auto',
              p: { md: 2.1, xs: 1.6 },
              position: 'absolute',
              right: { lg: 5, xs: 2 },
              top: '100%',
              zIndex: 30,
              '&::-webkit-scrollbar': { width: 8 },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: alpha(storefrontColors.navy, 0.18),
                borderRadius: 999,
              },
            }}
          >
            <Typography
              sx={{
                color: storefrontColors.navy,
                fontSize: { md: '1.45rem', xs: '1.2rem' },
                fontWeight: 700,
                lineHeight: 1.2,
                mb: { md: 1.4, xs: 1.1 },
              }}
              variant="h3"
            >
              {activeCategory.label}
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gap: { md: '12px 18px', xs: '10px 12px' },
                gridTemplateColumns: {
                  lg: 'repeat(auto-fit, minmax(104px, 128px))',
                  md: 'repeat(auto-fit, minmax(96px, 120px))',
                  sm: 'repeat(auto-fit, minmax(92px, 112px))',
                  xs: 'repeat(2, minmax(0, 1fr))',
                },
                justifyContent: { md: 'start', xs: 'stretch' },
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
                    gap: 0.65,
                    p: { md: 0.8, xs: 0.7 },
                    borderRadius: 1.25,
                    minWidth: 0,
                    textDecoration: 'none',
                    textAlign: 'center',
                    transition:
                      'background-color 160ms ease, box-shadow 160ms ease, transform 160ms ease',
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
                  to={getCatalogPath(
                    activeCategory.id,
                    `${activeCategory.label}: ${item.label}`,
                    item.label,
                  )}
                >
                  <Box
                    aria-hidden="true"
                    className="category-menu-icon"
                    sx={{
                      alignItems: 'center',
                      display: 'flex',
                      fontSize: { md: '2.05rem', xs: '1.8rem' },
                      height: { md: 42, xs: 38 },
                      justifyContent: 'center',
                      lineHeight: 1,
                      transition: 'transform 160ms ease',
                      width: { md: 58, xs: 50 },
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography
                    className="category-menu-label"
                    sx={{
                      color: '#555a64',
                      fontSize: { md: '0.86rem', xs: '0.8rem' },
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
      ) : null}

      <AuthDrawer
        initialMode={authDrawerMode}
        onClose={() => setIsAuthDrawerOpen(false)}
        open={isAuthDrawerOpen}
      />
      {/*
      {isAppPromptVisible ? (
        <Box
          sx={{
            alignItems: 'center',
            backgroundColor: storefrontColors.navy,
            borderRadius: 1.5,
            bottom: 'calc(72px + env(safe-area-inset-bottom, 0px) + 16px)',
            boxShadow: `0 12px 26px ${alpha(storefrontColors.navyDark, 0.24)}`,
            color: '#ffffff',
            display: { md: 'none', xs: 'flex' },
            gap: 1.4,
            left: 12,
            minHeight: 98,
            px: 1.6,
            py: 1.4,
            position: 'fixed',
            right: 12,
            zIndex: 1190,
          }}
        >
          <Box
            alt="AV's Store"
            component="img"
            src={appLogoUrl}
            sx={{ display: 'block', flexShrink: 0, height: 43, objectFit: 'contain', width: 43 }}
          />
          <Typography
            sx={{ flex: 1, fontSize: '1.18rem', fontWeight: 900, lineHeight: 1.4, minWidth: 0 }}
          >
            The easiest way to shop on AV's Store
          </Typography>
          <Button
            sx={{
              backgroundColor: '#ffffff',
              borderRadius: 999,
              color: storefrontColors.muted,
              flexShrink: 0,
              fontSize: '1rem',
              fontWeight: 900,
              minWidth: 150,
              px: 2.1,
              py: 1.2,
              textTransform: 'none',
              '&:hover': { backgroundColor: '#eef3ff' },
            }}
          >
            Download App
          </Button>
          <IconButton
            aria-label="Dismiss app download"
            onClick={() => setIsAppPromptVisible(false)}
            sx={{ color: '#ffffff', flexShrink: 0, p: 0.2 }}
          >
            <CloseRoundedIcon sx={{ fontSize: 30 }} />
          </IconButton>
        </Box>
      ) : null}
      */}
      <Box
        aria-label="Primary mobile navigation"
        component="nav"
        sx={{
          background: storefrontGradients.brandBar,
          bottom: 0,
          boxShadow: `0 -8px 24px ${alpha(storefrontColors.navyDark, 0.2)}`,
          color: storefrontColors.surface,
          display: { md: 'none', xs: 'grid' },
          gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
          height: 'calc(72px + env(safe-area-inset-bottom, 0px))',
          left: 0,
          pb: 'env(safe-area-inset-bottom, 0px)',
          position: 'fixed',
          right: 0,
          top: 'auto',
          zIndex: 1200,
        }}
      >
        {[
          {
            icon: <HomeRoundedIcon />,
            isActive: location.pathname === routePaths.home,
            label: 'Home',
            to: routePaths.home,
          },
          {
            icon: <FavoriteBorderRoundedIcon />,
            isActive: location.pathname === routePaths.accountFavourites,
            label: 'Favourites',
            requiresAuth: true,
            to: routePaths.accountFavourites,
          },
          {
            icon: <SearchRoundedIcon />,
            isActive:
              location.pathname === routePaths.search ||
              location.pathname.startsWith(routePaths.catalog),
            label: 'Search',
            to: routePaths.search,
          },
          {
            badge: totalItems,
            icon: <ShoppingBagOutlinedIcon />,
            isActive: location.pathname.startsWith(routePaths.cart),
            label: 'Cart',
            to: routePaths.cart,
          },
        ].map((item) => (
          <Box
            aria-label={item.label}
            component={!isAuthenticated && item.requiresAuth ? 'button' : Link}
            key={item.label}
            onClick={
              !isAuthenticated && item.requiresAuth ? () => openAuthDrawer() : undefined
            }
            sx={{
              alignItems: 'center',
              background: 'transparent',
              border: 0,
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              height: 56,
              justifyContent: 'center',
              minWidth: 0,
              p: 0,
              position: 'relative',
              textDecoration: 'none',
              '& svg': {
                fontSize: 35,
              },
              '&::after': {
                backgroundColor: '#ff8c1a',
                bottom: 0,
                content: '""',
                display: item.isActive ? 'block' : 'none',
                height: 2,
                left: 0,
                position: 'absolute',
                right: 0,
              },
            }}
            to={!isAuthenticated && item.requiresAuth ? undefined : item.to}
            type={!isAuthenticated && item.requiresAuth ? 'button' : undefined}
          >
            {item.icon}
            {item.badge ? (
              <Box
                sx={{
                  alignItems: 'center',
                  backgroundColor: '#c33d4b',
                  borderRadius: 999,
                  color: '#ffffff',
                  display: 'flex',
                  fontSize: 12,
                  fontWeight: 800,
                  height: 22,
                  justifyContent: 'center',
                  minWidth: 22,
                  position: 'absolute',
                  right: 'calc(50% - 25px)',
                  top: 2,
                }}
              >
                {item.badge}
              </Box>
            ) : null}
          </Box>
        ))}
        {isTenantAdmin ? (
          <Box
            aria-label="Admin dashboard"
            component={Link}
            sx={{
              alignItems: 'center',
              color: '#ffffff',
              display: 'flex',
              height: 56,
              justifyContent: 'center',
              minWidth: 0,
              position: 'relative',
              textDecoration: 'none',
              '& svg': {
                fontSize: 35,
              },
              '&::after': {
                backgroundColor: '#ff8c1a',
                bottom: 0,
                content: '""',
                display: location.pathname.startsWith(routePaths.tenantAdmin.dashboard)
                  ? 'block'
                  : 'none',
                height: 2,
                left: 0,
                position: 'absolute',
                right: 0,
              },
            }}
            to={routePaths.tenantAdmin.dashboard}
          >
            <DashboardOutlinedIcon />
          </Box>
        ) : (
          <Box
            aria-label={isCustomer ? 'Wallet account' : 'Account login'}
            component={isCustomer ? Link : 'button'}
            onClick={isCustomer ? undefined : () => openAuthDrawer()}
            sx={{
              alignItems: 'center',
              background: 'transparent',
              border: 0,
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              height: 56,
              justifyContent: 'center',
              minWidth: 0,
              p: 0,
              position: 'relative',
              textDecoration: 'none',
              '& svg': {
                fontSize: 35,
              },
              '&::after': {
                backgroundColor: '#ff8c1a',
                bottom: 0,
                content: '""',
                display: isAccountRoute ? 'block' : 'none',
                height: 2,
                left: 0,
                position: 'absolute',
                right: 0,
              },
            }}
            to={isCustomer ? routePaths.accountWallet : undefined}
            type={isCustomer ? undefined : 'button'}
          >
            {isCustomer ? <AccountBalanceWalletOutlinedIcon /> : <PersonOutlineRoundedIcon />}
          </Box>
        )}
      </Box>
    </Box>
  );
};
