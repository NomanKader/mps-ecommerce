import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
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
import { Box, Button, IconButton, Stack, TextField, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useState, type ReactElement } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { storefrontColors } from '@app/providers/theme/tokens';
import { useWallet } from '@features/wallet/hooks/useWallet';
import { routePaths } from '@routes/routePaths';
import type { RootState } from '@store/index';

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
    items: [accountPageConfigs.favourites, accountPageConfigs.shoppingList, accountPageConfigs.vouchers],
  },
  {
    title: 'Order Info',
    items: [
      accountPageConfigs.wallet,
      accountPageConfigs.statement,
      accountPageConfigs.orders,
      accountPageConfigs.regulars,
      accountPageConfigs.collectionService,
    ],
  },
  {
    title: 'My Privileges',
    items: [
      accountPageConfigs.accountStatus,
      accountPageConfigs.rewardPoints,
      accountPageConfigs.referFriends,
      accountPageConfigs.deliveryMembership,
    ],
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
  {
    title: 'Special Offers',
    items: [accountPageConfigs.wioBank],
  },
  {
    title: 'Sustainable Grocery Shopping',
    items: [
      accountPageConfigs.story,
      accountPageConfigs.vision,
      accountPageConfigs.brand,
      accountPageConfigs.quality,
      accountPageConfigs.cares,
      accountPageConfigs.media,
      accountPageConfigs.awards,
      accountPageConfigs.kitchen,
    ],
  },
];

const pageConfigs = Object.values(accountPageConfigs);

const getActivePage = (pathname: string) =>
  pageConfigs.find((page) => page.path === pathname) ?? accountPageConfigs.favourites;

const formatWalletAmount = (amount: number) =>
  `৳ ${new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount)}`;

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
  const { availableBalance } = useWallet(user);
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Min Naing Min Naing';
  const email = user?.email ?? 'minnaingjokermm@gmail.com';

  const stats = [
    { icon: <Inventory2OutlinedIcon />, label: 'My Orders', value: '' },
    { label: 'Wallet', value: formatWalletAmount(availableBalance) },
    { label: 'Loyalty Pts', value: '0' },
    { label: 'Referral Pts', value: '0' },
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
        <IconButton aria-label="Edit account details" sx={{ color: '#ffffff', display: { sm: 'inline-flex', xs: 'none' } }}>
          <EditOutlinedIcon />
        </IconButton>
      </Box>

      <Box
        sx={{
          alignItems: 'center',
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { sm: 'repeat(4, minmax(94px, 1fr))', xs: 'repeat(2, minmax(96px, 1fr))' },
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

const CommerceContent = ({ activePage }: { activePage: AccountPageConfig }) => {
  const showTabs = activePage.path === routePaths.accountFavourites || activePage.path === routePaths.accountShoppingList;
  const isShoppingList = activePage.path === routePaths.accountShoppingList;

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
  placeholder = '00.00',
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
        htmlInput: { min: 0, step: '0.01' },
        input: {
          disableUnderline: true,
          startAdornment: <Typography sx={{ color: '#55565c', fontSize: '1.15rem', fontWeight: 900, mr: 1.4 }}>৳</Typography>,
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
  const user = useSelector((state: RootState) => state.auth.user);
  const { addBonusFunds, addFunds, availableBalance, transferToFriend, wallet } = useWallet(user);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [friendEmail, setFriendEmail] = useState('');
  const [friendAmount, setFriendAmount] = useState('');
  const [walletMessage, setWalletMessage] = useState('');

  const bonusRows = [
    { amount: 5000, bonus: '+ ৳ 200', bonusAmount: 200 },
    { amount: 7000, bonus: '+ ৳ 500', bonusAmount: 500 },
    { amount: 10000, bonus: '+ ৳ 1,000', bonusAmount: 1000 },
    { amount: 10000, bonus: '+ Food cycler worth ৳ 999', bonusAmount: 0, divider: true },
  ];
  const topUpValue = Number(topUpAmount);
  const friendAmountValue = Number(friendAmount);

  const handleTopUp = () => {
    if (addFunds(topUpValue)) {
      setTopUpAmount('');
      setWalletMessage('Wallet balance updated.');
    } else {
      setWalletMessage('Enter an amount greater than zero.');
    }
  };

  const handleFriendTransfer = () => {
    if (transferToFriend(friendEmail, friendAmountValue)) {
      setFriendAmount('');
      setFriendEmail('');
      setWalletMessage('Money sent to friend wallet.');
    } else {
      setWalletMessage('Check the friend email, amount, and available balance.');
    }
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
          <Typography sx={{ fontSize: '1.35rem', fontWeight: 900 }}>{formatWalletAmount(wallet.balance)}</Typography>
          <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center' }}>
            <AccountBalanceWalletOutlinedIcon />
            <Typography sx={{ fontSize: '1.05rem', fontWeight: 900 }}>My Wallet</Typography>
          </Stack>
        </Stack>
        <Box sx={{ display: 'grid', gridTemplateColumns: { sm: '1fr 1fr', xs: '1fr' } }}>
          <Stack spacing={0.6} sx={{ alignItems: 'center', borderRight: { sm: `1px solid ${storefrontColors.navy}`, xs: 0 }, py: 2.2 }}>
            <Typography sx={{ color: '#55565c', fontSize: '1.05rem', fontWeight: 700 }}>Reserved For Regular:</Typography>
            <Typography sx={{ color: '#55565c', fontWeight: 800 }}>{formatWalletAmount(wallet.reservedBalance)}</Typography>
          </Stack>
          <Stack spacing={0.6} sx={{ alignItems: 'center', py: 2.2 }}>
            <Typography sx={{ color: storefrontColors.navy, fontSize: '1.05rem', fontWeight: 900 }}>Available Balance:</Typography>
            <Typography sx={{ color: storefrontColors.navy, fontWeight: 900 }}>{formatWalletAmount(availableBalance)}</Typography>
          </Stack>
        </Box>
      </Box>

      {walletMessage ? (
        <Box sx={{ backgroundColor: '#fff8e1', border: `1px solid ${storefrontColors.border}`, borderRadius: 1, px: 2, py: 1.3 }}>
          <Typography sx={{ color: storefrontColors.navy, fontWeight: 800 }}>{walletMessage}</Typography>
        </Box>
      ) : null}

      <WalletPanel title="Add Money To Wallet">
        <Stack spacing={1.5}>
          <WalletAmountInput
            action="Load Wallet"
            amount={topUpAmount}
            disabled={topUpValue <= 0}
            onAction={handleTopUp}
            onAmountChange={setTopUpAmount}
          />
          <Typography sx={{ color: '#55565c', fontSize: '1rem', fontWeight: 700, lineHeight: 1.45, maxWidth: 610 }}>
            Please verify your amount before making a payment as the wallet amount is not refundable via cash or bank transfers
          </Typography>
        </Stack>
      </WalletPanel>

      <Box
        sx={{
          border: `1px solid ${storefrontColors.border}`,
          borderRadius: 1,
          display: 'grid',
          gridTemplateColumns: { md: '0.8fr 1fr 1fr', xs: '1fr' },
          overflow: 'hidden',
        }}
      >
        <Box sx={{ backgroundColor: '#f3f4f9', p: 2.2 }}>
          <Typography sx={{ color: storefrontColors.navy, fontWeight: 900, mb: 3, textAlign: 'center' }}>Bulk Buy Bonus</Typography>
          <Typography sx={{ color: '#55565c', fontWeight: 700, lineHeight: 1.6 }}>
            Earn FREE BONUS CREDIT as E-VOUCHERS when you buy our below packages to top up your wallet:
          </Typography>
        </Box>
        <Box sx={{ borderLeft: { md: `1px solid ${storefrontColors.border}`, xs: 0 } }}>
          <Box sx={{ backgroundColor: storefrontColors.navy, color: '#ffffff', p: 2, textAlign: 'center' }}>
            <Typography sx={{ fontWeight: 900 }}>Add To Wallet</Typography>
          </Box>
          {bonusRows.map((row) => (
            <Stack
              direction="row"
              key={`${row.amount}-${row.bonus}`}
              sx={{
                alignItems: 'center',
                borderTop: `1px solid ${storefrontColors.border}`,
                minHeight: 74,
                px: 2,
                position: 'relative',
              }}
            >
              <Typography sx={{ color: storefrontColors.navy, flex: 1, fontSize: '1.05rem', fontWeight: 900 }}>
                {formatWalletAmount(row.amount)}
              </Typography>
              <Button
                onClick={() => {
                  addBonusFunds(row.amount, row.bonusAmount);
                  setWalletMessage('Wallet package added.');
                }}
                sx={{
                  backgroundColor: '#e43224',
                  borderRadius: 999,
                  color: '#ffffff',
                  fontWeight: 900,
                  px: 2.8,
                  textTransform: 'none',
                  '&:hover': { backgroundColor: '#b71916' },
                }}
              >
                Add funds
              </Button>
              {row.divider ? (
                <Box
                  sx={{
                    backgroundColor: '#ffffff',
                    border: `1px solid ${storefrontColors.border}`,
                    borderRadius: 999,
                    color: '#55565c',
                    display: { md: 'block', xs: 'none' },
                    fontWeight: 900,
                    left: '100%',
                    px: 1.4,
                    position: 'absolute',
                    top: -14,
                    transform: 'translateX(-50%)',
                  }}
                >
                  OR
                </Box>
              ) : null}
            </Stack>
          ))}
        </Box>
        <Box sx={{ borderLeft: { md: `1px solid ${storefrontColors.border}`, xs: 0 } }}>
          <Box sx={{ backgroundColor: storefrontColors.navy, color: '#ffffff', p: 2, textAlign: 'center' }}>
            <Typography sx={{ fontWeight: 900 }}>Free Bonus Credit as E-Vouchers*</Typography>
          </Box>
          {bonusRows.map((row) => (
            <Box
              key={row.bonus}
              sx={{ alignItems: 'center', borderTop: `1px solid ${storefrontColors.border}`, display: 'flex', minHeight: 74, px: 2.2 }}
            >
              <Typography sx={{ color: '#e43224', fontSize: '1.05rem', fontWeight: 900 }}>{row.bonus}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <WalletPanel title="Add Money To Friends Wallet">
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { md: '0.9fr 1.8fr', xs: '1fr' } }}>
          <TextField
            fullWidth
            onChange={(event) => setFriendEmail(event.target.value)}
            placeholder="Enter friend's email"
            type="email"
            value={friendEmail}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
                fontWeight: 800,
                minHeight: 64,
              },
            }}
          />
          <WalletAmountInput
            action="Add Money"
            amount={friendAmount}
            disabled={!friendEmail || friendAmountValue <= 0 || friendAmountValue > availableBalance}
            onAction={handleFriendTransfer}
            onAmountChange={setFriendAmount}
          />
        </Box>
      </WalletPanel>

      <WalletPanel title="Mini Statement">
        {wallet.transactions.length ? (
          <Stack spacing={1.2}>
            {wallet.transactions.slice(0, 6).map((transaction) => (
              <Stack
                direction={{ sm: 'row', xs: 'column' }}
                key={transaction.id}
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
                  <Typography sx={{ color: storefrontColors.navy, fontWeight: 900 }}>{transaction.description}</Typography>
                  <Typography sx={{ color: storefrontColors.muted, fontSize: '0.85rem', fontWeight: 700 }}>
                    {new Date(transaction.createdAt).toLocaleString()}
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    color: transaction.direction === 'credit' ? storefrontColors.success : storefrontColors.navy,
                    flexShrink: 0,
                    fontWeight: 900,
                  }}
                >
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
    <Box
      sx={{
        backgroundColor: storefrontColors.navy,
        borderRadius: '3px 3px 0 0',
        color: '#ffffff',
        px: 2.2,
        py: 1.55,
      }}
    >
      <Typography sx={{ fontSize: '1.25rem', fontWeight: 900 }}>My Order</Typography>
    </Box>

    <Box sx={{ maxWidth: 980, mt: 4.2 }}>
      <Stack direction="row" spacing={7} sx={{ borderBottom: `1px solid ${storefrontColors.border}` }}>
        <Box sx={{ borderBottom: `3px solid ${storefrontColors.navy}`, px: { md: 7, xs: 2 }, py: 1.25 }}>
          <Typography sx={{ color: storefrontColors.navy, fontSize: '1.25rem', fontWeight: 900 }}>
            Upcoming Orders
          </Typography>
        </Box>
        <Box sx={{ px: { md: 4, xs: 2 }, py: 1.25 }}>
          <Typography sx={{ color: storefrontColors.navy, fontSize: '1.25rem', fontWeight: 800 }}>
            Past Orders
          </Typography>
        </Box>
      </Stack>

      <SearchBar placeholder="Search for your orders" />

      <Stack spacing={1.6} sx={{ alignItems: 'center', minHeight: 420, pt: 12, textAlign: 'center' }}>
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
        <Typography sx={{ color: storefrontColors.navy, fontSize: '1.3rem', fontWeight: 800 }}>
          No Upcoming Orders
        </Typography>
      </Stack>
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

const ProfileContent = ({ activePage }: { activePage: AccountPageConfig }) => (
  <Box sx={{ maxWidth: 980, mt: 4.8 }}>
    <Typography sx={{ color: storefrontColors.navy, fontSize: '1.45rem', fontWeight: 900 }}>{activePage.title}</Typography>
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
      {['Full name', 'Email address', 'Mobile number', 'Default preference'].map((label) => (
        <Box
          key={label}
          sx={{
            backgroundColor: '#f6f8fc',
            border: `1px solid ${storefrontColors.border}`,
            borderRadius: 1.5,
            px: 2,
            py: 1.6,
          }}
        >
          <Typography sx={{ color: '#9aa4b8', fontSize: '0.82rem', fontWeight: 800 }}>{label}</Typography>
          <Typography sx={{ color: '#4b5563', fontSize: '1rem', fontWeight: 800, mt: 0.7 }}>Not set</Typography>
        </Box>
      ))}
    </Box>
    <Button
      sx={{
        backgroundColor: storefrontColors.navy,
        borderRadius: 999,
        color: '#ffffff',
        fontSize: '1rem',
        fontWeight: 800,
        mt: 3,
        px: 4.5,
        py: 1.2,
        textTransform: 'none',
        '&:hover': { backgroundColor: storefrontColors.navyDark },
      }}
    >
      {activePage.emptyAction}
    </Button>
  </Box>
);

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

  if (activePage.kind === 'profile') {
    return <ProfileContent activePage={activePage} />;
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
