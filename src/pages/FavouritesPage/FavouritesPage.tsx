import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import AddShoppingCartOutlinedIcon from '@mui/icons-material/AddShoppingCartOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import LoyaltyOutlinedIcon from '@mui/icons-material/LoyaltyOutlined';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import PlaylistAddOutlinedIcon from '@mui/icons-material/PlaylistAddOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import RecyclingOutlinedIcon from '@mui/icons-material/RecyclingOutlined';
import RestaurantOutlinedIcon from '@mui/icons-material/RestaurantOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import VolunteerActivismOutlinedIcon from '@mui/icons-material/VolunteerActivismOutlined';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, IconButton, MenuItem, Stack, Switch, TextField, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useEffect, useState, type ReactElement } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { storefrontColors } from '@app/providers/theme/tokens';
import type { CustomerAddress, CustomerAddressPayload } from '@entities/address/types/address.types';
import { useAddresses } from '@features/addresses/hooks/useAddresses';
import { authApi } from '@features/auth/api/authApi';
import { useSignOut } from '@features/auth/hooks/useSignOut';
import type { UpdateProfilePayload } from '@features/auth/types/auth.types';
import { useCart } from '@features/cart/hooks/useCart';
import { allStorefrontProducts } from '@features/home/utils/storefrontProducts';
import { mapHomeProductToProduct } from '@features/home/utils/mapHomeProductToProduct';
import { myanmarLocationFallback } from '@features/locations/data/myanmarLocations';
import { useMyanmarLocations } from '@features/locations/hooks/useMyanmarLocations';
import { walletApi } from '@features/wallet/api/walletApi';
import { useWallet } from '@features/wallet/hooks/useWallet';
import { routePaths } from '@routes/routePaths';
import { toApiError } from '@shared/api/apiError';
import { useAppDispatch } from '@store/hooks';
import type { RootState } from '@store/index';
import { updateUser } from '@store/slices/auth.slice';
import { formatCurrency } from '@utils/formatCurrency';

type AccountPageKind = 'commerce' | 'info' | 'profile';

type AccountPageConfig = {
  description: string;
  emptyAction?: string;
  emptyTitle?: string;
  icon: ReactElement;
  kind: AccountPageKind;
  path: string;
  searchPlaceholder?: string;
  title: string;
};

type SidebarSection = {
  items: AccountPageConfig[];
  title: string;
};

const accountPageConfigs = {
  accountStatus: {
    description: 'Track your current membership tier, benefits, and the progress needed for your next reward level.',
    emptyAction: 'View rewards',
    icon: <AutoAwesomeOutlinedIcon />,
    kind: 'info',
    path: routePaths.accountStatus,
    title: 'Account Status',
  },
  addresses: {
    description: 'Manage delivery addresses, saved locations, labels, and default address preferences.',
    emptyAction: 'Add address',
    icon: <LocationOnOutlinedIcon />,
    kind: 'profile',
    path: routePaths.accountAddresses,
    title: 'My Addresses',
  },
  awards: {
    description: "Browse awards and recognitions from AV's Store product, service, and sustainability milestones.",
    emptyAction: 'View awards',
    icon: <EmojiEventsOutlinedIcon />,
    kind: 'info',
    path: routePaths.accountAwards,
    title: 'Awards',
  },
  brand: {
    description: "Learn about the AV's Store brand promise, fresh sourcing standards, and customer commitments.",
    emptyAction: 'Explore brand',
    icon: <SpaOutlinedIcon />,
    kind: 'info',
    path: routePaths.accountBrand,
    title: 'Our Brand',
  },
  cares: {
    description: 'See community initiatives, customer care commitments, and support programmes.',
    emptyAction: 'Explore care',
    icon: <FavoriteBorderRoundedIcon />,
    kind: 'info',
    path: routePaths.accountCares,
    title: "AV's Store Cares",
  },
  changePassword: {
    description: 'Update your account password and keep your customer profile secure.',
    emptyAction: 'Update password',
    icon: <LockOutlinedIcon />,
    kind: 'profile',
    path: routePaths.accountChangePassword,
    title: 'Change Password',
  },
  collectionService: {
    description: 'Review collection requests, recycling returns, and scheduled customer service pickups.',
    emptyAction: 'Book collection',
    icon: <RecyclingOutlinedIcon />,
    kind: 'commerce',
    path: routePaths.accountCollectionService,
    searchPlaceholder: 'Search collection requests',
    title: 'Collection Service',
  },
  deleteAccount: {
    description: 'Review account closure options and data removal requests before deleting your account.',
    emptyAction: 'Request deletion',
    icon: <DeleteOutlineRoundedIcon />,
    kind: 'profile',
    path: routePaths.accountDeleteAccount,
    title: 'Delete Account',
  },
  deliveryMembership: {
    description: 'Manage delivery membership benefits, renewal dates, and eligible delivery savings.',
    emptyAction: 'Manage membership',
    icon: <AccountBalanceWalletOutlinedIcon />,
    kind: 'info',
    path: routePaths.accountDeliveryMembership,
    title: 'Delivery Membership',
  },
  favourites: {
    description: 'Save products you buy often and add them to your cart faster next time.',
    emptyAction: 'Add items',
    emptyTitle: 'Start adding items to your list',
    icon: <FavoriteBorderRoundedIcon />,
    kind: 'commerce',
    path: routePaths.accountFavourites,
    searchPlaceholder: 'Search from favourites',
    title: 'My Favourites',
  },
  kitchen: {
    description: "Discover recipes, prepared food inspiration, and kitchen ideas from AV's Store.",
    emptyAction: 'Open kitchen',
    icon: <RestaurantOutlinedIcon />,
    kind: 'info',
    path: routePaths.accountKitchen,
    title: "AV's Store Kitchen",
  },
  media: {
    description: "Browse news, media stories, and recent AV's Store announcements.",
    emptyAction: 'View media',
    icon: <LocalOfferOutlinedIcon />,
    kind: 'info',
    path: routePaths.accountMedia,
    title: 'Media',
  },
  orders: {
    description: 'View current orders, delivery progress, previous purchases, and order support actions.',
    emptyAction: 'Start shopping',
    icon: <Inventory2OutlinedIcon />,
    kind: 'commerce',
    path: routePaths.accountOrders,
    searchPlaceholder: 'Search orders',
    title: 'My Orders',
  },
  profile: {
    description: 'Update your name, email, phone number, and communication preferences.',
    emptyAction: 'Edit profile',
    icon: <PersonOutlineRoundedIcon />,
    kind: 'profile',
    path: routePaths.account,
    title: 'My Profile',
  },
  quality: {
    description: "Understand the quality checks, freshness controls, and delivery standards used by AV's Store.",
    emptyAction: 'Read standards',
    icon: <VolunteerActivismOutlinedIcon />,
    kind: 'info',
    path: routePaths.accountQuality,
    title: 'Quality',
  },
  referFriends: {
    description: 'Invite friends, track referrals, and review earned customer rewards.',
    emptyAction: 'Invite friends',
    icon: <VolunteerActivismOutlinedIcon />,
    kind: 'info',
    path: routePaths.accountReferFriends,
    title: 'Refer Friends',
  },
  regulars: {
    description: 'Manage regular purchases and repeat items for faster weekly shopping.',
    emptyAction: 'Add regular items',
    icon: <CalendarMonthOutlinedIcon />,
    kind: 'commerce',
    path: routePaths.accountRegulars,
    searchPlaceholder: 'Search regulars',
    title: 'My Regulars',
  },
  rewardPoints: {
    description: 'Review points earned from orders, referrals, and promotions.',
    emptyAction: 'View rewards',
    icon: <LoyaltyOutlinedIcon />,
    kind: 'info',
    path: routePaths.accountRewardPoints,
    title: 'Reward Points',
  },
  shoppingList: {
    description: 'Create lists for weekly shops, family favourites, and planned orders.',
    emptyAction: 'Add items',
    emptyTitle: 'Start adding items to your list',
    icon: <PlaylistAddOutlinedIcon />,
    kind: 'commerce',
    path: routePaths.accountShoppingList,
    searchPlaceholder: 'Search items in my lists',
    title: 'My Shopping List',
  },
  statement: {
    description: 'Review wallet movements, refunds, account credits, and statement history.',
    emptyAction: 'Download statement',
    icon: <ReceiptLongOutlinedIcon />,
    kind: 'commerce',
    path: routePaths.accountStatement,
    searchPlaceholder: 'Search statement',
    title: 'My Statement',
  },
  story: {
    description: "Read the AV's Store story and the journey behind the grocery service.",
    emptyAction: 'Read story',
    icon: <ReceiptLongOutlinedIcon />,
    kind: 'info',
    path: routePaths.accountStory,
    title: 'Our Story',
  },
  vision: {
    description: 'Explore the company vision for freshness, savings, service, and sustainable grocery shopping.',
    emptyAction: 'Read vision',
    icon: <LightbulbOutlinedIcon />,
    kind: 'info',
    path: routePaths.accountVision,
    title: 'Our Vision',
  },
  vouchers: {
    description: 'Find saved vouchers, promo codes, and special savings available for your account.',
    emptyAction: 'Browse offers',
    icon: <LocalOfferOutlinedIcon />,
    kind: 'commerce',
    path: routePaths.accountVouchers,
    searchPlaceholder: 'Search vouchers',
    title: 'My Vouchers',
  },
  wallet: {
    description: 'Manage wallet balance, saved credits, refunds, and payment benefits.',
    emptyAction: 'Add credit',
    icon: <AccountBalanceWalletOutlinedIcon />,
    kind: 'commerce',
    path: routePaths.accountWallet,
    searchPlaceholder: 'Search wallet activity',
    title: 'My Wallet',
  },
  wioBank: {
    description: 'View partner bank offers, card benefits, and customer savings.',
    emptyAction: 'View offer',
    icon: <CardGiftcardOutlinedIcon />,
    kind: 'info',
    path: routePaths.accountWioBank,
    title: 'Wio Bank',
  },
} satisfies Record<string, AccountPageConfig>;

const sidebarSections: SidebarSection[] = [
  {
    title: 'My Baskets',
    items: [accountPageConfigs.favourites, accountPageConfigs.shoppingList],
  },
  {
    title: 'Order Info',
    items: [accountPageConfigs.wallet, accountPageConfigs.orders],
  },
  {
    title: 'User Profile',
    items: [
      accountPageConfigs.addresses,
      accountPageConfigs.profile,
      accountPageConfigs.changePassword,
      accountPageConfigs.deleteAccount,
    ],
  },
];

const pageConfigs = Object.values(accountPageConfigs);

const getActivePage = (pathname: string) =>
  pageConfigs.find((page) => page.path === pathname) ?? accountPageConfigs.favourites;

const formatWalletAmount = (amount: number) => formatCurrency(amount);

const AccountSidebar = ({ activePath }: { activePath: string }) => (
  <Box
    component="aside"
    sx={{
      backgroundColor: '#ffffff',
      border: `1px solid ${storefrontColors.border}`,
      borderRadius: 1,
      display: { md: 'block', xs: 'flex' },
      flex: { lg: '0 0 300px', md: '0 0 270px', xs: 'none' },
      gap: { xs: 1 },
      overflow: 'hidden',
      overflowX: { md: 'hidden', xs: 'auto' },
      p: { md: 0, xs: 1 },
      width: { md: 'auto', xs: '100%' },
      '&::-webkit-scrollbar': {
        display: 'none',
      },
    }}
  >
    {sidebarSections.map((section) => (
      <Box key={section.title} sx={{ display: { md: 'block', xs: 'contents' } }}>
        <Box sx={{ backgroundColor: '#f2f3f8', display: { md: 'block', xs: 'none' }, px: 2.2, py: 1.7 }}>
          <Typography sx={{ color: storefrontColors.navy, fontSize: '1.05rem', fontWeight: 900, lineHeight: 1.15 }}>
            {section.title}
          </Typography>
        </Box>
        <Stack direction={{ md: 'column', xs: 'row' }} spacing={0.75}>
          {section.items.map((item) => {
            const isActive = item.path === activePath;

            return (
              <Box
                component={Link}
                key={item.path}
                to={item.path}
                sx={{
                  alignItems: 'center',
                  backgroundColor: isActive ? '#f5f5f9' : '#ffffff',
                  border: { md: 0, xs: `1px solid ${isActive ? storefrontColors.navy : storefrontColors.border}` },
                  borderRadius: { md: 0, xs: 999 },
                  color: isActive ? storefrontColors.navy : '#54565c',
                  display: 'flex',
                  flex: { md: 'initial', xs: '0 0 auto' },
                  gap: 1.7,
                  minHeight: { md: 64, xs: 44 },
                  px: { md: 2.5, xs: 1.5 },
                  py: { md: 1.4, xs: 0.9 },
                  transition: 'background-color 160ms ease, color 160ms ease',
                  '&:hover': {
                    backgroundColor: '#f7f8fb',
                    color: storefrontColors.navy,
                  },
                }}
              >
                <Box sx={{ color: storefrontColors.accent, display: 'inline-flex', '& svg': { fontSize: { md: 27, xs: 20 } } }}>
                  {item.icon}
                </Box>
                <Typography
                  sx={{
                    fontSize: { md: '1.03rem', xs: '0.88rem' },
                    fontWeight: isActive ? 800 : 700,
                    lineHeight: 1.15,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.title}
                </Typography>
              </Box>
            );
          })}
        </Stack>
      </Box>
    ))}
  </Box>
);

const ProfileSummary = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const fallbackWallet = useWallet(user);
  const walletSummaryQuery = useQuery({
    enabled: Boolean(user),
    queryFn: ({ signal }) => walletApi.getSummary({ signal }),
    queryKey: ['wallet', 'summary', user?.id],
    staleTime: 30_000,
  });
  const serverWallet = walletSummaryQuery.data?.wallet;
  const availableBalance = serverWallet
    ? Math.max(0, serverWallet.balance - serverWallet.reservedBalance)
    : fallbackWallet.availableBalance;
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Min Naing Min Naing';
  const email = user?.email ?? 'minnaingjokermm@gmail.com';

  const stats = [
    { icon: <Inventory2OutlinedIcon />, label: 'My Orders', value: '' },
    { label: 'Wallet', value: formatWalletAmount(availableBalance) },
  ];

  return (
    <Box
      sx={{
        border: `1px solid ${storefrontColors.border}`,
        borderRadius: 1,
        display: 'grid',
        gap: { md: 3, xs: 2 },
        gridTemplateColumns: { lg: '1.05fr 1fr', xs: '1fr' },
        p: { md: 2.2, xs: 1.5 },
      }}
    >
      <Box
        sx={{
          alignItems: 'center',
          backgroundColor: storefrontColors.navy,
          borderRadius: 1,
          color: '#ffffff',
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { sm: '82px minmax(0, 1fr) 36px', xs: '62px minmax(0, 1fr)' },
          minHeight: 138,
          px: { md: 3, xs: 2 },
          py: 2,
        }}
      >
        <Box
          sx={{
            alignItems: 'center',
            border: `3px solid ${alpha('#ffffff', 0.34)}`,
            borderRadius: '50%',
            display: 'flex',
            height: { sm: 72, xs: 56 },
            justifyContent: 'center',
            width: { sm: 72, xs: 56 },
          }}
        >
          <EmojiEventsOutlinedIcon sx={{ color: '#dbe5fa', fontSize: { sm: 46, xs: 34 } }} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: { md: '1.15rem', xs: '1rem' }, fontWeight: 900, lineHeight: 1.15 }}>
            {fullName}
          </Typography>
          <Typography
            sx={{
              fontSize: { md: '0.95rem', xs: '0.86rem' },
              fontWeight: 800,
              mt: 0.45,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {email}
          </Typography>
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, mt: 0.7 }}>
            Spend 5000 more to become Silver member
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          alignItems: 'center',
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { sm: 'repeat(2, minmax(120px, 1fr))', xs: 'repeat(2, minmax(96px, 1fr))' },
        }}
      >
        {stats.map((stat) => (
          <Stack key={stat.label} spacing={1} sx={{ alignItems: 'center', color: storefrontColors.navy, textAlign: 'center' }}>
            <Box
              sx={{
                alignItems: 'center',
                backgroundColor: '#f0f0f6',
                borderRadius: '50%',
                color: storefrontColors.navy,
                display: 'flex',
                height: { md: 118, xs: 94 },
                justifyContent: 'center',
                width: { md: 118, xs: 94 },
              }}
            >
              {stat.icon ? (
                <Box sx={{ display: 'inline-flex', '& svg': { fontSize: 31 } }}>{stat.icon}</Box>
              ) : (
                <Typography sx={{ color: '#e43224', fontSize: { md: '1rem', xs: '0.82rem' }, fontWeight: 900 }}>
                  {stat.value}
                </Typography>
              )}
            </Box>
            <Typography sx={{ fontSize: '0.95rem', fontWeight: 800 }}>
              {stat.label}
            </Typography>
          </Stack>
        ))}
      </Box>
    </Box>
  );
};

const EmptyListIllustration = ({ type = 'favourites' }: { type?: 'favourites' | 'lists' }) => (
  <Box sx={{ height: 170, position: 'relative', width: 220 }}>
    {type === 'lists' ? (
      <PlaylistAddOutlinedIcon
        sx={{
          color: storefrontColors.navy,
          fontSize: 58,
          left: '50%',
          position: 'absolute',
          top: 0,
          transform: 'translateX(-50%)',
        }}
      />
    ) : (
      <FavoriteBorderRoundedIcon
        sx={{
          color: storefrontColors.navy,
          fontSize: 58,
          left: '50%',
          position: 'absolute',
          top: 0,
          transform: 'translateX(-50%)',
        }}
      />
    )}
    <Box
      sx={{
        backgroundColor: '#eef1f8',
        borderRadius: '0 0 22px 22px',
        bottom: 0,
        height: 104,
        left: 47,
        position: 'absolute',
        width: 126,
      }}
    >
      <Box sx={{ backgroundColor: '#b5bfdc', borderRadius: 1, height: 20, left: -16, position: 'absolute', top: 0, width: 158 }} />
      <Box sx={{ backgroundColor: '#ffffff', borderRadius: 999, height: 86, left: 35, position: 'absolute', top: 18, width: 13 }} />
      <Box sx={{ backgroundColor: '#ffffff', borderRadius: 999, height: 86, left: 77, position: 'absolute', top: 18, width: 13 }} />
      <Box
        sx={{
          backgroundColor: storefrontColors.navy,
          borderRadius: 999,
          height: 86,
          left: 11,
          position: 'absolute',
          top: 6,
          transform: 'rotate(34deg)',
          width: 12,
        }}
      />
      <Box
        sx={{
          backgroundColor: storefrontColors.navy,
          borderRadius: 999,
          height: 86,
          position: 'absolute',
          right: 11,
          top: 6,
          transform: 'rotate(-34deg)',
          width: 12,
        }}
      />
    </Box>
    <Box sx={{ backgroundColor: '#d9deee', bottom: 0, height: 1, left: 0, position: 'absolute', width: '100%' }} />
  </Box>
);

const SearchBar = ({ placeholder }: { placeholder: string }) => (
  <Stack direction="row" sx={{ borderRadius: 1, mt: 3, overflow: 'hidden' }}>
    <Box
      sx={{
        alignItems: 'center',
        backgroundColor: '#f2f3f8',
        color: '#a1a9bb',
        display: 'flex',
        flex: 1,
        fontSize: '1.05rem',
        fontWeight: 800,
        minHeight: 64,
        px: 2,
      }}
    >
      {placeholder}
    </Box>
    <IconButton
      aria-label={placeholder}
      sx={{
        backgroundColor: storefrontColors.navy,
        borderRadius: 0,
        color: '#ffffff',
        width: { sm: 108, xs: 72 },
        '&:hover': { backgroundColor: storefrontColors.navyDark },
      }}
    >
      <SearchRoundedIcon />
    </IconButton>
  </Stack>
);

const favouriteProducts = allStorefrontProducts.slice(0, 3);

const FavouriteProducts = () => {
  const { addToCart } = useCart();

  return (
    <Box sx={{ mt: 3 }}>
      <Box
        sx={{
          display: 'grid',
          gap: 2.2,
          gridTemplateColumns: { lg: 'repeat(3, minmax(0, 1fr))', sm: 'repeat(2, minmax(0, 1fr))', xs: '1fr' },
        }}
      >
        {favouriteProducts.map((product) => (
          <Box
            key={product.id}
            sx={{
              backgroundColor: '#ffffff',
              border: `1px solid ${storefrontColors.border}`,
              borderRadius: 1,
              boxShadow: `0 14px 30px ${alpha(storefrontColors.navyDark, 0.08)}`,
              display: 'grid',
              gridTemplateRows: '180px 1fr',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ position: 'relative' }}>
              <Box
                alt={product.name}
                component="img"
                src={product.imageUrl}
                sx={{ display: 'block', height: '100%', objectFit: 'cover', width: '100%' }}
              />
              <IconButton
                aria-label={`${product.name} is in favourites`}
                sx={{
                  backgroundColor: '#ffffff',
                  boxShadow: `0 8px 20px ${alpha(storefrontColors.navyDark, 0.16)}`,
                  color: storefrontColors.navy,
                  position: 'absolute',
                  right: 12,
                  top: 12,
                  '&:hover': { backgroundColor: '#fff7f7' },
                }}
              >
                <FavoriteRoundedIcon />
              </IconButton>
            </Box>
            <Stack spacing={1.5} sx={{ p: 2 }}>
              <Box sx={{ minHeight: 74 }}>
                <Typography sx={{ color: '#2b2d33', fontSize: '1.05rem', fontWeight: 900 }}>
                  {product.name}
                </Typography>
                <Typography sx={{ color: storefrontColors.muted, fontSize: '0.9rem', fontWeight: 700, mt: 0.6 }}>
                  {product.description}
                </Typography>
              </Box>
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography sx={{ color: storefrontColors.navy, fontSize: '1.1rem', fontWeight: 900 }}>
                  {formatCurrency(product.price, product.currency)}
                </Typography>
                <Button
                  onClick={() => addToCart(mapHomeProductToProduct(product))}
                  startIcon={<AddShoppingCartOutlinedIcon />}
                  sx={{
                    backgroundColor: storefrontColors.navy,
                    borderRadius: 999,
                    color: '#ffffff',
                    fontWeight: 900,
                    px: 2,
                    textTransform: 'none',
                    '&:hover': { backgroundColor: storefrontColors.navyDark },
                  }}
                >
                  Add to Cart
                </Button>
              </Stack>
            </Stack>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

const CommerceContent = ({ activePage }: { activePage: AccountPageConfig }) => {
  const showTabs = activePage.path === routePaths.accountFavourites || activePage.path === routePaths.accountShoppingList;
  const isShoppingList = activePage.path === routePaths.accountShoppingList;
  const isFavourites = activePage.path === routePaths.accountFavourites;

  return (
    <Box sx={{ maxWidth: 1180, mt: 4.8 }}>
      {showTabs ? (
        <Stack direction="row" spacing={6} sx={{ borderBottom: `1px solid ${storefrontColors.border}` }}>
          {[accountPageConfigs.favourites, accountPageConfigs.shoppingList].map((page) => {
            const isActive = page.path === activePage.path;

            return (
              <Box
                component={Link}
                key={page.path}
                sx={{
                  borderBottom: isActive ? `3px solid ${storefrontColors.navy}` : '3px solid transparent',
                  px: 2,
                  py: 1.3,
                }}
                to={page.path}
              >
                <Typography sx={{ color: storefrontColors.navy, fontSize: '1.25rem', fontWeight: isActive ? 900 : 800 }}>
                  {page.title}
                </Typography>
              </Box>
            );
          })}
        </Stack>
      ) : (
        <Typography sx={{ color: storefrontColors.navy, fontSize: '1.45rem', fontWeight: 900 }}>{activePage.title}</Typography>
      )}

      {isShoppingList ? (
        <Button
          sx={{
            backgroundColor: storefrontColors.navy,
            borderRadius: 999,
            color: '#ffffff',
            fontWeight: 900,
            mt: 3,
            px: 3,
            py: 1,
            textTransform: 'none',
            '&:hover': { backgroundColor: storefrontColors.navyDark },
          }}
        >
          Create new list
        </Button>
      ) : null}

      <SearchBar placeholder={activePage.searchPlaceholder ?? `Search ${activePage.title.toLowerCase()}`} />

      {isFavourites ? (
        <FavouriteProducts />
      ) : (
        <Stack spacing={2.6} sx={{ alignItems: 'center', minHeight: 430, pt: { md: 5, xs: 4 }, textAlign: 'center' }}>
          <EmptyListIllustration type={isShoppingList ? 'lists' : 'favourites'} />
          <Typography sx={{ color: storefrontColors.navy, fontSize: { md: '1.45rem', xs: '1.2rem' }, fontWeight: 900 }}>
            {activePage.emptyTitle ?? `No ${activePage.title.toLowerCase()} yet`}
          </Typography>
          <Typography sx={{ color: storefrontColors.muted, maxWidth: 520 }}>{activePage.description}</Typography>
          <Button
            component={Link}
            to={routePaths.catalog}
            sx={{
              backgroundColor: storefrontColors.navy,
              borderRadius: 999,
              color: '#ffffff',
              fontSize: '1.15rem',
              fontWeight: 800,
              minHeight: 58,
              px: 5.5,
              textTransform: 'none',
              width: { sm: 280, xs: '100%' },
              '&:hover': { backgroundColor: storefrontColors.navyDark },
            }}
          >
            {activePage.emptyAction}
          </Button>
        </Stack>
      )}
    </Box>
  );
};

const VoucherIllustration = () => (
  <Box sx={{ height: 190, position: 'relative', width: 250 }}>
    <Box
      sx={{
        backgroundColor: '#b8c1da',
        bottom: 28,
        height: 92,
        left: 54,
        position: 'absolute',
        width: 142,
      }}
    />
    <Box
      sx={{
        borderBottom: '46px solid #aeb8d3',
        borderLeft: '71px solid transparent',
        borderRight: '71px solid transparent',
        bottom: 28,
        height: 0,
        left: 54,
        position: 'absolute',
        width: 0,
      }}
    />
    <Box
      sx={{
        borderBottom: '58px solid #c6cde0',
        borderLeft: '71px solid transparent',
        borderRight: '71px solid transparent',
        bottom: 62,
        height: 0,
        left: 54,
        position: 'absolute',
        transform: 'rotate(180deg)',
        width: 0,
      }}
    />
    <Box
      sx={{
        backgroundColor: '#ffffff',
        border: `3px solid ${storefrontColors.navy}`,
        borderRadius: 1,
        height: 96,
        left: 104,
        position: 'absolute',
        top: 10,
        transform: 'rotate(22deg)',
        width: 78,
      }}
    >
      <CardGiftcardOutlinedIcon sx={{ color: storefrontColors.navy, fontSize: 38, left: 17, position: 'absolute', top: 28 }} />
      <Box sx={{ borderTop: `3px dashed ${storefrontColors.navy}`, bottom: 20, left: 10, position: 'absolute', width: 50 }} />
    </Box>
    <Box
      sx={{
        alignItems: 'center',
        backgroundColor: '#f4f6fb',
        border: `2px solid ${alpha(storefrontColors.navy, 0.35)}`,
        borderRadius: '50%',
        bottom: 18,
        color: storefrontColors.navy,
        display: 'flex',
        fontSize: '1.45rem',
        fontWeight: 900,
        height: 52,
        justifyContent: 'center',
        position: 'absolute',
        right: 34,
        width: 52,
      }}
    >
      ~
    </Box>
    <Box sx={{ backgroundColor: '#d9deee', bottom: 18, height: 1, left: 10, position: 'absolute', width: 230 }} />
  </Box>
);

const VouchersContent = () => (
  <Box sx={{ mt: 4.5 }}>
    <Box
      sx={{
        backgroundColor: storefrontColors.navy,
        borderRadius: '3px 3px 0 0',
        color: '#ffffff',
        px: 2.2,
        py: 1.55,
      }}
    >
      <Typography sx={{ fontSize: '1.25rem', fontWeight: 900 }}>Vouchers</Typography>
    </Box>
    <Stack spacing={2} sx={{ alignItems: 'center', minHeight: 390, pt: 8, textAlign: 'center' }}>
      <VoucherIllustration />
      <Typography sx={{ color: storefrontColors.navy, fontSize: '1.25rem', fontWeight: 900 }}>No Vouchers Found</Typography>
    </Stack>
  </Box>
);

const WalletAmountInput = ({
  action,
  amount,
  disabled,
  onAction,
  onAmountChange,
  placeholder = '100',
}: {
  action: string;
  amount: string;
  disabled?: boolean;
  onAction: () => void;
  onAmountChange: (value: string) => void;
  placeholder?: string;
}) => (
  <Stack
    direction={{ sm: 'row', xs: 'column' }}
    sx={{
      border: `1px solid ${storefrontColors.border}`,
      borderRadius: 1,
      minHeight: 64,
      overflow: 'hidden',
    }}
  >
    <TextField
      fullWidth
      onChange={(event) => onAmountChange(event.target.value)}
      placeholder={placeholder}
      slotProps={{
        htmlInput: { min: 100, step: 100 },
        input: {
          disableUnderline: true,
          endAdornment: <Typography sx={{ color: '#55565c', fontSize: '1.15rem', fontWeight: 900, ml: 1.4 }}>MMK</Typography>,
          sx: {
            color: '#55565c',
            fontSize: '1.1rem',
            fontWeight: 800,
            minHeight: 64,
            px: 2,
          },
        },
      }}
      type="number"
      value={amount}
      variant="standard"
    />
    <Button
      disabled={disabled}
      onClick={onAction}
      sx={{
        backgroundColor: '#f1f2f7',
        borderLeft: { sm: `1px solid ${storefrontColors.border}`, xs: 0 },
        borderTop: { sm: 0, xs: `1px solid ${storefrontColors.border}` },
        borderRadius: 0,
        color: storefrontColors.navy,
        fontSize: '1rem',
        fontWeight: 900,
        minHeight: { sm: 'auto', xs: 52 },
        px: { md: 5, xs: 2 },
        textTransform: 'none',
        '&:hover': { backgroundColor: '#e8ebf3' },
      }}
    >
      {action}
    </Button>
  </Stack>
);

const WalletPanel = ({ children, title }: { children: ReactElement; title: string }) => (
  <Box sx={{ border: `1px solid ${storefrontColors.border}`, borderRadius: 1, overflow: 'hidden' }}>
    <Box sx={{ backgroundColor: '#f3f4f9', px: 2.2, py: 1.35 }}>
      <Typography sx={{ color: storefrontColors.navy, fontSize: '1.25rem', fontWeight: 900 }}>{title}</Typography>
    </Box>
    <Box sx={{ backgroundColor: '#ffffff', p: { md: 2.2, xs: 1.5 } }}>{children}</Box>
  </Box>
);

const WalletAccordionRow = ({ title }: { title: string }) => (
  <Stack
    direction="row"
    sx={{
      border: `1px solid ${storefrontColors.border}`,
      borderRadius: 1,
      minHeight: 66,
      overflow: 'hidden',
    }}
  >
    <Box sx={{ alignItems: 'center', display: 'flex', flex: 1, px: 2.2 }}>
      <Typography sx={{ color: storefrontColors.navy, fontSize: '1.1rem', fontWeight: 900 }}>{title}</Typography>
    </Box>
    <Box
      sx={{
        alignItems: 'center',
        backgroundColor: '#f1f2f7',
        borderLeft: `1px solid ${storefrontColors.border}`,
        color: storefrontColors.navy,
        display: 'flex',
        justifyContent: 'center',
        width: { md: 290, xs: 86 },
      }}
    >
      <PlayArrowRoundedIcon sx={{ fontSize: 34 }} />
    </Box>
  </Stack>
);

const WalletContent = () => {
  const queryClient = useQueryClient();
  const user = useSelector((state: RootState) => state.auth.user);
  const { wallet } = useWallet(user);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('KBZPay');
  const [promoCode, setPromoCode] = useState('');
  const [receipt, setReceipt] = useState<File | null>(null);

  const walletSummaryQuery = useQuery({
    queryFn: ({ signal }) => walletApi.getSummary({ signal }),
    queryKey: ['wallet', 'summary'],
  });
  const submitTopUpMutation = useMutation({
    mutationFn: walletApi.submitTopUp,
    onError: (error) => toast.error(toApiError(error).message),
    onSuccess: async (result) => {
      toast.success(result.message);
      setTopUpAmount('');
      setPromoCode('');
      setReceipt(null);
      await queryClient.invalidateQueries({ queryKey: ['wallet', 'summary'] });
    },
  });

  const serverWallet = walletSummaryQuery.data?.wallet;
  const transferDetails = walletSummaryQuery.data?.paymentTransferDetails;
  const walletBalance = serverWallet?.balance ?? wallet.balance;
  const reservedBalance = serverWallet?.reservedBalance ?? wallet.reservedBalance;
  const availableBalance = Math.max(0, walletBalance - reservedBalance);
  const topUpValue = Number(topUpAmount);
  const recentTopUps = walletSummaryQuery.data?.recentTopUps ?? [];
  const pendingTopUps = recentTopUps.filter((request) => request.status === 'pending');
  const transactions = serverWallet?.transactions ?? wallet.transactions;

  const submitTopUpRequest = () => {
    if (!receipt) {
      toast.error('Upload your payment receipt image.');
      return;
    }

    if (!Number.isFinite(topUpValue) || topUpValue < 100) {
      toast.error('Top-up amount must be at least 100 MMK.');
      return;
    }

    void submitTopUpMutation.mutateAsync({
      amount: topUpValue,
      paymentMethod,
      promoCode: promoCode.trim() || undefined,
      receipt,
    });
  };

  return (
    <Stack spacing={3} sx={{ maxWidth: 980, mt: 4.5 }}>
      <Box
        sx={{
          backgroundColor: storefrontColors.navy,
          borderRadius: '3px 3px 0 0',
          color: '#ffffff',
          px: 2.2,
          py: 1.55,
        }}
      >
        <Typography sx={{ fontSize: '1.25rem', fontWeight: 900 }}>My Wallet</Typography>
      </Box>

      <Box sx={{ border: `1px solid ${storefrontColors.navy}`, borderRadius: 0.5, overflow: 'hidden' }}>
        <Stack
          spacing={0.6}
          sx={{
            alignItems: 'center',
            background: 'linear-gradient(120deg, #e43224 0%, #ffd326 100%)',
            color: '#ffffff',
            justifyContent: 'center',
            minHeight: 108,
          }}
        >
          <Typography sx={{ fontSize: '1.35rem', fontWeight: 900 }}>{formatWalletAmount(walletBalance)}</Typography>
          <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center' }}>
            <AccountBalanceWalletOutlinedIcon />
            <Typography sx={{ fontSize: '1.05rem', fontWeight: 900 }}>My Wallet</Typography>
          </Stack>
        </Stack>
        <Box sx={{ display: 'grid', gridTemplateColumns: { sm: '1fr 1fr', xs: '1fr' } }}>
          <Stack spacing={0.6} sx={{ alignItems: 'center', borderRight: { sm: `1px solid ${storefrontColors.navy}`, xs: 0 }, py: 2.2 }}>
            <Typography sx={{ color: '#55565c', fontSize: '1.05rem', fontWeight: 700 }}>Reserved For Regular:</Typography>
            <Typography sx={{ color: '#55565c', fontWeight: 800 }}>{formatWalletAmount(reservedBalance)}</Typography>
          </Stack>
          <Stack spacing={0.6} sx={{ alignItems: 'center', py: 2.2 }}>
            <Typography sx={{ color: storefrontColors.navy, fontSize: '1.05rem', fontWeight: 900 }}>Available Balance:</Typography>
            <Typography sx={{ color: storefrontColors.navy, fontWeight: 900 }}>{formatWalletAmount(availableBalance)}</Typography>
          </Stack>
        </Box>
      </Box>

      {pendingTopUps.length ? (
        <Box sx={{ backgroundColor: '#fff8e1', border: `1px solid ${storefrontColors.border}`, borderRadius: 1, px: 2, py: 1.3 }}>
          <Typography sx={{ color: storefrontColors.navy, fontWeight: 900 }}>Wallet top-up under review</Typography>
          <Typography sx={{ color: '#55565c', fontWeight: 700, mt: 0.4 }}>
            {pendingTopUps.length} request{pendingTopUps.length > 1 ? 's are' : ' is'} waiting for admin review. Your wallet will be topped up manually within 24 hours after receipt confirmation.
          </Typography>
        </Box>
      ) : null}

      <WalletPanel title="Request Wallet Top-up">
        <Stack spacing={2.2}>
          <Box sx={{ backgroundColor: '#f6f8fc', border: `1px solid ${storefrontColors.border}`, borderRadius: 1, p: 2 }}>
            <Typography sx={{ color: storefrontColors.navy, fontWeight: 900 }}>Transfer payment first</Typography>
            <Box sx={{ display: 'grid', gap: 1.2, gridTemplateColumns: { sm: 'repeat(2, minmax(0, 1fr))', xs: '1fr' }, mt: 1.4 }}>
              <Typography sx={{ color: '#55565c', fontWeight: 700 }}>Account name: {transferDetails?.accountName ?? "AV's Store"}</Typography>
              <Typography sx={{ color: '#55565c', fontWeight: 700 }}>Account number: {transferDetails?.accountNumber ?? '+95 8877594332'}</Typography>
              <Typography sx={{ color: '#55565c', fontWeight: 700 }}>Payment methods: {transferDetails?.provider ?? 'Myanmar mobile wallet / bank transfer'}</Typography>
              <Typography sx={{ color: '#55565c', fontWeight: 700 }}>Review time: within 24 hours</Typography>
            </Box>
            <Typography sx={{ color: storefrontColors.muted, fontWeight: 700, mt: 1.4 }}>
              {transferDetails?.instructions ?? 'Transfer by KBZPay, WavePay, AYA Pay, CB Pay, bank transfer, or any Myanmar payment method. Upload the payment receipt after transfer.'}
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { sm: 'repeat(2, minmax(0, 1fr))', xs: '1fr' } }}>
            <TextField label="Transferred amount" onChange={(event) => setTopUpAmount(event.target.value)} required type="number" value={topUpAmount} />
            <TextField label="Payment method" onChange={(event) => setPaymentMethod(event.target.value)} select value={paymentMethod}>
              <MenuItem value="KBZPay">KBZPay</MenuItem>
              <MenuItem value="WavePay">WavePay</MenuItem>
              <MenuItem value="AYA Pay">AYA Pay</MenuItem>
              <MenuItem value="CB Pay">CB Pay</MenuItem>
              <MenuItem value="Bank transfer">Bank transfer</MenuItem>
              <MenuItem value="Other Myanmar payment">Other Myanmar payment</MenuItem>
            </TextField>
            <TextField label="Promo code" onChange={(event) => setPromoCode(event.target.value)} value={promoCode} />
            <Button component="label" sx={{ alignItems: 'center', border: `1px dashed ${storefrontColors.border}`, color: storefrontColors.navy, display: 'flex', fontWeight: 900, minHeight: 56, textTransform: 'none' }}>
              {receipt ? receipt.name : 'Upload receipt image'}
              <input accept="image/*" hidden onChange={(event) => setReceipt(event.target.files?.[0] ?? null)} type="file" />
            </Button>
          </Box>

          <Button disabled={submitTopUpMutation.isPending || !receipt || topUpValue < 100} onClick={submitTopUpRequest} sx={{ alignSelf: 'flex-start', backgroundColor: storefrontColors.navy, borderRadius: 999, color: '#ffffff', fontWeight: 900, px: 4, py: 1.15, textTransform: 'none', '&:hover': { backgroundColor: storefrontColors.navyDark }, '&.Mui-disabled': { backgroundColor: '#c9cdd6', color: '#ffffff' } }}>
            {submitTopUpMutation.isPending ? 'Submitting...' : 'Submit top-up request'}
          </Button>
        </Stack>
      </WalletPanel>

      <WalletPanel title="Top-up Requests">
        {recentTopUps.length ? (
          <Stack spacing={1.2}>
            {recentTopUps.map((request) => (
              <Stack direction={{ sm: 'row', xs: 'column' }} key={request.id} spacing={1} sx={{ border: `1px solid ${storefrontColors.border}`, borderRadius: 1, justifyContent: 'space-between', px: 1.5, py: 1.2 }}>
                <Box>
                  <Typography sx={{ color: storefrontColors.navy, fontWeight: 900 }}>{formatWalletAmount(request.amount)} via {request.paymentMethod ?? 'payment transfer'}</Typography>
                  <Typography sx={{ color: storefrontColors.muted, fontSize: '0.85rem', fontWeight: 700 }}>{new Date(request.createdAt).toLocaleString()}</Typography>
                  {request.adminNote ? <Typography sx={{ color: storefrontColors.muted, mt: 0.4 }}>{request.adminNote}</Typography> : null}
                </Box>
                <Chip color={request.status === 'approved' ? 'success' : request.status === 'rejected' ? 'error' : 'warning'} label={request.status} />
              </Stack>
            ))}
          </Stack>
        ) : (
          <Typography sx={{ color: storefrontColors.muted, fontWeight: 700 }}>No top-up requests yet.</Typography>
        )}
      </WalletPanel>

      <WalletPanel title="Mini Statement">
        {transactions.length ? (
          <Stack spacing={1.2}>
            {transactions.slice(0, 6).map((transaction, index) => (
              <Stack direction={{ sm: 'row', xs: 'column' }} key={`${transaction.createdAt}-${index}`} spacing={0.8} sx={{ border: `1px solid ${storefrontColors.border}`, borderRadius: 1, justifyContent: 'space-between', px: 1.5, py: 1.2 }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ color: storefrontColors.navy, fontWeight: 900 }}>{transaction.description}</Typography>
                  <Typography sx={{ color: storefrontColors.muted, fontSize: '0.85rem', fontWeight: 700 }}>{new Date(transaction.createdAt).toLocaleString()}</Typography>
                </Box>
                <Typography sx={{ color: transaction.direction === 'credit' ? storefrontColors.success : storefrontColors.navy, flexShrink: 0, fontWeight: 900 }}>
                  {transaction.direction === 'credit' ? '+' : '-'} {formatWalletAmount(transaction.amount)}
                </Typography>
              </Stack>
            ))}
          </Stack>
        ) : (
          <Typography sx={{ color: storefrontColors.muted, fontWeight: 700 }}>No wallet activity yet.</Typography>
        )}
      </WalletPanel>
      <WalletAccordionRow title="About AV's Store Wallet" />
    </Stack>
  );
};

const StatementContent = () => (
  <Box sx={{ mt: 4.5 }}>
    <Box
      sx={{
        backgroundColor: storefrontColors.navy,
        borderRadius: '3px 3px 0 0',
        color: '#ffffff',
        px: 2.2,
        py: 1.55,
      }}
    >
      <Typography sx={{ fontSize: '1.25rem', fontWeight: 900 }}>Statements</Typography>
    </Box>
    <Typography sx={{ color: '#4f535b', fontSize: '0.95rem', fontWeight: 700, mt: 2.2 }}>
      How much you have spent in the last 6 months:
    </Typography>
    <Stack spacing={2.6} sx={{ alignItems: 'center', minHeight: 430, pt: 3, textAlign: 'center' }}>
      <Box sx={{ position: 'relative' }}>
        <EmptyListIllustration type="lists" />
        <HistoryRoundedIcon
          sx={{
            color: storefrontColors.navy,
            fontSize: 68,
            left: '50%',
            position: 'absolute',
            top: -6,
            transform: 'translateX(-50%)',
          }}
        />
      </Box>
      <Typography sx={{ color: storefrontColors.navy, fontSize: '1.35rem', fontWeight: 900 }}>
        There have been no purchases in the last 6 months
      </Typography>
      <Button
        component={Link}
        to={routePaths.catalog}
        sx={{
          backgroundColor: storefrontColors.navy,
          borderRadius: 999,
          color: '#ffffff',
          fontSize: '1.05rem',
          fontWeight: 900,
          minHeight: 56,
          px: 5,
          textTransform: 'none',
          width: { sm: 280, xs: '100%' },
          '&:hover': { backgroundColor: storefrontColors.navyDark },
        }}
      >
        Start shopping
      </Button>
    </Stack>
  </Box>
);

const OrdersContent = () => (
  <Box sx={{ mt: 4.5 }}>
    <Box sx={{ maxWidth: 1080 }}>
      <Box
        sx={{
          backgroundColor: storefrontColors.navy,
          borderRadius: '3px 3px 0 0',
          color: '#ffffff',
          px: 2.2,
          py: 1.55,
        }}
      >
        <Typography sx={{ fontSize: '1.25rem', fontWeight: 900 }}>My Orders</Typography>
      </Box>

      <Box
        sx={{
          backgroundColor: '#ffffff',
          border: `1px solid ${storefrontColors.border}`,
          borderTop: 0,
          p: { md: 2.5, xs: 1.5 },
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gap: 1.5,
            gridTemplateColumns: { md: 'repeat(3, minmax(0, 1fr))', xs: '1fr' },
            mb: 3,
          }}
        >
          {[
            { label: 'Upcoming', value: '0', helper: 'No active deliveries' },
            { label: 'Past orders', value: '0', helper: 'Completed orders will appear here' },
            { label: 'Support tickets', value: '0', helper: 'No order issues reported' },
          ].map((item) => (
            <Box
              key={item.label}
              sx={{
                backgroundColor: '#f7f8fb',
                border: `1px solid ${storefrontColors.border}`,
                borderRadius: 1,
                px: 2,
                py: 1.7,
              }}
            >
              <Typography sx={{ color: storefrontColors.muted, fontSize: '0.85rem', fontWeight: 800 }}>
                {item.label}
              </Typography>
              <Typography sx={{ color: storefrontColors.navy, fontSize: '1.8rem', fontWeight: 900, lineHeight: 1.1, mt: 0.4 }}>
                {item.value}
              </Typography>
              <Typography sx={{ color: '#697180', fontSize: '0.85rem', fontWeight: 700, mt: 0.5 }}>
                {item.helper}
              </Typography>
            </Box>
          ))}
        </Box>

        <Stack
          direction={{ sm: 'row', xs: 'column' }}
          spacing={1}
          sx={{
            backgroundColor: '#f2f3f8',
            borderRadius: 999,
            p: 0.7,
            width: 'fit-content',
          }}
        >
          {['Upcoming Orders', 'Past Orders'].map((label, index) => (
            <Box
              key={label}
              sx={{
                backgroundColor: index === 0 ? '#ffffff' : 'transparent',
                borderRadius: 999,
                boxShadow: index === 0 ? `0 8px 18px ${alpha(storefrontColors.navyDark, 0.1)}` : 'none',
                px: 2.4,
                py: 1,
              }}
            >
              <Typography sx={{ color: storefrontColors.navy, fontSize: '0.98rem', fontWeight: 900 }}>
                {label}
              </Typography>
            </Box>
          ))}
        </Stack>

        <SearchBar placeholder="Search for your orders" />

        <Box
          sx={{
            alignItems: 'center',
            backgroundColor: '#ffffff',
            border: `1px solid ${storefrontColors.border}`,
            borderRadius: 1,
            boxShadow: `0 12px 30px ${alpha(storefrontColors.navyDark, 0.06)}`,
            display: 'flex',
            flexDirection: 'column',
            mt: 3,
            minHeight: 360,
            px: { md: 4, xs: 2 },
            py: { md: 5, xs: 3 },
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              alignItems: 'center',
              backgroundColor: alpha(storefrontColors.navy, 0.08),
              borderRadius: '50%',
              color: storefrontColors.navy,
              display: 'flex',
              height: 86,
              justifyContent: 'center',
              mb: 2,
              width: 86,
            }}
          >
            <Inventory2OutlinedIcon sx={{ fontSize: 42 }} />
          </Box>

          <Typography sx={{ color: storefrontColors.navy, fontSize: { md: '1.45rem', xs: '1.2rem' }, fontWeight: 900 }}>
            No orders yet
          </Typography>
          <Typography sx={{ color: storefrontColors.muted, fontWeight: 700, lineHeight: 1.55, maxWidth: 480, mt: 1 }}>
            When you place an order, delivery updates, payment details, and support options will appear here.
          </Typography>

          <Stack
            direction={{ sm: 'row', xs: 'column' }}
            spacing={1.4}
            sx={{ alignItems: 'center', justifyContent: 'center', mt: 3, width: '100%' }}
          >
            <Button
              component={Link}
              to={routePaths.catalog}
              sx={{
                backgroundColor: storefrontColors.navy,
                borderRadius: 999,
                color: '#ffffff',
                fontWeight: 900,
                minHeight: 48,
                px: 3.5,
                textTransform: 'none',
                width: { sm: 'auto', xs: '100%' },
                '&:hover': { backgroundColor: storefrontColors.navyDark },
              }}
            >
              Start shopping
            </Button>
            <Button
              component={Link}
              to={routePaths.accountFavourites}
              sx={{
                border: `1px solid ${storefrontColors.border}`,
                borderRadius: 999,
                color: storefrontColors.navy,
                fontWeight: 900,
                minHeight: 48,
                px: 3,
                textTransform: 'none',
                width: { sm: 'auto', xs: '100%' },
                '&:hover': { backgroundColor: alpha(storefrontColors.navy, 0.06) },
              }}
            >
              View favourites
            </Button>
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gap: 1.2,
              gridTemplateColumns: { md: 'repeat(3, minmax(0, 1fr))', xs: '1fr' },
              maxWidth: 720,
              mt: 4,
              width: '100%',
            }}
          >
            {['Shop products', 'Checkout securely', 'Track delivery'].map((label, index) => (
              <Stack
                direction="row"
                key={label}
                spacing={1}
                sx={{
                  alignItems: 'center',
                  backgroundColor: '#f7f8fb',
                  border: `1px solid ${storefrontColors.border}`,
                  borderRadius: 1,
                  px: 1.5,
                  py: 1.2,
                }}
              >
                <Box
                  sx={{
                    alignItems: 'center',
                    backgroundColor: alpha(storefrontColors.navy, 0.1),
                    borderRadius: '50%',
                    color: storefrontColors.navy,
                    display: 'flex',
                    flexShrink: 0,
                    fontSize: '0.82rem',
                    fontWeight: 900,
                    height: 28,
                    justifyContent: 'center',
                    width: 28,
                  }}
                >
                  {index + 1}
                </Box>
                <Typography sx={{ color: '#4f535b', fontSize: '0.9rem', fontWeight: 800 }}>
                  {label}
                </Typography>
              </Stack>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  </Box>
);

const RegularsContent = () => (
  <Box sx={{ mt: 4.5 }}>
    <Box
      sx={{
        backgroundColor: storefrontColors.navy,
        borderRadius: '3px 3px 0 0',
        color: '#ffffff',
        px: 2.2,
        py: 1.55,
      }}
    >
      <Typography sx={{ fontSize: '1.25rem', fontWeight: 900 }}>Regulars</Typography>
    </Box>
    <Stack spacing={2} sx={{ alignItems: 'center', minHeight: 530, pt: 18, textAlign: 'center' }}>
      <Box sx={{ position: 'relative' }}>
        <EmptyListIllustration type="lists" />
        <Box
          sx={{
            alignItems: 'center',
            backgroundColor: '#f4f6fb',
            border: `2px solid ${alpha(storefrontColors.navy, 0.35)}`,
            borderRadius: '50%',
            bottom: 16,
            color: storefrontColors.navy,
            display: 'flex',
            fontSize: '2rem',
            fontWeight: 800,
            height: 46,
            justifyContent: 'center',
            position: 'absolute',
            right: 28,
            width: 46,
          }}
        >
          ×
        </Box>
      </Box>
      <Typography sx={{ color: storefrontColors.navy, fontSize: '1.3rem', fontWeight: 800 }}>
        No Existing Subscriptions
      </Typography>
    </Stack>
  </Box>
);

const CollectionServiceContent = () => (
  <Box sx={{ mt: 4.5 }}>
    <Box
      sx={{
        backgroundColor: storefrontColors.navy,
        borderRadius: '3px 3px 0 0',
        color: '#ffffff',
        px: 2.2,
        py: 1.55,
      }}
    >
      <Typography sx={{ fontSize: '1.25rem', fontWeight: 900 }}>Collection Service</Typography>
    </Box>
    <Stack spacing={2} sx={{ alignItems: 'center', minHeight: 530, pt: 18, textAlign: 'center' }}>
      <Box sx={{ position: 'relative' }}>
        <EmptyListIllustration type="lists" />
        <RecyclingOutlinedIcon
          sx={{
            color: storefrontColors.navy,
            fontSize: 70,
            left: '50%',
            position: 'absolute',
            top: -10,
            transform: 'translateX(-50%)',
          }}
        />
        <Box
          sx={{
            alignItems: 'center',
            backgroundColor: '#f4f6fb',
            border: `2px solid ${alpha(storefrontColors.navy, 0.35)}`,
            borderRadius: '50%',
            bottom: 16,
            color: storefrontColors.navy,
            display: 'flex',
            fontSize: '2rem',
            fontWeight: 800,
            height: 46,
            justifyContent: 'center',
            position: 'absolute',
            right: 28,
            width: 46,
          }}
        >
          ×
        </Box>
      </Box>
      <Typography sx={{ color: storefrontColors.navy, fontSize: '1.3rem', fontWeight: 800 }}>
        No Recyclable Items
      </Typography>
    </Stack>
  </Box>
);

const emptyAddressForm: CustomerAddressPayload = {
  addressLine1: '',
  addressLine2: '',
  city: '',
  deliveryInstructions: '',
  isDefault: false,
  label: 'home',
  landmark: '',
  phone: '',
  recipientName: '',
  region: '',
  township: '',
};

const getUserFullName = (user: RootState['auth']['user']) =>
  user ? `${user.firstName} ${user.lastName}`.trim() : '';

const getAddressFormDefaults = (user: RootState['auth']['user']): CustomerAddressPayload => ({
  ...emptyAddressForm,
  phone: user?.phone ?? '',
  recipientName: getUserFullName(user),
});

const AddressContent = () => {
  const { addresses, createAddress, deleteAddress, isLoading, isSaving, updateAddress } = useAddresses();
  const locationsQuery = useMyanmarLocations();
  const user = useSelector((state: RootState) => state.auth.user);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);
  const [form, setForm] = useState<CustomerAddressPayload>(() => getAddressFormDefaults(user));
  const hasAddresses = addresses.length > 0;
  const myanmarLocations = locationsQuery.data?.length ? locationsQuery.data : myanmarLocationFallback;
  const selectedLocation = myanmarLocations.find((locationOption) => locationOption.region === form.region);
  const cityOptions = selectedLocation?.cities ?? [];
  const townshipOptions = selectedLocation?.townships ?? [];

  useEffect(() => {
    if (!editingAddress) {
      const defaults = getAddressFormDefaults(user);

      setForm((current) => ({
        ...current,
        phone: current.phone || defaults.phone,
        recipientName: current.recipientName || defaults.recipientName,
      }));
    }
  }, [editingAddress, user]);

  const resetForm = () => {
    setEditingAddress(null);
    setForm(getAddressFormDefaults(user));
  };
  const startEdit = (address: CustomerAddress) => {
    setEditingAddress(address);
    setForm({
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 ?? '',
      city: address.city,
      deliveryInstructions: address.deliveryInstructions ?? '',
      isDefault: address.isDefault,
      label: address.label,
      landmark: address.landmark ?? '',
      phone: address.phone,
      recipientName: address.recipientName,
      region: address.region ?? '',
      township: address.township ?? '',
    });
  };
  const setField = <TKey extends keyof CustomerAddressPayload>(
    key: TKey,
    value: CustomerAddressPayload[TKey],
  ) => setForm((current) => ({ ...current, [key]: value }));
  const setRegion = (region: string) => {
    const nextLocation = myanmarLocations.find((locationOption) => locationOption.region === region);
    const cityNames = nextLocation?.cities.map((cityOption) => cityOption.name) ?? [];

    setForm((current) => ({
      ...current,
      city: cityNames.includes(current.city) ? current.city : '',
      region,
      township: '',
    }));
  };
  const setCity = (city: string) => {
    setForm((current) => ({
      ...current,
      city,
      township: townshipOptions.includes(current.township ?? '') ? current.township : '',
    }));
  };
  const handleSubmit = async () => {
    if (editingAddress) {
      await updateAddress({ id: editingAddress.id, payload: form });
    } else {
      await createAddress(form);
    }
    resetForm();
  };

  return (
    <Box sx={{ maxWidth: 1120, mt: 4.8 }}>
      <Stack direction={{ sm: 'row', xs: 'column' }} spacing={1.5} sx={{ alignItems: { sm: 'center', xs: 'flex-start' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography sx={{ color: storefrontColors.navy, fontSize: '1.45rem', fontWeight: 900 }}>My Addresses</Typography>
          <Typography sx={{ color: storefrontColors.muted, fontWeight: 700, mt: 0.7 }}>
            Save delivery locations and choose the default address used at checkout.
          </Typography>
        </Box>
        <Chip color={hasAddresses ? 'success' : 'default'} label={`${addresses.length} saved`} />
      </Stack>

      <Box sx={{ backgroundColor: '#ffffff', border: `1px solid ${storefrontColors.border}`, borderRadius: 2, display: 'grid', gap: 2, gridTemplateColumns: { lg: '0.95fr 1.05fr', xs: '1fr' }, mt: 3, p: { md: 3, xs: 2 } }}>
        <Stack spacing={2}>
          <Typography sx={{ color: storefrontColors.navy, fontSize: '1.08rem', fontWeight: 900 }}>{editingAddress ? 'Edit delivery address' : 'Add delivery address'}</Typography>
          <TextField label="Recipient name" onChange={(event) => setField('recipientName', event.target.value)} required value={form.recipientName} />
          <TextField label="Mobile number" onChange={(event) => setField('phone', event.target.value)} required value={form.phone} />
          <TextField label="Address label" onChange={(event) => setField('label', event.target.value as CustomerAddressPayload['label'])} select value={form.label}>
            <MenuItem value="home">Home</MenuItem>
            <MenuItem value="work">Work</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </TextField>
          <TextField label="Address line 1" onChange={(event) => setField('addressLine1', event.target.value)} required value={form.addressLine1} />
          <TextField label="Address line 2" onChange={(event) => setField('addressLine2', event.target.value)} value={form.addressLine2} />
          <Box
            sx={{
              alignItems: 'stretch',
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { sm: 'repeat(2, minmax(0, 1fr))', xs: '1fr' },
              '& .MuiTextField-root': {
                width: '100%',
              },
            }}
          >
            <TextField fullWidth label="Region / State" onChange={(event) => setRegion(event.target.value)} required select value={form.region}>
              {myanmarLocations.map((locationOption) => (
                <MenuItem key={locationOption.region} value={locationOption.region}>
                  {locationOption.region}
                </MenuItem>
              ))}
            </TextField>
            <TextField disabled={!form.region} fullWidth label="City" onChange={(event) => setCity(event.target.value)} required select value={form.city}>
              {cityOptions.map((city) => (
                <MenuItem key={city.name} value={city.name}>
                  {city.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField disabled={!form.region} fullWidth label="Township" onChange={(event) => setField('township', event.target.value)} required select value={form.township}>
              {townshipOptions.map((township) => (
                <MenuItem key={township} value={township}>
                  {township}
                </MenuItem>
              ))}
            </TextField>
            <TextField fullWidth label="Nearby landmark" onChange={(event) => setField('landmark', event.target.value)} value={form.landmark} />
          </Box>
          <TextField label="Delivery instructions" minRows={3} multiline onChange={(event) => setField('deliveryInstructions', event.target.value)} value={form.deliveryInstructions} />
          <FormControlLabel control={<Switch checked={form.isDefault} onChange={(event) => setField('isDefault', event.target.checked)} />} label="Use as default delivery address" />
          <Stack direction="row" spacing={1.5}>
            <Button disabled={isSaving || !form.recipientName || !form.phone || !form.addressLine1 || !form.region || !form.city || !form.township} onClick={() => void handleSubmit()} sx={{ backgroundColor: storefrontColors.navy, borderRadius: 999, color: '#ffffff', fontWeight: 900, px: 3.5, textTransform: 'none', '&:hover': { backgroundColor: storefrontColors.navyDark } }}>
              {editingAddress ? 'Save address' : 'Add address'}
            </Button>
            {editingAddress ? <Button onClick={resetForm} sx={{ borderRadius: 999, fontWeight: 800, textTransform: 'none' }}>Cancel</Button> : null}
          </Stack>
        </Stack>

        <Stack spacing={1.5}>
          <Typography sx={{ color: storefrontColors.navy, fontSize: '1.08rem', fontWeight: 900 }}>Saved addresses</Typography>
          {isLoading ? (
            <Typography sx={{ color: storefrontColors.muted, fontWeight: 700 }}>Loading addresses...</Typography>
          ) : hasAddresses ? (
            addresses.map((address) => (
              <Box key={address.id} sx={{ border: `1px solid ${storefrontColors.border}`, borderRadius: 1.5, p: 2 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Chip label={address.label} size="small" />
                    {address.isDefault ? <Chip color="success" label="Default" size="small" /> : null}
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    {!address.isDefault ? <Button onClick={() => void updateAddress({ id: address.id, payload: { isDefault: true } })} size="small" sx={{ textTransform: 'none' }}>Set default</Button> : null}
                    <Button onClick={() => startEdit(address)} size="small" sx={{ textTransform: 'none' }}>Edit</Button>
                    <Button color="error" onClick={() => void deleteAddress(address.id)} size="small" sx={{ textTransform: 'none' }}>Delete</Button>
                  </Stack>
                </Stack>
                <Typography sx={{ color: storefrontColors.navy, fontWeight: 900, mt: 1.3 }}>{address.recipientName}</Typography>
                <Typography sx={{ color: '#4b5563', fontWeight: 700 }}>{address.phone}</Typography>
                <Typography sx={{ color: '#4b5563', mt: 0.8 }}>{[address.addressLine1, address.addressLine2, address.township, address.city, address.region].filter(Boolean).join(', ')}</Typography>
                {address.landmark ? <Typography sx={{ color: storefrontColors.muted, mt: 0.5 }}>Landmark: {address.landmark}</Typography> : null}
                {address.deliveryInstructions ? <Typography sx={{ color: storefrontColors.muted, mt: 0.5 }}>Instructions: {address.deliveryInstructions}</Typography> : null}
              </Box>
            ))
          ) : (
            <Box sx={{ backgroundColor: '#f6f8fc', border: `1px dashed ${storefrontColors.border}`, borderRadius: 1.5, p: 3 }}>
              <Typography sx={{ color: storefrontColors.navy, fontWeight: 900 }}>No addresses saved</Typography>
              <Typography sx={{ color: storefrontColors.muted, mt: 0.7 }}>Add your first delivery address to speed up checkout.</Typography>
            </Box>
          )}
        </Stack>
      </Box>
    </Box>
  );
};

const getProfileForm = (user: RootState['auth']['user']): UpdateProfilePayload => ({
  email: user?.email ?? '',
  name: user ? `${user.firstName} ${user.lastName}`.trim() : '',
  phone: user?.phone ?? '',
});

const formatRoleLabel = (role?: string) =>
  role ? role.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) : '';

const ProfileContent = ({ activePage }: { activePage: AccountPageConfig }) => {
  const dispatch = useAppDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<UpdateProfilePayload>(() => getProfileForm(user));

  useEffect(() => {
    if (!isEditing) {
      setForm(getProfileForm(user));
    }
  }, [isEditing, user]);

  const mutation = useMutation({
    mutationFn: authApi.updateProfile,
    onError: (error) => toast.error(toApiError(error).message),
    onSuccess: (result) => {
      dispatch(updateUser(result.data));
      setConfirmOpen(false);
      setIsEditing(false);
      toast.success(result.message);
    },
  });

  const setProfileField = <TKey extends keyof UpdateProfilePayload>(key: TKey, value: UpdateProfilePayload[TKey]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const validateProfile = () => {
    const name = form.name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();

    if (name.length < 2) {
      toast.error('Full name is required.');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('A valid email address is required.');
      return false;
    }

    if (!/^\+\d{7,15}$/.test(phone)) {
      toast.error('Mobile number must include a valid country code.');
      return false;
    }

    return true;
  };

  const openConfirmation = () => {
    if (validateProfile()) {
      setConfirmOpen(true);
    }
  };

  const cancelEdit = () => {
    setForm(getProfileForm(user));
    setIsEditing(false);
    setConfirmOpen(false);
  };

  const submitProfile = () => {
    void mutation.mutateAsync({
      email: form.email.trim(),
      name: form.name.trim(),
      phone: form.phone.trim(),
    });
  };

  return (
    <Box sx={{ maxWidth: 980, mt: 4.8 }}>
      <Stack direction={{ sm: 'row', xs: 'column' }} spacing={1.5} sx={{ alignItems: { sm: 'center', xs: 'flex-start' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography sx={{ color: storefrontColors.navy, fontSize: '1.45rem', fontWeight: 900 }}>{activePage.title}</Typography>
          <Typography sx={{ color: storefrontColors.muted, fontWeight: 700, mt: 0.7 }}>
            Review your logged-in account details before making profile changes.
          </Typography>
        </Box>
        <Chip color={isEditing ? 'warning' : 'default'} label={isEditing ? 'Editing' : 'Locked'} />
      </Stack>

      <Box
        sx={{
          backgroundColor: '#ffffff',
          border: `1px solid ${storefrontColors.border}`,
          borderRadius: 2,
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { sm: 'repeat(2, minmax(0, 1fr))', xs: '1fr' },
          mt: 3,
          p: { md: 3, xs: 2 },
        }}
      >
        <TextField disabled={!isEditing || mutation.isPending} label="Full name" onChange={(event) => setProfileField('name', event.target.value)} required value={form.name} />
        <TextField disabled={!isEditing || mutation.isPending} label="Email address" onChange={(event) => setProfileField('email', event.target.value)} required type="email" value={form.email} />
        <TextField disabled={!isEditing || mutation.isPending} label="Mobile number" helperText={isEditing ? 'Use country code, for example +959123456789.' : undefined} onChange={(event) => setProfileField('phone', event.target.value)} required value={form.phone} />
        <TextField disabled label="Account type" required value={formatRoleLabel(user?.role)} />
      </Box>

      <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
        {isEditing ? (
          <>
            <Button disabled={mutation.isPending} onClick={openConfirmation} sx={{ backgroundColor: storefrontColors.navy, borderRadius: 999, color: '#ffffff', fontSize: '1rem', fontWeight: 800, px: 4.5, py: 1.2, textTransform: 'none', '&:hover': { backgroundColor: storefrontColors.navyDark } }}>
              Save profile
            </Button>
            <Button disabled={mutation.isPending} onClick={cancelEdit} sx={{ borderRadius: 999, fontSize: '1rem', fontWeight: 800, px: 3.5, py: 1.2, textTransform: 'none' }}>
              Cancel
            </Button>
          </>
        ) : (
          <Button onClick={() => setIsEditing(true)} sx={{ backgroundColor: storefrontColors.navy, borderRadius: 999, color: '#ffffff', fontSize: '1rem', fontWeight: 800, px: 4.5, py: 1.2, textTransform: 'none', '&:hover': { backgroundColor: storefrontColors.navyDark } }}>
            Edit profile
          </Button>
        )}
      </Stack>

      <Dialog fullWidth maxWidth="xs" onClose={() => setConfirmOpen(false)} open={confirmOpen}>
        <DialogTitle>Update profile?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#4b5563', fontWeight: 700 }}>
            Confirm that you want to update your profile information with the entered details.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button disabled={mutation.isPending} onClick={() => setConfirmOpen(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button disabled={mutation.isPending} onClick={submitProfile} sx={{ backgroundColor: storefrontColors.navy, color: '#ffffff', fontWeight: 800, textTransform: 'none', '&:hover': { backgroundColor: storefrontColors.navyDark } }}>
            {mutation.isPending ? 'Updating...' : 'Confirm update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const passwordFieldSx = {
  '& .MuiInputBase-input': {
    fontWeight: 700,
  },
};

const ChangePasswordContent = ({ activePage }: { activePage: AccountPageConfig }) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [form, setForm] = useState({
    confirmPassword: '',
    currentPassword: '',
    newPassword: '',
  });

  const mutation = useMutation({
    mutationFn: authApi.changePassword,
    onError: (error) => toast.error(toApiError(error).message),
    onSuccess: (result) => {
      setConfirmOpen(false);
      setForm({ confirmPassword: '', currentPassword: '', newPassword: '' });
      toast.success(result.message);
    },
  });

  const setPasswordField = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const validatePasswordForm = () => {
    if (form.currentPassword.length < 8) {
      toast.error('Current password is required.');
      return false;
    }

    if (form.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters.');
      return false;
    }

    if (form.newPassword === form.currentPassword) {
      toast.error('New password must be different from the current password.');
      return false;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.error('New password and confirmation do not match.');
      return false;
    }

    return true;
  };

  const openConfirmation = () => {
    if (validatePasswordForm()) {
      setConfirmOpen(true);
    }
  };

  const submitPasswordChange = () => {
    void mutation.mutateAsync({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
    });
  };

  return (
    <Box sx={{ maxWidth: 980, mt: 4.8 }}>
      <Typography sx={{ color: storefrontColors.navy, fontSize: '1.45rem', fontWeight: 900 }}>{activePage.title}</Typography>
      <Box sx={{ backgroundColor: '#ffffff', border: `1px solid ${storefrontColors.border}`, borderRadius: 2, mt: 3, p: { md: 3.5, xs: 2.2 } }}>
        <Stack spacing={2.2} sx={{ maxWidth: 620 }}>
          <Box>
            <Typography sx={{ color: storefrontColors.navy, fontSize: '1.08rem', fontWeight: 900 }}>Secure password update</Typography>
            <Typography sx={{ color: storefrontColors.muted, fontWeight: 700, mt: 0.7 }}>
              Enter your current password before setting a new account password.
            </Typography>
          </Box>
          <TextField autoComplete="current-password" label="Current password" onChange={(event) => setPasswordField('currentPassword', event.target.value)} required sx={passwordFieldSx} type="password" value={form.currentPassword} />
          <TextField autoComplete="new-password" helperText="Use at least 8 characters." label="New password" onChange={(event) => setPasswordField('newPassword', event.target.value)} required sx={passwordFieldSx} type="password" value={form.newPassword} />
          <TextField autoComplete="new-password" label="Confirm new password" onChange={(event) => setPasswordField('confirmPassword', event.target.value)} required sx={passwordFieldSx} type="password" value={form.confirmPassword} />
          <Button disabled={mutation.isPending} onClick={openConfirmation} sx={{ alignSelf: 'flex-start', backgroundColor: storefrontColors.navy, borderRadius: 999, color: '#ffffff', fontWeight: 900, px: 4, py: 1.15, textTransform: 'none', '&:hover': { backgroundColor: storefrontColors.navyDark } }}>
            Update password
          </Button>
        </Stack>
      </Box>

      <Dialog fullWidth maxWidth="xs" onClose={() => setConfirmOpen(false)} open={confirmOpen}>
        <DialogTitle>Update password?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#4b5563', fontWeight: 700 }}>
            Confirm this password change. Use the new password the next time you sign in.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button disabled={mutation.isPending} onClick={() => setConfirmOpen(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button disabled={mutation.isPending} onClick={submitPasswordChange} sx={{ backgroundColor: storefrontColors.navy, color: '#ffffff', fontWeight: 800, textTransform: 'none', '&:hover': { backgroundColor: storefrontColors.navyDark } }}>
            {mutation.isPending ? 'Updating...' : 'Confirm update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const DeleteAccountContent = ({ activePage }: { activePage: AccountPageConfig }) => {
  const signOut = useSignOut();
  const user = useSelector((state: RootState) => state.auth.user);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [form, setForm] = useState({
    confirmation: '',
    password: '',
  });
  const canRequestDeletion = form.confirmation === 'DELETE' && form.password.length >= 8;

  const mutation = useMutation({
    mutationFn: authApi.deleteAccount,
    onError: (error) => toast.error(toApiError(error).message),
    onSuccess: async (result) => {
      toast.success(result.message);
      await signOut();
    },
  });

  const openConfirmation = () => {
    if (!canRequestDeletion) {
      toast.error('Enter your password and type DELETE to continue.');
      return;
    }

    setConfirmOpen(true);
  };

  const submitDeletion = () => {
    void mutation.mutateAsync({
      confirmation: 'DELETE',
      password: form.password,
    });
  };

  return (
    <Box sx={{ maxWidth: 980, mt: 4.8 }}>
      <Typography sx={{ color: storefrontColors.navy, fontSize: '1.45rem', fontWeight: 900 }}>{activePage.title}</Typography>
      <Box sx={{ backgroundColor: '#ffffff', border: `1px solid ${storefrontColors.border}`, borderRadius: 2, mt: 3, p: { md: 3.5, xs: 2.2 } }}>
        <Stack spacing={2.2} sx={{ maxWidth: 680 }}>
          <Box>
            <Typography sx={{ color: storefrontColors.navy, fontSize: '1.08rem', fontWeight: 900 }}>Close this customer account</Typography>
            <Typography sx={{ color: storefrontColors.muted, fontWeight: 700, mt: 0.7 }}>
              This disables your login and signs you out immediately. Saved customer access will no longer be available.
            </Typography>
          </Box>
          <Box sx={{ backgroundColor: '#fff4f2', border: '1px solid #f6c7c1', borderRadius: 1.5, p: 2 }}>
            <Typography sx={{ color: storefrontColors.navy, fontWeight: 900 }}>Account selected for deletion</Typography>
            <Typography sx={{ color: '#4b5563', fontWeight: 700, mt: 0.5 }}>
              {user ? `${getUserFullName(user)} (${user.email})` : 'Current logged-in account'}
            </Typography>
          </Box>
          <TextField autoComplete="current-password" label="Password" onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} required sx={passwordFieldSx} type="password" value={form.password} />
          <TextField helperText="Type DELETE exactly to enable account deletion." label="Confirmation" onChange={(event) => setForm((current) => ({ ...current, confirmation: event.target.value }))} required value={form.confirmation} />
          <Button disabled={mutation.isPending || !canRequestDeletion} onClick={openConfirmation} sx={{ alignSelf: 'flex-start', backgroundColor: storefrontColors.navy, borderRadius: 999, color: '#ffffff', fontWeight: 900, px: 4, py: 1.15, textTransform: 'none', '&:hover': { backgroundColor: storefrontColors.navyDark }, '&.Mui-disabled': { backgroundColor: '#c9cdd6', color: '#ffffff' } }}>
            Request deletion
          </Button>
        </Stack>
      </Box>

      <Dialog fullWidth maxWidth="xs" onClose={() => setConfirmOpen(false)} open={confirmOpen}>
        <DialogTitle>Delete account?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#4b5563', fontWeight: 700 }}>
            This action will disable your account and sign you out. Confirm only if you want to continue.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button disabled={mutation.isPending} onClick={() => setConfirmOpen(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button disabled={mutation.isPending} onClick={submitDeletion} sx={{ backgroundColor: storefrontColors.navy, color: '#ffffff', fontWeight: 800, textTransform: 'none', '&:hover': { backgroundColor: storefrontColors.navyDark } }}>
            {mutation.isPending ? 'Deleting...' : 'Delete account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const InfoContent = ({ activePage }: { activePage: AccountPageConfig }) => (
  <Box sx={{ maxWidth: 980, mt: 4.8 }}>
    <Typography sx={{ color: storefrontColors.navy, fontSize: '1.45rem', fontWeight: 900 }}>{activePage.title}</Typography>
    <Box
      sx={{
        backgroundColor: '#ffffff',
        border: `1px solid ${storefrontColors.border}`,
        borderRadius: 2,
        display: 'grid',
        gap: 3,
        gridTemplateColumns: { md: '120px minmax(0, 1fr)', xs: '1fr' },
        mt: 3,
        p: { md: 3.5, xs: 2.2 },
      }}
    >
      <Box
        sx={{
          alignItems: 'center',
          backgroundColor: '#f0f0f6',
          borderRadius: '50%',
          color: storefrontColors.navy,
          display: 'flex',
          height: 112,
          justifyContent: 'center',
          width: 112,
          '& svg': { fontSize: 48 },
        }}
      >
        {activePage.icon}
      </Box>
      <Stack spacing={2}>
        <Typography sx={{ color: '#4b5563', fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.7 }}>
          {activePage.description}
        </Typography>
        <Box
          sx={{
            backgroundColor: '#f6f8fc',
            border: `1px solid ${storefrontColors.border}`,
            borderRadius: 1.5,
            px: 2,
            py: 1.5,
          }}
        >
          <Typography sx={{ color: storefrontColors.navy, fontWeight: 900 }}>Current status</Typography>
          <Typography sx={{ color: storefrontColors.muted, mt: 0.5 }}>
            This section is ready for live account data and API integration.
          </Typography>
        </Box>
        <Button
          sx={{
            alignSelf: 'flex-start',
            backgroundColor: storefrontColors.navy,
            borderRadius: 999,
            color: '#ffffff',
            fontWeight: 800,
            px: 4,
            py: 1.1,
            textTransform: 'none',
            '&:hover': { backgroundColor: storefrontColors.navyDark },
          }}
        >
          {activePage.emptyAction}
        </Button>
      </Stack>
    </Box>
  </Box>
);

const AccountPageContent = ({ activePage }: { activePage: AccountPageConfig }) => {
  if (activePage.path === routePaths.accountCollectionService) {
    return <CollectionServiceContent />;
  }

  if (activePage.path === routePaths.accountRegulars) {
    return <RegularsContent />;
  }

  if (activePage.path === routePaths.accountOrders) {
    return <OrdersContent />;
  }

  if (activePage.path === routePaths.accountWallet) {
    return <WalletContent />;
  }

  if (activePage.path === routePaths.accountStatement) {
    return <StatementContent />;
  }

  if (activePage.path === routePaths.accountVouchers) {
    return <VouchersContent />;
  }

  if (activePage.path === routePaths.accountAddresses) {
    return <AddressContent />;
  }

  if (activePage.path === routePaths.accountChangePassword) {
    return <ChangePasswordContent activePage={activePage} />;
  }

  if (activePage.path === routePaths.accountDeleteAccount) {
    return <DeleteAccountContent activePage={activePage} />;
  }

  if (activePage.path === routePaths.account) {
    return <ProfileContent activePage={activePage} />;
  }

  if (activePage.kind === 'profile') {
    return <InfoContent activePage={activePage} />;
  }

  if (activePage.kind === 'info') {
    return <InfoContent activePage={activePage} />;
  }

  return <CommerceContent activePage={activePage} />;
};

export const AccountMenuPage = () => {
  const { pathname } = useLocation();
  const activePage = getActivePage(pathname);

  return (
    <Stack
      direction={{ md: 'row', xs: 'column' }}
      spacing={{ md: 4, xs: 2.5 }}
      sx={{ alignItems: 'flex-start', minHeight: 760 }}
    >
      <AccountSidebar activePath={activePage.path} />
      <Box component="main" sx={{ flex: 1, minWidth: 0, width: '100%' }}>
        <Typography sx={{ color: '#44474d', fontSize: '1rem', fontWeight: 700, mb: 2.5 }}>
          Home /{' '}
          <Typography
            component="span"
            sx={{ color: storefrontColors.navy, fontSize: '1rem', fontWeight: 800, textDecoration: 'underline' }}
          >
            {activePage.title}
          </Typography>
        </Typography>

        <ProfileSummary />
        <AccountPageContent activePage={activePage} />
      </Box>
    </Stack>
  );
};

export const FavouritesPage = AccountMenuPage;
