import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import {
  Box,
  Card,
  IconButton,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

import { storefrontColors } from '@app/providers/theme/tokens';
import { useFavorites } from '@features/favorites/hooks/useFavorites';
import type { StoreProduct, StoreProductBadge } from '@features/home/types/home.types';
import { routePaths } from '@routes/routePaths';
import { formatCurrency } from '@utils/formatCurrency';

type StoreProductCardProps = {
  disableNavigation?: boolean;
  onAddToCart?: (product: StoreProduct) => void;
  product: StoreProduct;
};

const circleBadgeLabels = new Set(['fresh', 'new', 'local', 'organic']);

const parseUnitDisplay = (unit: string) => {
  const [amount, qualifier] = unit.split('/').map((part) => part.trim());
  const amountValue = Number(amount);

  if (!Number.isNaN(amountValue) && qualifier) {
    return {
      detail: '',
      oldPrice: amountValue,
      qualifier,
    };
  }

  return {
    detail: unit,
    oldPrice: null,
    qualifier: '',
  };
};

const getBadgeTone = (badge: StoreProductBadge) => {
  const normalized = badge.label.toLowerCase();

  if (normalized === 'fresh') {
    return {
      backgroundColor: '#8cc84a',
      borderColor: '#8cc84a',
      color: '#ffffff',
    };
  }

  if (normalized === 'local') {
    return {
      backgroundColor: '#b11443',
      borderColor: '#b11443',
      color: '#ffffff',
    };
  }

  if (normalized === 'organic') {
    return {
      backgroundColor: '#27a54a',
      borderColor: '#27a54a',
      color: '#ffffff',
    };
  }

  return {
    backgroundColor: '#1f438a',
    borderColor: '#1f438a',
    color: '#ffffff',
  };
};

const renderCircleBadgeContent = (label: string) => {
  const normalized = label.toLowerCase();

  if (normalized === 'fresh') {
    return (
      <Typography sx={{ color: '#ffffff', fontSize: '0.76rem', fontWeight: 900, lineHeight: 1 }}>
        FRESH
      </Typography>
    );
  }

  if (normalized === 'local') {
    return (
      <Stack spacing={0.05} sx={{ alignItems: 'center' }}>
        <Typography sx={{ color: '#ffffff', fontSize: '0.3rem', fontWeight: 900, letterSpacing: '0.1em', lineHeight: 1 }}>
          PROUDLY
        </Typography>
        <Typography sx={{ color: '#ffffff', fontSize: '0.85rem', lineHeight: 1 }}>
          🏬
        </Typography>
        <Typography sx={{ color: '#ffffff', fontSize: '0.32rem', fontWeight: 900, letterSpacing: '0.08em', lineHeight: 1 }}>
          LOCAL
        </Typography>
      </Stack>
    );
  }

  if (normalized === 'organic') {
    return (
      <Typography sx={{ color: '#ffffff', fontSize: '0.58rem', fontWeight: 900, letterSpacing: '0.04em', lineHeight: 1 }}>
        ORGANIC
      </Typography>
    );
  }

  return (
    <Stack spacing={0.05} sx={{ alignItems: 'center' }}>
      <Typography sx={{ color: '#ffffff', fontSize: '1rem', lineHeight: 1 }}>
        💬
      </Typography>
      <Typography sx={{ color: '#ffffff', fontSize: '0.48rem', fontWeight: 900, lineHeight: 1 }}>
        NEW
      </Typography>
    </Stack>
  );
};

const renderRibbonBadge = (badge: StoreProductBadge) => (
  <Box
    key={badge.label}
    sx={{
      backgroundColor: alpha('#224890', 0.14),
      borderRadius: 0,
      color: '#224890',
      minHeight: 26,
      px: 0.75,
      py: 0.45,
      width: 'fit-content',
    }}
  >
    <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, lineHeight: 1 }}>
      {badge.label}
    </Typography>
  </Box>
);

const renderCircleBadge = (badge: StoreProductBadge) => {
  const tone = getBadgeTone(badge);

  return (
    <Box
      key={badge.label}
      sx={{
        alignItems: 'center',
        backgroundColor: tone.backgroundColor,
        border: '2px solid #ffffff',
        borderRadius: '50%',
        boxShadow: `0 8px 16px ${alpha(tone.borderColor, 0.22)}`,
        color: tone.color,
        display: 'flex',
        height: 58,
        justifyContent: 'center',
        p: 0.5,
        width: 58,
      }}
    >
      {renderCircleBadgeContent(badge.label)}
    </Box>
  );
};

export const StoreProductCard = ({ disableNavigation = false, onAddToCart, product }: StoreProductCardProps) => {
  const navigate = useNavigate();
  const { isFavorite, isToggling, toggleFavorite } = useFavorites();
  const { detail, oldPrice, qualifier } = parseUnitDisplay(product.unit);
  const lowerBadges = product.badges.filter((badge) => circleBadgeLabels.has(badge.label.toLowerCase()));
  const topBadges = product.badges.filter((badge) => !circleBadgeLabels.has(badge.label.toLowerCase()));
  const displayOldPrice = oldPrice && oldPrice > product.price ? oldPrice : null;
  const productPath = routePaths.productDetails.replace(':productId', product.id);
  const productIsFavorite = isFavorite(product.id);

  const handleNavigate = () => {
    if (!disableNavigation) {
      navigate(productPath);
    }
  };

  return (
    <Card
      onClick={handleNavigate}
      sx={{
        backgroundColor: storefrontColors.surface,
        border: `1px solid ${alpha('#dfe5ef', 0.95)}`,
        borderRadius: 1,
        boxShadow: 'none',
        cursor: disableNavigation ? 'default' : 'pointer',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 494,
        overflow: 'hidden',
        position: 'relative',
        transition: 'border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease',
        '&:hover': {
          borderColor: alpha(storefrontColors.navy, 0.9),
          boxShadow: `0 16px 28px ${alpha('#9f1714', 0.09)}`,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Stack spacing={0} sx={{ left: 0, position: 'absolute', top: 0, zIndex: 2 }}>
        {topBadges.map(renderRibbonBadge)}
      </Stack>

      <IconButton
        aria-label={`${productIsFavorite ? 'Remove' : 'Save'} ${product.name}`}
        disabled={isToggling}
        onClick={(event) => {
          event.stopPropagation();
          toggleFavorite(product.id);
        }}
        sx={{
          backgroundColor: alpha('#ffffff', 0.86),
          color: productIsFavorite ? storefrontColors.navy : '#d9d4cf',
          height: 42,
          position: 'absolute',
          right: 12,
          top: 9,
          width: 42,
          zIndex: 3,
          '&:hover': {
            backgroundColor: '#ffffff',
            color: storefrontColors.navy,
          },
        }}
      >
        {productIsFavorite ? (
          <FavoriteRoundedIcon sx={{ fontSize: 34 }} />
        ) : (
          <FavoriteBorderRoundedIcon sx={{ fontSize: 36 }} />
        )}
      </IconButton>

      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          flexShrink: 0,
          height: 252,
          justifyContent: 'center',
          px: 1.5,
          pt: 1.5,
        }}
      >
        <Box
          alt={product.name}
          component="img"
          loading="lazy"
          src={product.imageUrl}
          sx={{
            display: 'block',
            height: 'auto',
            maxHeight: 218,
            maxWidth: '92%',
            objectFit: 'contain',
            width: '100%',
          }}
        />
      </Box>

      {lowerBadges.length > 0 ? (
        <Stack
          spacing={1}
          sx={{
            position: 'absolute',
            right: 12,
            top: topBadges.length > 0 ? 188 : 200,
            zIndex: 2,
          }}
        >
          {lowerBadges.slice(0, 3).map(renderCircleBadge)}
        </Stack>
      ) : null}

      <Stack spacing={1.12} sx={{ flexGrow: 1, px: 1.75, pb: 1.45 }}>
        <Typography
          sx={{
            color: storefrontColors.navy,
            display: '-webkit-box',
            fontSize: '1.24rem',
            fontWeight: 500,
            lineHeight: 1.1,
            minHeight: '2.2em',
            overflow: 'hidden',
            pr: lowerBadges.length > 0 ? 7 : 0,
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2,
          }}
        >
          {product.name}
        </Typography>

        <Typography
          sx={{
            color: '#87c843',
            fontSize: '0.95rem',
            fontWeight: 500,
            lineHeight: 1,
            textTransform: 'uppercase',
          }}
        >
          {product.origin}
        </Typography>

        <Box sx={{ color: '#56585e' }}>
          {displayOldPrice ? (
            <Typography
              component="span"
              sx={{
                color: '#65676d',
                fontSize: '1.1rem',
                fontWeight: 700,
                mr: 0.45,
                textDecoration: 'line-through',
              }}
            >
              {formatCurrency(displayOldPrice, product.currency)}
            </Typography>
          ) : null}
          <Typography
            component="span"
            sx={{
              color: '#56585e',
              fontSize: '1.28rem',
              fontWeight: 800,
            }}
          >
            {formatCurrency(product.price, product.currency)}
          </Typography>
          {qualifier ? (
            <Typography
              component="span"
              sx={{
                color: '#56585e',
                fontSize: '1rem',
                fontWeight: 500,
              }}
            >
              /{qualifier}
            </Typography>
          ) : null}
        </Box>

        <Typography
          sx={{
            color: '#5c5d62',
            display: '-webkit-box',
            fontSize: '0.9rem',
            lineHeight: 1.22,
            minHeight: '2.44em',
            overflow: 'hidden',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2,
          }}
        >
          {detail || product.description}
        </Typography>
      </Stack>

      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 'auto', px: 1.2, pb: 1.2 }}>
        <Box
          onClick={(event) => {
            event.stopPropagation();
          }}
          sx={{
            alignItems: 'center',
            border: `1px solid ${alpha('#d76a7e', 0.16)}`,
            borderRadius: 0.35,
            color: '#bd314b',
            display: 'flex',
            height: 50,
            justifyContent: 'center',
            width: 50,
          }}
        >
          <EventOutlinedIcon sx={{ fontSize: 28 }} />
        </Box>
        <IconButton
          aria-label={`Add ${product.name} to cart`}
          onClick={(event) => {
            event.stopPropagation();
            onAddToCart?.(product);
          }}
          sx={{
            backgroundColor: storefrontColors.navy,
            borderRadius: 0.35,
            color: storefrontColors.surface,
            height: 50,
            width: 50,
            '&:hover': {
              backgroundColor: storefrontColors.navyDark,
            },
          }}
        >
          <AddRoundedIcon sx={{ fontSize: 30 }} />
        </IconButton>
      </Stack>
    </Card>
  );
};

export const StoreProductCardSkeleton = () => (
  <Card
    sx={{
      backgroundColor: storefrontColors.surface,
      border: `1px solid ${alpha('#dfe5ef', 0.95)}`,
      borderRadius: 1,
      boxShadow: 'none',
      minHeight: 494,
      overflow: 'hidden',
      p: 1.1,
      position: 'relative',
    }}
  >
    <Stack spacing={1.4} sx={{ height: '100%' }}>
      <Stack spacing={0} sx={{ left: 0, position: 'absolute', top: 0 }}>
        <Skeleton sx={{ borderRadius: 0 }} variant="rounded" width={66} height={26} />
        <Skeleton sx={{ borderRadius: 0 }} variant="rounded" width={54} height={26} />
      </Stack>
      <Box sx={{ height: 252, position: 'relative' }}>
        <Skeleton variant="rounded" width="100%" height="100%" />
        <Stack spacing={1} sx={{ position: 'absolute', right: 8, top: 176 }}>
          <Skeleton variant="circular" width={58} height={58} />
          <Skeleton variant="circular" width={58} height={58} />
        </Stack>
      </Box>
      <Skeleton variant="text" width="72%" height={34} />
      <Skeleton variant="text" width="38%" height={24} />
      <Skeleton variant="text" width="54%" height={30} />
      <Skeleton variant="text" width="68%" height={24} />
      <Skeleton variant="text" width="44%" height={24} />
      <Box sx={{ flexGrow: 1 }} />
      <Stack direction="row" sx={{ justifyContent: 'space-between', pt: 1 }}>
        <Skeleton variant="rounded" width={54} height={54} />
        <Skeleton variant="rounded" width={54} height={54} />
      </Stack>
    </Stack>
  </Card>
);
