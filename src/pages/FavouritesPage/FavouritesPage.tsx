import { PersistentDialog as Dialog } from '@shared/components/ui/Dialog/AppDialog';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import AddShoppingCartOutlinedIcon from '@mui/icons-material/AddShoppingCartOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
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
import {
  Box,
  Button,
  Chip,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useEffect, useState, type ReactElement } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { storefrontColors } from '@app/providers/theme/tokens';
import logoImage from '@assets/images/logo.png';
import type {
  CustomerAddress,
  CustomerAddressPayload,
} from '@entities/address/types/address.types';
import type { Order } from '@entities/order/types/order.types';
import type { Product } from '@entities/product/types/product.types';
import { paymentMethodLabel } from '@entities/order/lib/paymentMethodLabel';
import { OrderStatusChip } from '@entities/order/ui/OrderStatusChip';
import { useAddresses } from '@features/addresses/hooks/useAddresses';
import { authApi } from '@features/auth/api/authApi';
import { useFavorites } from '@features/favorites/hooks/useFavorites';
import { useSignOut } from '@features/auth/hooks/useSignOut';
import type { UpdateProfilePayload } from '@features/auth/types/auth.types';
import { useCart } from '@features/cart/hooks/useCart';
import { useI18n } from '@features/i18n/I18nProvider';
import { yangonLocationFallback } from '@features/locations/data/myanmarLocations';
import { useMyanmarLocations } from '@features/locations/hooks/useMyanmarLocations';
import { orderApi } from '@features/order/api/orderApi';
import { productApi } from '@features/product/api/productApi';
import { shoppingListsApi } from '@features/shopping-lists/api/shoppingListsApi';
import { walletApi } from '@features/wallet/api/walletApi';
import { useWallet } from '@features/wallet/hooks/useWallet';
import { routePaths } from '@routes/routePaths';
import { toApiError } from '@shared/api/apiError';
import { AppBackButton } from '@shared/components/ui/BackButton/AppBackButton';
import { useAppDispatch } from '@store/hooks';
import type { RootState } from '@store/index';
import { updateUser } from '@store/slices/auth.slice';
import { formatCurrency } from '@utils/formatCurrency';
import { formatDate } from '@utils/formatDate';

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
    description:
      'Review your account profile, contact details, saved addresses, and security settings.',
    emptyAction: 'View profile',
    icon: <AutoAwesomeOutlinedIcon />,
    kind: 'info',
    path: routePaths.accountStatus,
    title: 'Account Overview',
  },
  addresses: {
    description:
      'Manage delivery addresses, saved locations, labels, and default address preferences.',
    emptyAction: 'Add address',
    icon: <LocationOnOutlinedIcon />,
    kind: 'profile',
    path: routePaths.accountAddresses,
    title: 'My Addresses',
  },
  awards: {
    description:
      "Browse awards and recognitions from AV's Store product, service, and sustainability milestones.",
    emptyAction: 'View awards',
    icon: <EmojiEventsOutlinedIcon />,
    kind: 'info',
    path: routePaths.accountAwards,
    title: 'Awards',
  },
  brand: {
    description:
      "Learn about the AV's Store brand promise, fresh sourcing standards, and customer commitments.",
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
    description:
      'Review collection requests, recycling returns, and scheduled customer service pickups.',
    emptyAction: 'Book collection',
    icon: <RecyclingOutlinedIcon />,
    kind: 'commerce',
    path: routePaths.accountCollectionService,
    searchPlaceholder: 'Search collection requests',
    title: 'Collection Service',
  },
  deleteAccount: {
    description:
      'Review account closure options and data removal requests before deleting your account.',
    emptyAction: 'Request deletion',
    icon: <DeleteOutlineRoundedIcon />,
    kind: 'profile',
    path: routePaths.accountDeleteAccount,
    title: 'Delete Account',
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
    description:
      'View current orders, delivery progress, previous purchases, and order support actions.',
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
    description:
      "Understand the quality checks, freshness controls, and delivery standards used by AV's Store.",
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
    description:
      'Explore the company vision for freshness, savings, service, and sustainable grocery shopping.',
    emptyAction: 'Read vision',
    icon: <LightbulbOutlinedIcon />,
    kind: 'info',
    path: routePaths.accountVision,
    title: 'Our Vision',
  },
  vouchers: {
    description:
      'Find saved vouchers, promo codes, and special savings available for your account.',
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
  walletTerms: {
    description: "Read the terms and conditions for using AV's Store Wallet.",
    emptyAction: 'Back to wallet',
    icon: <ReceiptLongOutlinedIcon />,
    kind: 'info',
    path: routePaths.accountWalletTerms,
    title: 'Wallet Terms & Conditions',
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
        <Box
          sx={{
            backgroundColor: '#f2f3f8',
            display: { md: 'block', xs: 'none' },
            px: 2.2,
            py: 1.7,
          }}
        >
          <Typography
            sx={{
              color: storefrontColors.navy,
              fontSize: '1.05rem',
              fontWeight: 900,
              lineHeight: 1.15,
            }}
          >
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
                  border: {
                    md: 0,
                    xs: `1px solid ${isActive ? storefrontColors.navy : storefrontColors.border}`,
                  },
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
                <Box
                  sx={{
                    color: storefrontColors.accent,
                    display: 'inline-flex',
                    '& svg': { fontSize: { md: 27, xs: 20 } },
                  }}
                >
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
  const ordersSummaryQuery = useQuery({
    enabled: Boolean(user?.id),
    queryFn: ({ signal }) => orderApi.getOrders({ signal }),
    queryKey: ['orders', user?.id],
    staleTime: 30_000,
  });
  const serverWallet = walletSummaryQuery.data?.wallet;
  const availableBalance = serverWallet
    ? Math.max(0, serverWallet.balance - serverWallet.reservedBalance)
    : fallbackWallet.availableBalance;
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Min Naing Min Naing';
  const email = user?.email ?? 'minnaingjokermm@gmail.com';
  const orderCount = ordersSummaryQuery.data?.length ?? 0;

  const stats = [
    {
      caption: 'ORDERS',
      label: 'My Orders',
      path: routePaths.accountOrders,
      prominent: true,
      value: ordersSummaryQuery.isLoading ? '—' : orderCount.toLocaleString(),
    },
    {
      caption: 'AVAILABLE',
      label: 'Wallet',
      path: routePaths.accountWallet,
      prominent: false,
      value: formatWalletAmount(availableBalance),
    },
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
          <PersonOutlineRoundedIcon sx={{ color: '#ffffff', fontSize: { sm: 46, xs: 34 } }} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{ fontSize: { md: '1.15rem', xs: '1rem' }, fontWeight: 900, lineHeight: 1.15 }}
          >
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
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, mt: 0.7, opacity: 0.86 }}>
            Manage your profile, addresses, orders, and wallet
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          alignItems: 'center',
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            sm: 'repeat(2, minmax(120px, 1fr))',
            xs: 'repeat(2, minmax(96px, 1fr))',
          },
        }}
      >
        {stats.map((stat) => (
          <Stack
            aria-label={`Go to ${stat.label}`}
            component={Link}
            key={stat.label}
            spacing={1}
            sx={{
              alignItems: 'center',
              borderRadius: 1,
              color: storefrontColors.navy,
              textAlign: 'center',
              textDecoration: 'none',
              transition: 'transform 160ms ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                '& .profile-stat-circle': {
                  boxShadow: `0 14px 30px ${alpha(storefrontColors.accent, 0.2)}`,
                },
              },
              '&:focus-visible': {
                outline: `2px solid ${storefrontColors.accent}`,
                outlineOffset: 4,
              },
            }}
            to={stat.path}
          >
            <Box
              className="profile-stat-circle"
              sx={{
                alignItems: 'center',
                background: stat.prominent
                  ? `radial-gradient(circle at 35% 28%, #ffffff 0%, #fff4f1 42%, ${alpha(storefrontColors.accent, 0.14)} 100%)`
                  : '#f0f0f6',
                border: stat.prominent
                  ? `1px solid ${alpha(storefrontColors.accent, 0.24)}`
                  : '1px solid transparent',
                borderRadius: '50%',
                boxShadow: stat.prominent
                  ? `0 9px 24px ${alpha(storefrontColors.accent, 0.12)}, inset 0 0 0 6px ${alpha('#ffffff', 0.68)}`
                  : 'none',
                color: storefrontColors.navy,
                display: 'inline-flex',
                flexDirection: 'column',
                height: { md: 118, xs: 94 },
                justifyContent: 'center',
                transition: 'box-shadow 180ms ease',
                width: { md: 118, xs: 94 },
              }}
            >
              <Typography
                sx={{
                  color: '#e43224',
                  fontSize: stat.prominent
                    ? { md: '2.6rem', xs: '2.05rem' }
                    : { md: '1rem', xs: '0.82rem' },
                  fontVariantNumeric: 'tabular-nums',
                  fontWeight: 950,
                  letterSpacing: stat.prominent ? '-0.06em' : '-0.02em',
                  lineHeight: 0.95,
                }}
              >
                {stat.value}
              </Typography>
              <Typography
                sx={{
                  color: stat.prominent ? storefrontColors.navy : '#7a8190',
                  fontSize: { md: '0.58rem', xs: '0.5rem' },
                  fontWeight: 900,
                  letterSpacing: '0.16em',
                  lineHeight: 1,
                  mt: stat.prominent ? 1 : 0.8,
                }}
              >
                {stat.caption}
              </Typography>
            </Box>
            <Typography
              sx={{
                fontSize: { md: '1rem', xs: '0.9rem' },
                fontWeight: 900,
                letterSpacing: '-0.025em',
              }}
            >
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
      <Box
        sx={{
          backgroundColor: '#b5bfdc',
          borderRadius: 1,
          height: 20,
          left: -16,
          position: 'absolute',
          top: 0,
          width: 158,
        }}
      />
      <Box
        sx={{
          backgroundColor: '#ffffff',
          borderRadius: 999,
          height: 86,
          left: 35,
          position: 'absolute',
          top: 18,
          width: 13,
        }}
      />
      <Box
        sx={{
          backgroundColor: '#ffffff',
          borderRadius: 999,
          height: 86,
          left: 77,
          position: 'absolute',
          top: 18,
          width: 13,
        }}
      />
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
    <Box
      sx={{
        backgroundColor: '#d9deee',
        bottom: 0,
        height: 1,
        left: 0,
        position: 'absolute',
        width: '100%',
      }}
    />
  </Box>
);

const FavouriteProducts = ({ search }: { search: string }) => {
  const { addToCart } = useCart();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { favoriteIds, isLoading, toggleFavorite } = useFavorites();
  const [listProductId, setListProductId] = useState<string | null>(null);
  const [selectedListId, setSelectedListId] = useState('');
  const productsQuery = useQuery({
    queryFn: ({ signal }) => productApi.getProducts({ signal }),
    queryKey: ['products'],
  });
  const listsQuery = useQuery({
    queryFn: ({ signal }) => shoppingListsApi.list({ signal }),
    queryKey: ['account', 'shopping-lists'],
  });
  const addToListMutation = useMutation({
    mutationFn: ({ listId, productId }: { listId: string; productId: string }) =>
      shoppingListsApi.toggleProduct(listId, productId),
    onError: (error) => toast.error(toApiError(error).message),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['account', 'shopping-lists'] });
      setListProductId(null);
      setSelectedListId('');
      toast.success('Shopping list updated.');
    },
  });
  const normalizedSearch = search.trim().toLowerCase();
  const favouriteProducts = (productsQuery.data ?? []).filter(
    (product) =>
      favoriteIds.includes(product.id) &&
      (!normalizedSearch ||
        [product.name, product.description, product.sku].some((value) =>
          value.toLowerCase().includes(normalizedSearch),
        )),
  );

  if (isLoading || productsQuery.isLoading) {
    return <Typography sx={{ mt: 3 }}>Loading favourites…</Typography>;
  }

  if (!favouriteProducts.length) {
    return (
      <Stack spacing={2} sx={{ alignItems: 'center', minHeight: 320, pt: 6, textAlign: 'center' }}>
        <EmptyListIllustration />
        <Typography sx={{ color: storefrontColors.navy, fontSize: '1.3rem', fontWeight: 900 }}>
          {normalizedSearch ? 'No matching favourites' : 'No favourites yet'}
        </Typography>
        <Button component={Link} to={routePaths.catalog}>
          Browse products
        </Button>
      </Stack>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Box
        sx={{
          display: 'grid',
          gap: 2.2,
          gridTemplateColumns: {
            lg: 'repeat(3, minmax(0, 1fr))',
            sm: 'repeat(2, minmax(0, 1fr))',
            xs: '1fr',
          },
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
                onClick={() => toggleFavorite(product.id)}
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
                <Typography
                  sx={{
                    color: storefrontColors.muted,
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    mt: 0.6,
                  }}
                >
                  {product.description}
                </Typography>
              </Box>
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography
                  sx={{ color: storefrontColors.navy, fontSize: '1.1rem', fontWeight: 900 }}
                >
                  {formatCurrency(product.price, product.currency)}
                </Typography>
                <Button
                  onClick={() => addToCart(product)}
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
                  {t('Add to Cart')}
                </Button>
              </Stack>
              <Button
                disabled={!listsQuery.data?.length}
                onClick={() => setListProductId(product.id)}
                sx={{ fontWeight: 800, textTransform: 'none' }}
              >
                {listsQuery.data?.length ? 'Add to shopping list' : 'Create a shopping list first'}
              </Button>
            </Stack>
          </Box>
        ))}
      </Box>
      <Dialog
        fullWidth
        maxWidth="xs"
        onClose={() => setListProductId(null)}
        open={Boolean(listProductId)}
      >
        <DialogTitle>Add to shopping list</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Shopping list"
            onChange={(event) => setSelectedListId(event.target.value)}
            select
            sx={{ mt: 1 }}
            value={selectedListId}
          >
            {(listsQuery.data ?? []).map((list) => (
              <MenuItem key={list.id} value={list.id}>
                {list.name}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setListProductId(null)}>Cancel</Button>
          <Button
            disabled={!selectedListId || !listProductId || addToListMutation.isPending}
            onClick={() =>
              listProductId &&
              addToListMutation.mutate({ listId: selectedListId, productId: listProductId })
            }
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const ShoppingListsContent = ({ search }: { search: string }) => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const listsQuery = useQuery({
    queryFn: ({ signal }) => shoppingListsApi.list({ signal }),
    queryKey: ['account', 'shopping-lists'],
  });
  const createMutation = useMutation({
    mutationFn: shoppingListsApi.create,
    onError: (error) => toast.error(toApiError(error).message),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['account', 'shopping-lists'] });
      setDialogOpen(false);
      setName('');
      toast.success('Shopping list created.');
    },
  });
  const deleteMutation = useMutation({
    mutationFn: shoppingListsApi.remove,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['account', 'shopping-lists'] });
      toast.success('Shopping list deleted.');
    },
  });
  const normalizedSearch = search.trim().toLowerCase();
  const lists = (listsQuery.data ?? []).filter((list) =>
    list.name.toLowerCase().includes(normalizedSearch),
  );

  return (
    <Box sx={{ mt: 3 }}>
      <Button
        onClick={() => setDialogOpen(true)}
        sx={{
          backgroundColor: storefrontColors.navy,
          borderRadius: 999,
          color: '#fff',
          fontWeight: 900,
          px: 3,
          textTransform: 'none',
        }}
      >
        Create new list
      </Button>
      {lists.length ? (
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { md: 'repeat(2, 1fr)', xs: '1fr' },
            mt: 3,
          }}
        >
          {lists.map((list) => (
            <Box
              key={list.id}
              sx={{ border: `1px solid ${storefrontColors.border}`, borderRadius: 2, p: 2.5 }}
            >
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography
                    sx={{ color: storefrontColors.navy, fontSize: '1.1rem', fontWeight: 900 }}
                  >
                    {list.name}
                  </Typography>
                  <Typography color="text.secondary">{list.productIds.length} items</Typography>
                </Box>
                <IconButton
                  aria-label={`Delete ${list.name}`}
                  onClick={() => deleteMutation.mutate(list.id)}
                >
                  <DeleteOutlineRoundedIcon />
                </IconButton>
              </Stack>
            </Box>
          ))}
        </Box>
      ) : (
        <Stack spacing={2} sx={{ alignItems: 'center', minHeight: 320, pt: 6 }}>
          <EmptyListIllustration type="lists" />
          <Typography sx={{ color: storefrontColors.navy, fontWeight: 900 }}>
            {normalizedSearch ? 'No matching shopping lists' : 'No shopping lists yet'}
          </Typography>
        </Stack>
      )}
      <Dialog fullWidth maxWidth="xs" onClose={() => setDialogOpen(false)} open={dialogOpen}>
        <DialogTitle>Create shopping list</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="List name"
            onChange={(event) => setName(event.target.value)}
            sx={{ mt: 1 }}
            value={name}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            disabled={!name.trim() || createMutation.isPending}
            onClick={() => createMutation.mutate(name.trim())}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const CommerceContent = ({ activePage }: { activePage: AccountPageConfig }) => {
  const showTabs =
    activePage.path === routePaths.accountFavourites ||
    activePage.path === routePaths.accountShoppingList;
  const isShoppingList = activePage.path === routePaths.accountShoppingList;
  const isFavourites = activePage.path === routePaths.accountFavourites;
  const [search, setSearch] = useState('');

  return (
    <Box sx={{ maxWidth: 1180, mt: 4.8 }}>
      {showTabs ? (
        <Stack
          direction="row"
          spacing={6}
          sx={{ borderBottom: `1px solid ${storefrontColors.border}` }}
        >
          {[accountPageConfigs.favourites, accountPageConfigs.shoppingList].map((page) => {
            const isActive = page.path === activePage.path;

            return (
              <Box
                component={Link}
                key={page.path}
                sx={{
                  borderBottom: isActive
                    ? `3px solid ${storefrontColors.navy}`
                    : '3px solid transparent',
                  px: 2,
                  py: 1.3,
                }}
                to={page.path}
              >
                <Typography
                  sx={{
                    color: storefrontColors.navy,
                    fontSize: '1.25rem',
                    fontWeight: isActive ? 900 : 800,
                  }}
                >
                  {page.title}
                </Typography>
              </Box>
            );
          })}
        </Stack>
      ) : (
        <Typography sx={{ color: storefrontColors.navy, fontSize: '1.45rem', fontWeight: 900 }}>
          {activePage.title}
        </Typography>
      )}

      <TextField
        fullWidth
        onChange={(event) => setSearch(event.target.value)}
        placeholder={activePage.searchPlaceholder ?? `Search ${activePage.title.toLowerCase()}`}
        slotProps={{ input: { endAdornment: <SearchRoundedIcon /> } }}
        sx={{ mt: 3 }}
        value={search}
      />

      {isFavourites ? (
        <FavouriteProducts search={search} />
      ) : isShoppingList ? (
        <ShoppingListsContent search={search} />
      ) : (
        <Stack
          spacing={2.6}
          sx={{ alignItems: 'center', minHeight: 430, pt: { md: 5, xs: 4 }, textAlign: 'center' }}
        >
          <EmptyListIllustration type={isShoppingList ? 'lists' : 'favourites'} />
          <Typography
            sx={{
              color: storefrontColors.navy,
              fontSize: { md: '1.45rem', xs: '1.2rem' },
              fontWeight: 900,
            }}
          >
            {activePage.emptyTitle ?? `No ${activePage.title.toLowerCase()} yet`}
          </Typography>
          <Typography sx={{ color: storefrontColors.muted, maxWidth: 520 }}>
            {activePage.description}
          </Typography>
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
      <CardGiftcardOutlinedIcon
        sx={{ color: storefrontColors.navy, fontSize: 38, left: 17, position: 'absolute', top: 28 }}
      />
      <Box
        sx={{
          borderTop: `3px dashed ${storefrontColors.navy}`,
          bottom: 20,
          left: 10,
          position: 'absolute',
          width: 50,
        }}
      />
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
    <Box
      sx={{
        backgroundColor: '#d9deee',
        bottom: 18,
        height: 1,
        left: 10,
        position: 'absolute',
        width: 230,
      }}
    />
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
      <Typography sx={{ color: storefrontColors.navy, fontSize: '1.25rem', fontWeight: 900 }}>
        No Vouchers Found
      </Typography>
    </Stack>
  </Box>
);

const WalletPanel = ({ children, title }: { children: ReactElement; title: string }) => (
  <Box sx={{ border: `1px solid ${storefrontColors.border}`, borderRadius: 1, overflow: 'hidden' }}>
    <Box sx={{ backgroundColor: '#f3f4f9', px: 2.2, py: 1.35 }}>
      <Typography sx={{ color: storefrontColors.navy, fontSize: '1.25rem', fontWeight: 900 }}>
        {title}
      </Typography>
    </Box>
    <Box sx={{ backgroundColor: '#ffffff', p: { md: 2.2, xs: 1.5 } }}>{children}</Box>
  </Box>
);

const WalletAccordionRow = ({ title, to }: { title: string; to: string }) => (
  <Stack
    aria-label={`Open ${title}`}
    component={Link}
    direction="row"
    to={to}
    sx={{
      border: `1px solid ${storefrontColors.border}`,
      borderRadius: 1,
      color: 'inherit',
      cursor: 'pointer',
      minHeight: 66,
      overflow: 'hidden',
      textDecoration: 'none',
      transition: 'border-color 160ms ease, box-shadow 160ms ease',
      '&:hover': {
        borderColor: alpha(storefrontColors.navy, 0.35),
        boxShadow: `0 12px 24px ${alpha(storefrontColors.navyDark, 0.08)}`,
      },
    }}
  >
    <Box sx={{ alignItems: 'center', display: 'flex', flex: 1, px: 2.2 }}>
      <Typography sx={{ color: storefrontColors.navy, fontSize: '1.1rem', fontWeight: 900 }}>
        {title}
      </Typography>
    </Box>
    <Box
      sx={{
        alignItems: 'center',
        backgroundColor: '#f1f2f7',
        borderLeft: `1px solid ${storefrontColors.border}`,
        color: storefrontColors.navy,
        display: 'flex',
        gap: 1,
        justifyContent: 'center',
        px: 1.5,
        width: { md: 290, xs: 86 },
      }}
    >
      <Typography sx={{ display: { md: 'block', xs: 'none' }, fontWeight: 900 }}>
        View terms
      </Typography>
      <PlayArrowRoundedIcon sx={{ fontSize: 34 }} />
    </Box>
  </Stack>
);

const WalletContent = () => {
  const queryClient = useQueryClient();
  const user = useSelector((state: RootState) => state.auth.user);
  const { wallet } = useWallet(user);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [promoCode, setPromoCode] = useState('');

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
      await queryClient.invalidateQueries({ queryKey: ['wallet', 'summary'] });
      if (result.data.paymentRedirectUrl) {
        window.location.assign(result.data.paymentRedirectUrl);
      }
    },
  });

  const serverWallet = walletSummaryQuery.data?.wallet;
  const walletBalance = serverWallet?.balance ?? wallet.balance;
  const reservedBalance = serverWallet?.reservedBalance ?? wallet.reservedBalance;
  const availableBalance = Math.max(0, walletBalance - reservedBalance);
  const topUpValue = Number(topUpAmount);
  const recentTopUps = walletSummaryQuery.data?.recentTopUps ?? [];
  const pendingTopUps = recentTopUps.filter((request) => request.status === 'pending');
  const transactions = serverWallet?.transactions ?? wallet.transactions;

  const submitTopUpRequest = () => {
    if (!Number.isFinite(topUpValue) || topUpValue < 100) {
      toast.error('Top-up amount must be at least 100 MMK.');
      return;
    }

    void submitTopUpMutation.mutateAsync({
      amount: topUpValue,
      promoCode: promoCode.trim() || undefined,
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

      <Box
        sx={{ border: `1px solid ${storefrontColors.navy}`, borderRadius: 0.5, overflow: 'hidden' }}
      >
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
          <Typography sx={{ fontSize: '1.35rem', fontWeight: 900 }}>
            {formatWalletAmount(walletBalance)}
          </Typography>
          <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center' }}>
            <AccountBalanceWalletOutlinedIcon />
            <Typography sx={{ fontSize: '1.05rem', fontWeight: 900 }}>My Wallet</Typography>
          </Stack>
        </Stack>
        <Box sx={{ display: 'grid', gridTemplateColumns: { sm: '1fr 1fr', xs: '1fr' } }}>
          <Stack
            spacing={0.6}
            sx={{
              alignItems: 'center',
              borderRight: { sm: `1px solid ${storefrontColors.navy}`, xs: 0 },
              py: 2.2,
            }}
          >
            <Typography sx={{ color: '#55565c', fontSize: '1.05rem', fontWeight: 700 }}>
              Reserved For Regular:
            </Typography>
            <Typography sx={{ color: '#55565c', fontWeight: 800 }}>
              {formatWalletAmount(reservedBalance)}
            </Typography>
          </Stack>
          <Stack spacing={0.6} sx={{ alignItems: 'center', py: 2.2 }}>
            <Typography sx={{ color: storefrontColors.navy, fontSize: '1.05rem', fontWeight: 900 }}>
              Available Balance:
            </Typography>
            <Typography sx={{ color: storefrontColors.navy, fontWeight: 900 }}>
              {formatWalletAmount(availableBalance)}
            </Typography>
          </Stack>
        </Box>
      </Box>

      {pendingTopUps.length ? (
        <Box
          sx={{
            backgroundColor: '#fff8e1',
            border: `1px solid ${storefrontColors.border}`,
            borderRadius: 1,
            px: 2,
            py: 1.3,
          }}
        >
          <Typography sx={{ color: storefrontColors.navy, fontWeight: 900 }}>
            Wallet top-up payment pending
          </Typography>
          <Typography sx={{ color: '#55565c', fontWeight: 700, mt: 0.4 }}>
            {pendingTopUps.length} payment{pendingTopUps.length > 1 ? 's are' : ' is'} waiting
            for gateway confirmation. Your wallet balance updates automatically after successful
            payment.
          </Typography>
        </Box>
      ) : null}

      <WalletPanel title="Request Wallet Top-up">
        <Stack spacing={2.2}>
          <Box
            sx={{
              backgroundColor: '#f6f8fc',
              border: `1px solid ${storefrontColors.border}`,
              borderRadius: 1,
              p: 2,
            }}
          >
            <Typography sx={{ color: storefrontColors.navy, fontWeight: 900 }}>
              Pay securely online
            </Typography>
            <Typography sx={{ color: storefrontColors.muted, fontWeight: 700, mt: 1.4 }}>
              Enter the amount you want to load and continue to the online payment gateway. No
              receipt upload or manual review is required.
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { sm: 'repeat(2, minmax(0, 1fr))', xs: '1fr' },
            }}
          >
            <TextField
              label="Top-up amount"
              onChange={(event) => setTopUpAmount(event.target.value)}
              required
              type="number"
              value={topUpAmount}
            />
            <TextField
              label="Promo code"
              onChange={(event) => setPromoCode(event.target.value)}
              value={promoCode}
            />
          </Box>

          <Button
            disabled={submitTopUpMutation.isPending || topUpValue < 100}
            onClick={submitTopUpRequest}
            sx={{
              alignSelf: 'flex-start',
              backgroundColor: storefrontColors.navy,
              borderRadius: 999,
              color: '#ffffff',
              fontWeight: 900,
              px: 4,
              py: 1.15,
              textTransform: 'none',
              '&:hover': { backgroundColor: storefrontColors.navyDark },
              '&.Mui-disabled': { backgroundColor: '#c9cdd6', color: '#ffffff' },
            }}
          >
            {submitTopUpMutation.isPending ? 'Opening payment...' : 'Pay online and load wallet'}
          </Button>
        </Stack>
      </WalletPanel>

      <WalletPanel title="Top-up Requests">
        {recentTopUps.length ? (
          <Stack spacing={1.2}>
            {recentTopUps.map((request) => (
              <Stack
                direction={{ sm: 'row', xs: 'column' }}
                key={request.id}
                spacing={1}
                sx={{
                  border: `1px solid ${storefrontColors.border}`,
                  borderRadius: 1,
                  justifyContent: 'space-between',
                  px: 1.5,
                  py: 1.2,
                }}
              >
                <Box>
                  <Typography sx={{ color: storefrontColors.navy, fontWeight: 900 }}>
                    {formatWalletAmount(request.amount)} via{' '}
                    {request.paymentGateway ?? request.paymentMethod ?? 'online payment'}
                  </Typography>
                  <Typography
                    sx={{ color: storefrontColors.muted, fontSize: '0.85rem', fontWeight: 700 }}
                  >
                    {new Date(request.createdAt).toLocaleString()}
                  </Typography>
                  {request.adminNote ? (
                    <Typography sx={{ color: storefrontColors.muted, mt: 0.4 }}>
                      {request.adminNote}
                    </Typography>
                  ) : null}
                </Box>
                <Chip
                  color={
                    request.status === 'approved'
                      ? 'success'
                      : request.status === 'rejected'
                        ? 'error'
                        : 'warning'
                  }
                  label={request.status}
                />
              </Stack>
            ))}
          </Stack>
        ) : (
          <Typography sx={{ color: storefrontColors.muted, fontWeight: 700 }}>
            No top-up requests yet.
          </Typography>
        )}
      </WalletPanel>

      <WalletPanel title="Mini Statement">
        {transactions.length ? (
          <Stack spacing={1.2}>
            {transactions.slice(0, 6).map((transaction, index) => (
              <Stack
                direction={{ sm: 'row', xs: 'column' }}
                key={`${transaction.createdAt}-${index}`}
                spacing={0.8}
                sx={{
                  border: `1px solid ${storefrontColors.border}`,
                  borderRadius: 1,
                  justifyContent: 'space-between',
                  px: 1.5,
                  py: 1.2,
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ color: storefrontColors.navy, fontWeight: 900 }}>
                    {transaction.description}
                  </Typography>
                  <Typography
                    sx={{ color: storefrontColors.muted, fontSize: '0.85rem', fontWeight: 700 }}
                  >
                    {new Date(transaction.createdAt).toLocaleString()}
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    color:
                      transaction.direction === 'credit'
                        ? storefrontColors.success
                        : storefrontColors.navy,
                    flexShrink: 0,
                    fontWeight: 900,
                  }}
                >
                  {transaction.direction === 'credit' ? '+' : '-'}{' '}
                  {formatWalletAmount(transaction.amount)}
                </Typography>
              </Stack>
            ))}
          </Stack>
        ) : (
          <Typography sx={{ color: storefrontColors.muted, fontWeight: 700 }}>
            No wallet activity yet.
          </Typography>
        )}
      </WalletPanel>
      <WalletAccordionRow title="About AV's Store Wallet" to={routePaths.accountWalletTerms} />
    </Stack>
  );
};

const walletTermsSections = [
  {
    title: "About AV's Store Wallet",
    items: [
      "AV's Store Wallet is a prepaid balance that customers can use for purchases on AV's Store.",
      'Wallet balance may come from online top-ups, approved shop cash top-ups, refunds, adjustments, or promotional credits.',
      'Wallet services are available only for AV’s Store customers and are intended for grocery purchases through AV’s Store.',
    ],
  },
  {
    title: 'Top-up and Balance',
    items: [
      'Online wallet top-ups are credited after successful payment gateway confirmation.',
      'Cash top-ups made at the shop may be added by the admin team after the cash payment is received.',
      'The available balance shown in My Wallet is the amount currently usable for orders after any reserved amount is deducted.',
    ],
  },
  {
    title: 'Using Wallet for Orders',
    items: [
      'Wallet balance can be used during checkout when wallet payment is available.',
      'If the wallet balance is not enough for the full order amount, the customer may need to top up or choose another available payment method.',
      'AV’s Store may reserve wallet balance for pending orders until payment and order status are confirmed.',
    ],
  },
  {
    title: 'Refunds, Promotions, and Adjustments',
    items: [
      'Eligible refunds may be returned to the wallet depending on the original payment method and order handling process.',
      'Promotional wallet credits may have campaign-specific rules, validity, or usage limits.',
      'AV’s Store may correct wallet balances if there is a duplicate transaction, technical issue, failed payment confirmation, or manual entry mistake.',
    ],
  },
  {
    title: 'Security and Responsibility',
    items: [
      'Customers should keep their account login details secure and contact AV’s Store support if they notice unusual wallet activity.',
      'Wallet balance is linked to the customer account and cannot be transferred to another customer unless AV’s Store approves it.',
      'AV’s Store may temporarily hold, reverse, or review wallet activity if fraud, misuse, payment failure, or system error is suspected.',
    ],
  },
  {
    title: 'Support',
    items: [
      'For wallet questions, customers can contact support@avsstoreonline.com or call +95-9953055682.',
      'Please include your registered phone or email, order number if applicable, and the wallet transaction details when contacting support.',
    ],
  },
];

const WalletTermsContent = () => (
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
      <Typography sx={{ fontSize: '1.25rem', fontWeight: 900 }}>
        Wallet Terms & Conditions
      </Typography>
    </Box>

    <Box
      sx={{
        backgroundColor: '#ffffff',
        border: `1px solid ${storefrontColors.border}`,
        borderRadius: 1,
        p: { md: 3, xs: 2 },
      }}
    >
      <Stack spacing={2.5}>
        <Typography sx={{ color: storefrontColors.muted, fontWeight: 700, lineHeight: 1.7 }}>
          These terms explain how AV&apos;s Store Wallet works for top-ups, payments, refunds, and
          customer support. The wallet is provided for convenient grocery shopping with AV&apos;s
          Store.
        </Typography>

        {walletTermsSections.map((section) => (
          <Box key={section.title}>
            <Typography sx={{ color: storefrontColors.navy, fontSize: '1.08rem', fontWeight: 900 }}>
              {section.title}
            </Typography>
            <Stack component="ul" spacing={1} sx={{ color: '#4f535b', m: 0, mt: 1, pl: 2.5 }}>
              {section.items.map((item) => (
                <Typography component="li" key={item} sx={{ fontWeight: 700, lineHeight: 1.65 }}>
                  {item}
                </Typography>
              ))}
            </Stack>
          </Box>
        ))}

        <Box
          sx={{
            backgroundColor: '#f6f8fc',
            border: `1px solid ${storefrontColors.border}`,
            borderRadius: 1,
            p: 2,
          }}
        >
          <Typography sx={{ color: storefrontColors.navy, fontWeight: 900 }}>
            Last updated: October 5, 2026
          </Typography>
          <Typography sx={{ color: storefrontColors.muted, fontWeight: 700, mt: 0.5 }}>
            AV&apos;s Store may update these wallet terms when wallet features, payment options, or
            service policies change.
          </Typography>
        </Box>

        <Button
          component={Link}
          to={routePaths.accountWallet}
          sx={{
            alignSelf: 'flex-start',
            backgroundColor: storefrontColors.navy,
            borderRadius: 999,
            color: '#ffffff',
            fontWeight: 900,
            px: 3.5,
            py: 1.1,
            textTransform: 'none',
            '&:hover': { backgroundColor: storefrontColors.navyDark },
          }}
        >
          Back to wallet
        </Button>
      </Stack>
    </Box>
  </Stack>
);

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

const completedOrderStatuses = new Set(['delivered', 'fulfilled', 'cancelled']);

const escapeInvoiceHtml = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const invoiceFilename = (order: Order) =>
  `invoice-${order.orderNumber.replace(/[^a-z0-9-]/gi, '-').toLowerCase()}.html`;

const downloadOrderInvoice = async (order: Order) => {
  let embeddedLogo: string;
  try {
    const response = await fetch(logoImage, { cache: 'force-cache' });
    if (!response.ok) throw new Error('Invoice logo could not be loaded');
    const logoBlob = await response.blob();
    embeddedLogo = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') resolve(reader.result);
        else reject(new Error('Invoice logo could not be embedded'));
      };
      reader.onerror = () => reject(new Error('Invoice logo could not be read'));
      reader.readAsDataURL(logoBlob);
    });
  } catch {
    toast.error('Unable to load the invoice logo. Please try downloading again.');
    return;
  }
  const subtotal = order.subtotalAmount ?? order.lineItems?.reduce((sum, item) => sum + item.lineTotal, 0);
  const deliveryFee = order.deliveryFee ?? 0;
  const promoDiscount = order.promoDiscountAmount ?? 0;
  const lineItems = order.lineItems?.length
    ? order.lineItems.map((item) => ({
        lineTotal: formatCurrency(item.lineTotal, order.currency),
        name: item.name,
        quantity: String(item.quantity),
        sku: item.sku,
        unitPrice: formatCurrency(item.unitPrice, order.currency),
      }))
    : order.productDetails?.map((product) => ({
        lineTotal: '',
        name: product.name,
        quantity: '-',
        sku: product.sku,
        unitPrice: '',
      })) ?? [];
  const itemRows = lineItems
    .map(
      (item) => `
        <tr>
          <td>
            <strong>${escapeInvoiceHtml(item.name)}</strong>
            ${item.sku ? `<span>SKU ${escapeInvoiceHtml(item.sku)}</span>` : ''}
          </td>
          <td>${escapeInvoiceHtml(item.quantity)}</td>
          <td>${escapeInvoiceHtml(item.unitPrice)}</td>
          <td>${escapeInvoiceHtml(item.lineTotal)}</td>
        </tr>`,
    )
    .join('');
  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice ${escapeInvoiceHtml(order.orderNumber)}</title>
  <style>
    body { color: #20242a; font-family: Arial, sans-serif; margin: 0; padding: 32px; }
    .invoice { border: 1px solid #e4e7ef; margin: 0 auto; max-width: 860px; padding: 32px; }
    .header { align-items: flex-start; display: flex; justify-content: space-between; gap: 24px; }
    .brand { align-items: center; display: flex; gap: 16px; }
    .brand img { height: 72px; object-fit: contain; width: 92px; }
    h1, h2, p { margin: 0; }
    h1 { color: #c41a1a; font-size: 28px; }
    h2 { color: #1f2937; font-size: 16px; margin-bottom: 8px; }
    .muted, span { color: #697180; display: block; font-size: 13px; margin-top: 4px; }
    .grid { display: grid; gap: 20px; grid-template-columns: 1fr 1fr; margin-top: 32px; }
    .box { background: #fafbfe; border: 1px solid #e4e7ef; border-radius: 8px; padding: 16px; }
    table { border-collapse: collapse; margin-top: 28px; width: 100%; }
    th { background: #c41a1a; color: #fff; font-size: 13px; text-align: left; }
    th, td { border-bottom: 1px solid #e4e7ef; padding: 12px; vertical-align: top; }
    td:nth-child(2), td:nth-child(3), td:nth-child(4), th:nth-child(2), th:nth-child(3), th:nth-child(4) { text-align: right; }
    .totals { margin-left: auto; margin-top: 24px; max-width: 340px; }
    .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
    .grand { border-top: 2px solid #c41a1a; color: #c41a1a; font-size: 18px; font-weight: 800; margin-top: 8px; padding-top: 12px; }
    .footer { color: #697180; font-size: 12px; margin-top: 36px; text-align: center; }
    @media print { body { padding: 0; } .invoice { border: 0; } }
  </style>
</head>
<body>
  <main class="invoice">
    <section class="header">
      <div class="brand">
        <img alt="AV's Store" src="${escapeInvoiceHtml(embeddedLogo)}" />
        <div>
          <h1>AV's Store</h1>
          <p class="muted">Yangon, Myanmar</p>
          <p class="muted">Phone: +95-9953055682</p>
          <p class="muted">Email: support@avsstoreonline.com</p>
        </div>
      </div>
      <div>
        <h1>Invoice</h1>
        <p class="muted">Invoice #: ${escapeInvoiceHtml(order.orderNumber)}</p>
        <p class="muted">Date: ${escapeInvoiceHtml(formatDate(order.createdAt))}</p>
      </div>
    </section>
    <section class="grid">
      <div class="box">
        <h2>Bill To</h2>
        <p>${escapeInvoiceHtml(order.customerName)}</p>
        <p class="muted">${escapeInvoiceHtml(order.customerEmail ?? 'N/A')}</p>
        <p class="muted">${escapeInvoiceHtml(order.customerPhone ?? 'N/A')}</p>
      </div>
      <div class="box">
        <h2>Delivery</h2>
        <p>${escapeInvoiceHtml(order.deliveryAddress ?? 'N/A')}</p>
        <p class="muted">${escapeInvoiceHtml([order.region, order.township].filter(Boolean).join(' / ') || 'N/A')}</p>
      </div>
      <div class="box">
        <h2>Order</h2>
        <p>Status: ${escapeInvoiceHtml(order.status)}</p>
        <p class="muted">Items: ${escapeInvoiceHtml(order.itemCount)}</p>
      </div>
      <div class="box">
        <h2>Payment</h2>
        <p>${escapeInvoiceHtml(paymentMethodLabel(order))}</p>
        <p class="muted">Status: ${escapeInvoiceHtml(order.paymentStatus ?? 'Pending')}</p>
      </div>
    </section>
    <table>
      <thead>
        <tr><th>Item</th><th>Qty</th><th>Unit price</th><th>Total</th></tr>
      </thead>
      <tbody>${itemRows || '<tr><td colspan="4">Order items are not available.</td></tr>'}</tbody>
    </table>
    <section class="totals">
      ${subtotal !== undefined ? `<div class="total-row"><span>Subtotal</span><strong>${escapeInvoiceHtml(formatCurrency(subtotal, order.currency))}</strong></div>` : ''}
      ${deliveryFee ? `<div class="total-row"><span>Delivery fee</span><strong>${escapeInvoiceHtml(formatCurrency(deliveryFee, order.currency))}</strong></div>` : ''}
      ${promoDiscount ? `<div class="total-row"><span>Promo discount</span><strong>-${escapeInvoiceHtml(formatCurrency(promoDiscount, order.currency))}</strong></div>` : ''}
      <div class="total-row grand"><span>Total</span><strong>${escapeInvoiceHtml(formatCurrency(order.totalAmount, order.currency))}</strong></div>
    </section>
    <p class="footer">Thank you for shopping with AV's Store.</p>
  </main>
</body>
</html>`;
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = invoiceFilename(order);
  link.click();
  URL.revokeObjectURL(url);
};

const OrdersContent = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const ordersQuery = useQuery({
    enabled: Boolean(user?.id),
    queryFn: ({ signal }) => orderApi.getOrders({ signal }),
    queryKey: ['orders', user?.id],
  });
  const productsQuery = useQuery({
    queryFn: ({ signal }) => productApi.getProducts({ signal }),
    queryKey: ['products'],
  });
  const loggedInEmail = user?.email.trim().toLowerCase() ?? '';
  const orders = (ordersQuery.data ?? [])
    .filter((order) => order.customerEmail?.trim().toLowerCase() === loggedInEmail)
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
  const upcomingOrders = orders.filter((order) => !completedOrderStatuses.has(order.status));
  const pastOrders = orders.filter((order) => completedOrderStatuses.has(order.status));
  const tabOrders = activeTab === 'upcoming' ? upcomingOrders : pastOrders;
  const normalizedSearch = search.trim().toLowerCase();
  const visibleOrders = normalizedSearch
    ? tabOrders.filter((order) =>
        [
          order.orderNumber,
          order.customerName,
          order.deliveryAddress,
          order.paymentMethod,
          order.status,
        ].some((value) => value?.toLowerCase().includes(normalizedSearch)),
      )
    : tabOrders;
  const catalogProductById = new Map((productsQuery.data ?? []).map((product) => [product.id, product]));

  const productFromLineItem = (
    item: NonNullable<Order['lineItems']>[number],
    currency: string,
  ): Product => ({
    categoryId: '',
    currency,
    description: item.name,
    id: item.productId,
    imageUrl: item.imageUrl ?? '',
    inventory: item.quantity,
    name: item.name,
    price: item.unitPrice,
    rating: 0,
    sku: item.sku,
    slug: item.sku.toLowerCase(),
    tags: [],
    tenantId: 'AV',
  });

  const handleReorder = (order: Order) => {
    const productsToAdd: Product[] = [];

    if (order.lineItems?.length) {
      order.lineItems.forEach((item) => {
        const product = catalogProductById.get(item.productId) ?? productFromLineItem(item, order.currency);
        for (let index = 0; index < item.quantity; index += 1) {
          productsToAdd.push(product);
        }
      });
    } else if (order.productDetails?.length) {
      order.productDetails.forEach((item) => {
        const product = catalogProductById.get(item.productId);
        if (product) productsToAdd.push(product);
      });
    }

    if (!productsToAdd.length) {
      toast.error('This order does not have enough item details to reorder.');
      return;
    }

    productsToAdd.forEach(addToCart);
    toast.success(`${productsToAdd.length} item${productsToAdd.length === 1 ? '' : 's'} added to cart.`);
    void navigate(routePaths.cart);
  };

  return (
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
              {
                label: 'Upcoming',
                value: String(upcomingOrders.length),
                helper: 'Active orders and deliveries',
              },
              {
                label: 'Past orders',
                value: String(pastOrders.length),
                helper: 'Completed and cancelled orders',
              },
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
                <Typography
                  sx={{ color: storefrontColors.muted, fontSize: '0.85rem', fontWeight: 800 }}
                >
                  {item.label}
                </Typography>
                <Typography
                  sx={{
                    color: storefrontColors.navy,
                    fontSize: '1.8rem',
                    fontWeight: 900,
                    lineHeight: 1.1,
                    mt: 0.4,
                  }}
                >
                  {item.value}
                </Typography>
                <Typography
                  sx={{ color: '#697180', fontSize: '0.85rem', fontWeight: 700, mt: 0.5 }}
                >
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
            {[
              { label: 'Upcoming Orders', value: 'upcoming' as const },
              { label: 'Past Orders', value: 'past' as const },
            ].map((tab) => (
              <Box
                component="button"
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                sx={{
                  backgroundColor: activeTab === tab.value ? '#ffffff' : 'transparent',
                  border: 0,
                  borderRadius: 999,
                  boxShadow:
                    activeTab === tab.value
                      ? `0 8px 18px ${alpha(storefrontColors.navyDark, 0.1)}`
                      : 'none',
                  cursor: 'pointer',
                  px: 2.4,
                  py: 1,
                }}
              >
                <Typography
                  sx={{ color: storefrontColors.navy, fontSize: '0.98rem', fontWeight: 900 }}
                >
                  {tab.label}
                </Typography>
              </Box>
            ))}
          </Stack>

          <TextField
            fullWidth
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by order number, status, payment, or address"
            slotProps={{
              input: {
                endAdornment: <SearchRoundedIcon sx={{ color: storefrontColors.navy }} />,
              },
            }}
            sx={{ mt: 3 }}
            value={search}
          />

          {ordersQuery.isLoading ? (
            <Typography sx={{ color: storefrontColors.muted, fontWeight: 700, mt: 3 }}>
              Loading your orders…
            </Typography>
          ) : visibleOrders.length ? (
            <Stack spacing={1.5} sx={{ mt: 3 }}>
              {visibleOrders.map((order) => (
                <Box
                  aria-label={`View details for order ${order.orderNumber}`}
                  component="button"
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  sx={{
                    backgroundColor: '#ffffff',
                    border: `1px solid ${storefrontColors.border}`,
                    borderRadius: 1.5,
                    boxShadow: `0 10px 24px ${alpha(storefrontColors.navyDark, 0.05)}`,
                    color: 'inherit',
                    cursor: 'pointer',
                    p: { md: 2.2, xs: 1.5 },
                    textAlign: 'left',
                    transition:
                      'border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease',
                    width: '100%',
                    '&:hover': {
                      borderColor: alpha(storefrontColors.navy, 0.45),
                      boxShadow: `0 14px 30px ${alpha(storefrontColors.navyDark, 0.1)}`,
                      transform: 'translateY(-1px)',
                    },
                    '&:focus-visible': {
                      outline: `3px solid ${alpha(storefrontColors.navy, 0.25)}`,
                      outlineOffset: 2,
                    },
                  }}
                >
                  <Stack
                    direction={{ md: 'row', xs: 'column' }}
                    spacing={2}
                    sx={{ justifyContent: 'space-between' }}
                  >
                    <Stack spacing={0.7}>
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ alignItems: 'center', flexWrap: 'wrap' }}
                      >
                        <Typography
                          sx={{
                            color: storefrontColors.navy,
                            fontSize: '1.05rem',
                            fontWeight: 900,
                          }}
                        >
                          {order.orderNumber}
                        </Typography>
                        <OrderStatusChip status={order.status} />
                      </Stack>
                      <Typography
                        sx={{ color: storefrontColors.muted, fontSize: '0.88rem', fontWeight: 700 }}
                      >
                        Placed {formatDate(order.createdAt)} · {order.itemCount} item
                        {order.itemCount === 1 ? '' : 's'}
                      </Typography>
                      {order.deliveryAddress ? (
                        <Typography sx={{ color: '#55565c', fontSize: '0.9rem' }}>
                          {order.deliveryAddress}
                        </Typography>
                      ) : null}
                    </Stack>
                    <Stack spacing={0.5} sx={{ alignItems: { md: 'flex-end', xs: 'flex-start' } }}>
                      <Typography
                        sx={{ color: storefrontColors.navy, fontSize: '1.1rem', fontWeight: 900 }}
                      >
                        {formatCurrency(order.totalAmount, order.currency)}
                      </Typography>
                      <Typography
                        sx={{ color: storefrontColors.muted, fontSize: '0.85rem', fontWeight: 700 }}
                      >
                        {paymentMethodLabel(order)}
                        {order.paymentStatus ? ` · ${order.paymentStatus}` : ''}
                      </Typography>
                      <Box
                        component="span"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleReorder(order);
                        }}
                        role="button"
                        sx={{
                          border: `1px solid ${alpha(storefrontColors.navy, 0.28)}`,
                          borderRadius: 999,
                          color: storefrontColors.navy,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          fontSize: '0.82rem',
                          fontWeight: 900,
                          mt: 0.5,
                          px: 1.5,
                          py: 0.55,
                        }}
                        tabIndex={0}
                      >
                        Purchase again
                      </Box>
                    </Stack>
                  </Stack>
                </Box>
              ))}
            </Stack>
          ) : (
            <Box
              sx={{
                alignItems: 'center',
                backgroundColor: '#ffffff',
                border: `1px solid ${storefrontColors.border}`,
                borderRadius: 1,
                display: 'flex',
                flexDirection: 'column',
                mt: 3,
                minHeight: 300,
                px: 2,
                py: 5,
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

              <Typography
                sx={{
                  color: storefrontColors.navy,
                  fontSize: { md: '1.45rem', xs: '1.2rem' },
                  fontWeight: 900,
                }}
              >
                {normalizedSearch ? 'No matching orders' : `No ${activeTab} orders`}
              </Typography>
              <Typography
                sx={{
                  color: storefrontColors.muted,
                  fontWeight: 700,
                  lineHeight: 1.55,
                  maxWidth: 480,
                  mt: 1,
                }}
              >
                When you place an order, delivery updates, payment details, and support options will
                appear here.
              </Typography>

              {!normalizedSearch && orders.length === 0 ? (
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
              ) : null}

              {!normalizedSearch && orders.length === 0 ? (
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
              ) : null}
            </Box>
          )}
        </Box>
      </Box>
      <Dialog
        fullWidth
        maxWidth="sm"
        onClose={() => setSelectedOrder(null)}
        open={Boolean(selectedOrder)}
      >
        <DialogTitle sx={{ color: storefrontColors.navy, fontWeight: 900 }}>
          <Stack
            direction={{ sm: 'row', xs: 'column' }}
            spacing={1.25}
            sx={{ alignItems: { sm: 'center', xs: 'flex-start' }, justifyContent: 'space-between' }}
          >
            <span>Order details</span>
            {selectedOrder ? (
              <Button
                onClick={() => downloadOrderInvoice(selectedOrder)}
                size="small"
                startIcon={<FileDownloadOutlinedIcon />}
                sx={{
                  borderColor: alpha(storefrontColors.navy, 0.35),
                  color: storefrontColors.navy,
                  fontWeight: 900,
                  textTransform: 'none',
                }}
                variant="outlined"
              >
                Download invoice
              </Button>
            ) : null}
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedOrder ? (
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              <Stack
                direction={{ sm: 'row', xs: 'column' }}
                spacing={1}
                sx={{
                  alignItems: { sm: 'center', xs: 'flex-start' },
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography sx={{ fontSize: '1.15rem', fontWeight: 900 }}>
                    {selectedOrder.orderNumber}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Placed {formatDate(selectedOrder.createdAt)}
                  </Typography>
                </Box>
                <OrderStatusChip status={selectedOrder.status} />
              </Stack>
              <Grid container spacing={2}>
                {[
                  { label: 'Customer', value: selectedOrder.customerName },
                  { label: 'Email', value: selectedOrder.customerEmail ?? 'N/A' },
                  { label: 'Phone', value: selectedOrder.customerPhone ?? 'N/A' },
                  {
                    label: 'Payment method',
                    value: paymentMethodLabel(selectedOrder),
                  },
                  {
                    label: 'Payment status',
                    value: selectedOrder.paymentStatus ?? 'Pending',
                  },
                  {
                    label: 'Items',
                    value: `${selectedOrder.itemCount} item${selectedOrder.itemCount === 1 ? '' : 's'}`,
                  },
                  {
                    label: 'Region / Township',
                    value:
                      [selectedOrder.region, selectedOrder.township].filter(Boolean).join(' / ') ||
                      'N/A',
                  },
                  {
                    label: 'Order total',
                    value: formatCurrency(selectedOrder.totalAmount, selectedOrder.currency),
                  },
                ].map((detail) => (
                  <Grid key={detail.label} size={{ sm: 6, xs: 12 }}>
                    <Typography color="text.secondary" variant="caption">
                      {detail.label}
                    </Typography>
                    <Typography sx={{ fontWeight: 700, overflowWrap: 'anywhere' }}>
                      {detail.value}
                    </Typography>
                  </Grid>
                ))}
                <Grid size={{ xs: 12 }}>
                  <Typography color="text.secondary" variant="caption">
                    Delivery address
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>
                    {selectedOrder.deliveryAddress ?? 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
              <Box
                sx={{
                  backgroundColor: '#fafbfe',
                  border: `1px solid ${storefrontColors.border}`,
                  borderRadius: 1.5,
                  p: { sm: 2, xs: 1.5 },
                }}
              >
                <Stack
                  direction="row"
                  sx={{ alignItems: 'baseline', justifyContent: 'space-between', mb: 1 }}
                >
                  <Typography sx={{ color: storefrontColors.navy, fontWeight: 900 }}>
                    Ordered items
                  </Typography>
                  <Typography color="text.secondary" variant="caption">
                    {selectedOrder.itemCount} item{selectedOrder.itemCount === 1 ? '' : 's'}
                  </Typography>
                </Stack>
                {selectedOrder.lineItems?.length ? (
                  <Stack>
                    {selectedOrder.lineItems.map((item, index) => (
                      <Stack
                        direction="row"
                        key={`${item.productId}-${index}`}
                        spacing={1.5}
                        sx={{
                          alignItems: 'center',
                          borderTop:
                            index === 0 ? 'none' : `1px solid ${storefrontColors.border}`,
                          py: 1.25,
                        }}
                      >
                        <Box
                          sx={{
                            alignItems: 'center',
                            backgroundColor: '#ffffff',
                            border: `1px solid ${storefrontColors.border}`,
                            borderRadius: 1,
                            display: 'flex',
                            flexShrink: 0,
                            height: 58,
                            justifyContent: 'center',
                            overflow: 'hidden',
                            width: 58,
                          }}
                        >
                          {item.imageUrl ? (
                            <Box
                              alt={item.name}
                              component="img"
                              src={item.imageUrl}
                              sx={{ height: '100%', objectFit: 'contain', width: '100%' }}
                            />
                          ) : (
                            <Inventory2OutlinedIcon
                              sx={{ color: storefrontColors.muted, fontSize: 26 }}
                            />
                          )}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 850, lineHeight: 1.25 }}>
                            {item.name}
                          </Typography>
                          <Typography color="text.secondary" variant="caption">
                            Qty {item.quantity} ×{' '}
                            {formatCurrency(item.unitPrice, selectedOrder.currency)}
                            {item.sku ? ` · SKU ${item.sku}` : ''}
                          </Typography>
                          {item.message ? (
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                              Message: {item.message}
                            </Typography>
                          ) : null}
                        </Box>
                        <Typography
                          sx={{ color: storefrontColors.accent, flexShrink: 0, fontWeight: 900 }}
                        >
                          {formatCurrency(item.lineTotal, selectedOrder.currency)}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                ) : selectedOrder.productDetails?.length ? (
                  <Stack>
                    {selectedOrder.productDetails.map((product, index) => (
                      <Stack
                        direction="row"
                        key={product.productId}
                        spacing={1.5}
                        sx={{
                          alignItems: 'center',
                          borderTop:
                            index === 0 ? 'none' : `1px solid ${storefrontColors.border}`,
                          py: 1.25,
                        }}
                      >
                        <Box
                          sx={{
                            alignItems: 'center',
                            backgroundColor: '#ffffff',
                            border: `1px solid ${storefrontColors.border}`,
                            borderRadius: 1,
                            display: 'flex',
                            flexShrink: 0,
                            height: 58,
                            justifyContent: 'center',
                            overflow: 'hidden',
                            width: 58,
                          }}
                        >
                          {product.imageUrl ? (
                            <Box
                              alt={product.name}
                              component="img"
                              src={product.imageUrl}
                              sx={{ height: '100%', objectFit: 'contain', width: '100%' }}
                            />
                          ) : (
                            <Inventory2OutlinedIcon
                              sx={{ color: storefrontColors.muted, fontSize: 26 }}
                            />
                          )}
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 850, lineHeight: 1.25 }}>
                            {product.name}
                          </Typography>
                          {product.sku ? (
                            <Typography color="text.secondary" variant="caption">
                              SKU {product.sku}
                            </Typography>
                          ) : null}
                        </Box>
                      </Stack>
                    ))}
                    <Typography color="text.secondary" sx={{ pt: 1 }} variant="caption">
                      Historical order quantities and item prices were not stored. The products
                      shown are matched from this order’s saved product IDs.
                    </Typography>
                  </Stack>
                ) : (
                  <Typography color="text.secondary" sx={{ py: 1 }} variant="body2">
                    These products are no longer available in the catalogue.
                  </Typography>
                )}
              </Box>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          {selectedOrder ? (
            <Button
              onClick={() => handleReorder(selectedOrder)}
              startIcon={<AddShoppingCartOutlinedIcon />}
              sx={{ color: storefrontColors.navy, fontWeight: 800, textTransform: 'none' }}
            >
              Purchase again
            </Button>
          ) : null}
          {selectedOrder ? (
            <Button
              onClick={() => downloadOrderInvoice(selectedOrder)}
              startIcon={<FileDownloadOutlinedIcon />}
              sx={{ color: storefrontColors.navy, fontWeight: 800, textTransform: 'none' }}
            >
              Download invoice
            </Button>
          ) : null}
          <Button
            onClick={() => setSelectedOrder(null)}
            sx={{ color: storefrontColors.navy, fontWeight: 800, textTransform: 'none' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

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
  email: '',
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
  email: user?.email ?? '',
  phone: user?.phone ?? '',
  recipientName: getUserFullName(user),
});

const isYangonRegion = (region?: string) => region === 'Yangon' || region === 'Yangon Region';

const AddressContent = () => {
  const { addresses, createAddress, deleteAddress, isLoading, isSaving, updateAddress } =
    useAddresses();
  const locationsQuery = useMyanmarLocations();
  const user = useSelector((state: RootState) => state.auth.user);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);
  const [form, setForm] = useState<CustomerAddressPayload>(() => getAddressFormDefaults(user));
  const hasAddresses = addresses.length > 0;
  const myanmarLocations = (locationsQuery.data?.length
    ? locationsQuery.data
    : yangonLocationFallback).filter((locationOption) => isYangonRegion(locationOption.region));
  const selectedLocation = myanmarLocations.find(
    (locationOption) => locationOption.region === form.region,
  );
  const cityOptions = selectedLocation?.cities ?? [];
  const townshipOptions = selectedLocation?.townships ?? [];

  useEffect(() => {
    if (!editingAddress) {
      const defaults = getAddressFormDefaults(user);

      // eslint-disable-next-line react-hooks/set-state-in-effect
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
      email: address.email ?? user?.email ?? '',
      isDefault: address.isDefault,
      label: address.label,
      landmark: address.landmark ?? '',
      phone: address.phone,
      recipientName: address.recipientName,
      region: isYangonRegion(address.region) ? address.region : '',
      township: isYangonRegion(address.region) ? address.township ?? '' : '',
    });
  };
  const setField = <TKey extends keyof CustomerAddressPayload>(
    key: TKey,
    value: CustomerAddressPayload[TKey],
  ) => setForm((current) => ({ ...current, [key]: value }));
  const setRegion = (region: string) => {
    const nextLocation = myanmarLocations.find(
      (locationOption) => locationOption.region === region,
    );
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
      <Stack
        direction={{ sm: 'row', xs: 'column' }}
        spacing={1.5}
        sx={{ alignItems: { sm: 'center', xs: 'flex-start' }, justifyContent: 'space-between' }}
      >
        <Box>
          <Typography sx={{ color: storefrontColors.navy, fontSize: '1.45rem', fontWeight: 900 }}>
            My Addresses
          </Typography>
          <Typography sx={{ color: storefrontColors.muted, fontWeight: 700, mt: 0.7 }}>
            Save delivery locations and choose the default address used at checkout.
          </Typography>
        </Box>
        <Chip color={hasAddresses ? 'success' : 'default'} label={`${addresses.length} saved`} />
      </Stack>

      <Box
        sx={{
          backgroundColor: '#ffffff',
          border: `1px solid ${storefrontColors.border}`,
          borderRadius: 2,
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { lg: '0.95fr 1.05fr', xs: '1fr' },
          mt: 3,
          p: { md: 3, xs: 2 },
        }}
      >
        <Stack spacing={2}>
          <Typography sx={{ color: storefrontColors.navy, fontSize: '1.08rem', fontWeight: 900 }}>
            {editingAddress ? 'Edit delivery address' : 'Add delivery address'}
          </Typography>
          <TextField
            label="Recipient name"
            onChange={(event) => setField('recipientName', event.target.value)}
            required
            value={form.recipientName}
          />
          <TextField
            label="Mobile number"
            onChange={(event) => setField('phone', event.target.value)}
            required
            value={form.phone}
          />
          <TextField
            label="Email"
            onChange={(event) => setField('email', event.target.value)}
            type="email"
            value={form.email ?? ''}
          />
          <TextField
            label="Address label"
            onChange={(event) =>
              setField('label', event.target.value as CustomerAddressPayload['label'])
            }
            select
            value={form.label}
          >
            <MenuItem value="home">Home</MenuItem>
            <MenuItem value="work">Work</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </TextField>
          <TextField
            label="Address line 1"
            onChange={(event) => setField('addressLine1', event.target.value)}
            required
            value={form.addressLine1}
          />
          <TextField
            label="Address line 2"
            onChange={(event) => setField('addressLine2', event.target.value)}
            value={form.addressLine2}
          />
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
            <TextField
              fullWidth
              label="Region / State"
              onChange={(event) => setRegion(event.target.value)}
              required
              select
              value={form.region}
            >
              {myanmarLocations.map((locationOption) => (
                <MenuItem key={locationOption.region} value={locationOption.region}>
                  {locationOption.region}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              disabled={!form.region}
              fullWidth
              label="City"
              onChange={(event) => setCity(event.target.value)}
              required
              select
              value={form.city}
            >
              {cityOptions.map((city) => (
                <MenuItem key={city.name} value={city.name}>
                  {city.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              disabled={!form.region}
              fullWidth
              label="Township"
              onChange={(event) => setField('township', event.target.value)}
              required
              select
              value={form.township}
            >
              {townshipOptions.map((township) => (
                <MenuItem key={township} value={township}>
                  {township}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Nearby landmark"
              onChange={(event) => setField('landmark', event.target.value)}
              value={form.landmark}
            />
          </Box>
          <TextField
            label="Delivery instructions"
            minRows={3}
            multiline
            onChange={(event) => setField('deliveryInstructions', event.target.value)}
            value={form.deliveryInstructions}
          />
          <FormControlLabel
            control={
              <Switch
                checked={form.isDefault}
                onChange={(event) => setField('isDefault', event.target.checked)}
              />
            }
            label="Use as default delivery address"
          />
          <Stack direction="row" spacing={1.5}>
            <Button
              disabled={
                isSaving ||
                !form.recipientName ||
                !form.phone ||
                !form.addressLine1 ||
                !form.region ||
                !form.city ||
                !form.township
              }
              onClick={() => void handleSubmit()}
              sx={{
                backgroundColor: storefrontColors.navy,
                borderRadius: 999,
                color: '#ffffff',
                fontWeight: 900,
                px: 3.5,
                textTransform: 'none',
                '&:hover': { backgroundColor: storefrontColors.navyDark },
              }}
            >
              {editingAddress ? 'Save address' : 'Add address'}
            </Button>
            {editingAddress ? (
              <Button
                onClick={resetForm}
                sx={{ borderRadius: 999, fontWeight: 800, textTransform: 'none' }}
              >
                Cancel
              </Button>
            ) : null}
          </Stack>
        </Stack>

        <Stack spacing={1.5}>
          <Typography sx={{ color: storefrontColors.navy, fontSize: '1.08rem', fontWeight: 900 }}>
            Saved addresses
          </Typography>
          {isLoading ? (
            <Typography sx={{ color: storefrontColors.muted, fontWeight: 700 }}>
              Loading addresses...
            </Typography>
          ) : hasAddresses ? (
            addresses.map((address) => (
              <Box
                key={address.id}
                sx={{ border: `1px solid ${storefrontColors.border}`, borderRadius: 1.5, p: 2 }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Chip label={address.label} size="small" />
                    {address.isDefault ? (
                      <Chip color="success" label="Default" size="small" />
                    ) : null}
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    {!address.isDefault ? (
                      <Button
                        onClick={() =>
                          void updateAddress({ id: address.id, payload: { isDefault: true } })
                        }
                        size="small"
                        sx={{ textTransform: 'none' }}
                      >
                        Set default
                      </Button>
                    ) : null}
                    <Button
                      onClick={() => startEdit(address)}
                      size="small"
                      sx={{ textTransform: 'none' }}
                    >
                      Edit
                    </Button>
                    <Button
                      color="error"
                      onClick={() => void deleteAddress(address.id)}
                      size="small"
                      sx={{ textTransform: 'none' }}
                    >
                      Delete
                    </Button>
                  </Stack>
                </Stack>
                <Typography sx={{ color: storefrontColors.navy, fontWeight: 900, mt: 1.3 }}>
                  {address.recipientName}
                </Typography>
                <Typography sx={{ color: '#4b5563', fontWeight: 700 }}>{address.phone}</Typography>
                {address.email ? (
                  <Typography sx={{ color: '#4b5563', fontWeight: 700 }}>{address.email}</Typography>
                ) : null}
                <Typography sx={{ color: '#4b5563', mt: 0.8 }}>
                  {[
                    address.addressLine1,
                    address.addressLine2,
                    address.township,
                    address.city,
                    address.region,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </Typography>
                {address.landmark ? (
                  <Typography sx={{ color: storefrontColors.muted, mt: 0.5 }}>
                    Landmark: {address.landmark}
                  </Typography>
                ) : null}
                {address.deliveryInstructions ? (
                  <Typography sx={{ color: storefrontColors.muted, mt: 0.5 }}>
                    Instructions: {address.deliveryInstructions}
                  </Typography>
                ) : null}
              </Box>
            ))
          ) : (
            <Box
              sx={{
                backgroundColor: '#f6f8fc',
                border: `1px dashed ${storefrontColors.border}`,
                borderRadius: 1.5,
                p: 3,
              }}
            >
              <Typography sx={{ color: storefrontColors.navy, fontWeight: 900 }}>
                No addresses saved
              </Typography>
              <Typography sx={{ color: storefrontColors.muted, mt: 0.7 }}>
                Add your first delivery address to speed up checkout.
              </Typography>
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
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

  const setProfileField = <TKey extends keyof UpdateProfilePayload>(
    key: TKey,
    value: UpdateProfilePayload[TKey],
  ) => {
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
      <Stack
        direction={{ sm: 'row', xs: 'column' }}
        spacing={1.5}
        sx={{ alignItems: { sm: 'center', xs: 'flex-start' }, justifyContent: 'space-between' }}
      >
        <Box>
          <Typography sx={{ color: storefrontColors.navy, fontSize: '1.45rem', fontWeight: 900 }}>
            {activePage.title}
          </Typography>
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
        <TextField
          disabled={!isEditing || mutation.isPending}
          label="Full name"
          onChange={(event) => setProfileField('name', event.target.value)}
          required
          value={form.name}
        />
        <TextField
          disabled={!isEditing || mutation.isPending}
          label="Email address"
          onChange={(event) => setProfileField('email', event.target.value)}
          required
          type="email"
          value={form.email}
        />
        <TextField
          disabled={!isEditing || mutation.isPending}
          label="Mobile number"
          helperText={isEditing ? 'Use country code, for example +959123456789.' : undefined}
          onChange={(event) => setProfileField('phone', event.target.value)}
          required
          value={form.phone}
        />
        <TextField disabled label="Account type" required value={formatRoleLabel(user?.role)} />
      </Box>

      <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
        {isEditing ? (
          <>
            <Button
              disabled={mutation.isPending}
              onClick={openConfirmation}
              sx={{
                backgroundColor: storefrontColors.navy,
                borderRadius: 999,
                color: '#ffffff',
                fontSize: '1rem',
                fontWeight: 800,
                px: 4.5,
                py: 1.2,
                textTransform: 'none',
                '&:hover': { backgroundColor: storefrontColors.navyDark },
              }}
            >
              Save profile
            </Button>
            <Button
              disabled={mutation.isPending}
              onClick={cancelEdit}
              sx={{
                borderRadius: 999,
                fontSize: '1rem',
                fontWeight: 800,
                px: 3.5,
                py: 1.2,
                textTransform: 'none',
              }}
            >
              Cancel
            </Button>
          </>
        ) : (
          <Button
            onClick={() => setIsEditing(true)}
            sx={{
              backgroundColor: storefrontColors.navy,
              borderRadius: 999,
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: 800,
              px: 4.5,
              py: 1.2,
              textTransform: 'none',
              '&:hover': { backgroundColor: storefrontColors.navyDark },
            }}
          >
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
          <Button
            disabled={mutation.isPending}
            onClick={() => setConfirmOpen(false)}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            disabled={mutation.isPending}
            onClick={submitProfile}
            sx={{
              backgroundColor: storefrontColors.navy,
              color: '#ffffff',
              fontWeight: 800,
              textTransform: 'none',
              '&:hover': { backgroundColor: storefrontColors.navyDark },
            }}
          >
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
      <Typography sx={{ color: storefrontColors.navy, fontSize: '1.45rem', fontWeight: 900 }}>
        {activePage.title}
      </Typography>
      <Box
        sx={{
          backgroundColor: '#ffffff',
          border: `1px solid ${storefrontColors.border}`,
          borderRadius: 2,
          mt: 3,
          p: { md: 3.5, xs: 2.2 },
        }}
      >
        <Stack spacing={2.2} sx={{ maxWidth: 620 }}>
          <Box>
            <Typography sx={{ color: storefrontColors.navy, fontSize: '1.08rem', fontWeight: 900 }}>
              Secure password update
            </Typography>
            <Typography sx={{ color: storefrontColors.muted, fontWeight: 700, mt: 0.7 }}>
              Enter your current password before setting a new account password.
            </Typography>
          </Box>
          <TextField
            autoComplete="current-password"
            label="Current password"
            onChange={(event) => setPasswordField('currentPassword', event.target.value)}
            required
            sx={passwordFieldSx}
            type="password"
            value={form.currentPassword}
          />
          <TextField
            autoComplete="new-password"
            helperText="Use at least 8 characters."
            label="New password"
            onChange={(event) => setPasswordField('newPassword', event.target.value)}
            required
            sx={passwordFieldSx}
            type="password"
            value={form.newPassword}
          />
          <TextField
            autoComplete="new-password"
            label="Confirm new password"
            onChange={(event) => setPasswordField('confirmPassword', event.target.value)}
            required
            sx={passwordFieldSx}
            type="password"
            value={form.confirmPassword}
          />
          <Button
            disabled={mutation.isPending}
            onClick={openConfirmation}
            sx={{
              alignSelf: 'flex-start',
              backgroundColor: storefrontColors.navy,
              borderRadius: 999,
              color: '#ffffff',
              fontWeight: 900,
              px: 4,
              py: 1.15,
              textTransform: 'none',
              '&:hover': { backgroundColor: storefrontColors.navyDark },
            }}
          >
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
          <Button
            disabled={mutation.isPending}
            onClick={() => setConfirmOpen(false)}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            disabled={mutation.isPending}
            onClick={submitPasswordChange}
            sx={{
              backgroundColor: storefrontColors.navy,
              color: '#ffffff',
              fontWeight: 800,
              textTransform: 'none',
              '&:hover': { backgroundColor: storefrontColors.navyDark },
            }}
          >
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
      <Typography sx={{ color: storefrontColors.navy, fontSize: '1.45rem', fontWeight: 900 }}>
        {activePage.title}
      </Typography>
      <Box
        sx={{
          backgroundColor: '#ffffff',
          border: `1px solid ${storefrontColors.border}`,
          borderRadius: 2,
          mt: 3,
          p: { md: 3.5, xs: 2.2 },
        }}
      >
        <Stack spacing={2.2} sx={{ maxWidth: 680 }}>
          <Box>
            <Typography sx={{ color: storefrontColors.navy, fontSize: '1.08rem', fontWeight: 900 }}>
              Close this customer account
            </Typography>
            <Typography sx={{ color: storefrontColors.muted, fontWeight: 700, mt: 0.7 }}>
              This disables your login and signs you out immediately. Saved customer access will no
              longer be available.
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: '#fff4f2',
              border: '1px solid #f6c7c1',
              borderRadius: 1.5,
              p: 2,
            }}
          >
            <Typography sx={{ color: storefrontColors.navy, fontWeight: 900 }}>
              Account selected for deletion
            </Typography>
            <Typography sx={{ color: '#4b5563', fontWeight: 700, mt: 0.5 }}>
              {user ? `${getUserFullName(user)} (${user.email})` : 'Current logged-in account'}
            </Typography>
          </Box>
          <TextField
            autoComplete="current-password"
            label="Password"
            onChange={(event) =>
              setForm((current) => ({ ...current, password: event.target.value }))
            }
            required
            sx={passwordFieldSx}
            type="password"
            value={form.password}
          />
          <TextField
            helperText="Type DELETE exactly to enable account deletion."
            label="Confirmation"
            onChange={(event) =>
              setForm((current) => ({ ...current, confirmation: event.target.value }))
            }
            required
            value={form.confirmation}
          />
          <Button
            disabled={mutation.isPending || !canRequestDeletion}
            onClick={openConfirmation}
            sx={{
              alignSelf: 'flex-start',
              backgroundColor: storefrontColors.navy,
              borderRadius: 999,
              color: '#ffffff',
              fontWeight: 900,
              px: 4,
              py: 1.15,
              textTransform: 'none',
              '&:hover': { backgroundColor: storefrontColors.navyDark },
              '&.Mui-disabled': { backgroundColor: '#c9cdd6', color: '#ffffff' },
            }}
          >
            Request deletion
          </Button>
        </Stack>
      </Box>

      <Dialog fullWidth maxWidth="xs" onClose={() => setConfirmOpen(false)} open={confirmOpen}>
        <DialogTitle>Delete account?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#4b5563', fontWeight: 700 }}>
            This action will disable your account and sign you out. Confirm only if you want to
            continue.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            disabled={mutation.isPending}
            onClick={() => setConfirmOpen(false)}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            disabled={mutation.isPending}
            onClick={submitDeletion}
            sx={{
              backgroundColor: storefrontColors.navy,
              color: '#ffffff',
              fontWeight: 800,
              textTransform: 'none',
              '&:hover': { backgroundColor: storefrontColors.navyDark },
            }}
          >
            {mutation.isPending ? 'Deleting...' : 'Delete account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const InfoContent = ({ activePage }: { activePage: AccountPageConfig }) => (
  <Box sx={{ maxWidth: 980, mt: 4.8 }}>
    <Typography sx={{ color: storefrontColors.navy, fontSize: '1.45rem', fontWeight: 900 }}>
      {activePage.title}
    </Typography>
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
        <Typography
          sx={{ color: '#4b5563', fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.7 }}
        >
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
          <Typography sx={{ color: storefrontColors.navy, fontWeight: 900 }}>
            Current status
          </Typography>
          <Typography sx={{ color: storefrontColors.muted, mt: 0.5 }}>
            We will show your latest activity here when it is available.
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

  if (activePage.path === routePaths.accountWalletTerms) {
    return <WalletTermsContent />;
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
        {activePage.path !== routePaths.account ? (
          <Box sx={{ mb: 2 }}>
            <AppBackButton label="Back to account" to={routePaths.account} />
          </Box>
        ) : null}
        <Typography sx={{ color: '#44474d', fontSize: '1rem', fontWeight: 700, mb: 2.5 }}>
          Home /{' '}
          <Typography
            component="span"
            sx={{
              color: storefrontColors.navy,
              fontSize: '1rem',
              fontWeight: 800,
              textDecoration: 'underline',
            }}
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
