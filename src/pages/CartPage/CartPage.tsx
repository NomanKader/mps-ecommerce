import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import GiftIcon from '@mui/icons-material/CardGiftcardRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import { Box, Button, IconButton, Stack, TextField, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Link } from 'react-router-dom';

import type { CartItem } from '@entities/cart/types/cart.types';
import type { Product } from '@entities/product/types/product.types';
import { useCart } from '@features/cart/hooks/useCart';
import { useProducts } from '@features/product/hooks/useProducts';
import { routePaths } from '@routes/routePaths';
import { EmptyState } from '@shared/components/ui/EmptyState/EmptyState';
import { AppBackButton } from '@shared/components/ui/BackButton/AppBackButton';
import { storefrontColors } from '@app/providers/theme/tokens';
import { formatCurrency } from '@utils/formatCurrency';

const getProductPath = (productId: string) =>
  routePaths.productDetails.replace(':productId', productId);

const CartSuggestionCard = ({
  onAddToCart,
  product,
}: {
  onAddToCart: (product: Product) => void;
  product: Product;
}) => {
  return (
    <Box
      sx={{
        flex: '0 0 178px',
        minWidth: 0,
        textAlign: 'center',
      }}
    >
      <Box
        component={Link}
        to={getProductPath(product.id)}
        sx={{
          alignItems: 'center',
          display: 'flex',
          height: 118,
          justifyContent: 'center',
          mx: 'auto',
          width: 150,
        }}
      >
        <Box
          alt={product.name}
          component="img"
          loading="lazy"
          src={product.imageUrl}
          sx={{ maxHeight: 104, maxWidth: '100%', objectFit: 'contain' }}
        />
      </Box>
      <Typography
        component={Link}
        to={getProductPath(product.id)}
        sx={{
          color: storefrontColors.navy,
          display: '-webkit-box',
          fontSize: '1rem',
          fontWeight: 800,
          lineHeight: 1.12,
          minHeight: '2.24em',
          overflow: 'hidden',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: 2,
        }}
      >
        {product.name}
      </Typography>
      <Typography sx={{ color: '#53565c', fontSize: '0.95rem', fontWeight: 800, mt: 0.35 }}>
        {formatCurrency(product.price, product.currency)}
      </Typography>
      <Button
        onClick={() => onAddToCart(product)}
        sx={{
          backgroundColor: '#f3f5fa',
          borderRadius: 999,
          color: storefrontColors.navy,
          fontSize: '0.9rem',
          fontWeight: 800,
          mt: 1,
          px: 2.1,
          py: 0.35,
          textTransform: 'none',
          '&:hover': {
            backgroundColor: alpha(storefrontColors.navy, 0.1),
          },
        }}
      >
        Add to cart
      </Button>
    </Box>
  );
};

const CartLineItem = ({
  item,
  onAdd,
  onDecrease,
  onRemove,
}: {
  item: CartItem;
  onAdd: (product: Product) => void;
  onDecrease: (productId: string) => void;
  onRemove: (productId: string) => void;
}) => {
  const lineTotal = item.product.price * item.quantity;

  return (
    <Box
      sx={{
        borderTop: `1px solid ${storefrontColors.border}`,
        display: 'grid',
        gap: { md: 3, xs: 2 },
        gridTemplateColumns: {
          md: '180px minmax(220px, 1fr) minmax(360px, 1.35fr)',
          xs: '96px 1fr',
        },
        px: { md: 3, xs: 2 },
        py: 3,
      }}
    >
      <Box
        component={Link}
        to={getProductPath(item.product.id)}
        sx={{
          alignItems: 'flex-start',
          display: 'flex',
          justifyContent: 'center',
          minHeight: { md: 178, xs: 110 },
        }}
      >
        <Box
          alt={item.product.name}
          component="img"
          src={item.product.imageUrl}
          sx={{ maxHeight: { md: 170, xs: 104 }, maxWidth: '100%', objectFit: 'contain' }}
        />
      </Box>

      <Stack spacing={0.7} sx={{ minWidth: 0 }}>
        <Typography
          component={Link}
          to={getProductPath(item.product.id)}
          sx={{
            color: '#56585e',
            fontSize: { md: '1.18rem', xs: '1rem' },
            fontWeight: 800,
            lineHeight: 1.15,
          }}
        >
          {item.product.name}
        </Typography>
        <Typography sx={{ color: '#53565c', fontSize: '0.94rem', fontWeight: 700 }}>
          {item.product.description}
        </Typography>
        <Typography sx={{ color: '#53565c', fontSize: '1rem', fontWeight: 900 }}>
          {formatCurrency(item.product.price, item.product.currency)}
        </Typography>
      </Stack>

      <Stack spacing={2.6} sx={{ gridColumn: { md: 'auto', xs: '1 / -1' }, minWidth: 0 }}>
        <Stack
          direction={{ sm: 'row', xs: 'column' }}
          spacing={1.2}
          sx={{ alignItems: { sm: 'center', xs: 'flex-start' }, justifyContent: 'space-between' }}
        >
          <Stack
            direction="row"
            spacing={1.7}
            sx={{ alignItems: 'center', color: storefrontColors.navy }}
          >
            <IconButton
              aria-label={`Share ${item.product.name}`}
              size="small"
              sx={{ color: 'inherit' }}
            >
              <ShareRoundedIcon />
            </IconButton>
            <IconButton
              aria-label={`Gift ${item.product.name}`}
              size="small"
              sx={{ color: 'inherit' }}
            >
              <GiftIcon />
            </IconButton>
            <IconButton
              aria-label={`Save ${item.product.name}`}
              size="small"
              sx={{ color: 'inherit' }}
            >
              <FavoriteBorderRoundedIcon />
            </IconButton>
          </Stack>
          <Box
            sx={{
              border: `1px solid ${storefrontColors.border}`,
              borderRadius: 1,
              color: '#55585d',
              fontSize: '0.92rem',
              fontWeight: 800,
              px: 1.2,
              py: 0.8,
            }}
          >
            Total: {formatCurrency(lineTotal, item.product.currency)}
          </Box>
        </Stack>

        <Stack
          direction={{ sm: 'row', xs: 'column' }}
          spacing={1.6}
          sx={{ alignItems: { sm: 'center', xs: 'flex-start' } }}
        >
          <Button
            sx={{
              color: storefrontColors.navy,
              fontSize: '0.95rem',
              fontWeight: 800,
              minWidth: 0,
              textTransform: 'none',
            }}
          >
            Save for later
          </Button>
          <IconButton
            aria-label={`Remove ${item.product.name}`}
            onClick={() => onRemove(item.product.id)}
            sx={{ color: storefrontColors.navy }}
          >
            <DeleteOutlineRoundedIcon />
          </IconButton>
          <Stack direction="row" sx={{ height: 48 }}>
            <IconButton
              aria-label={`Decrease ${item.product.name} quantity`}
              onClick={() => onDecrease(item.product.id)}
              sx={{
                backgroundColor: storefrontColors.navy,
                borderRadius: '4px 0 0 4px',
                color: '#ffffff',
                height: 48,
                width: 48,
                '&:hover': { backgroundColor: storefrontColors.navyDark },
              }}
            >
              <RemoveRoundedIcon />
            </IconButton>
            <Box
              sx={{
                alignItems: 'center',
                backgroundColor: '#f2f4f9',
                color: storefrontColors.navy,
                display: 'flex',
                fontSize: '1rem',
                fontWeight: 900,
                justifyContent: 'center',
                width: 78,
              }}
            >
              {item.quantity}
            </Box>
            <IconButton
              aria-label={`Increase ${item.product.name} quantity`}
              onClick={() => onAdd(item.product)}
              sx={{
                backgroundColor: storefrontColors.navy,
                borderRadius: '0 4px 4px 0',
                color: '#ffffff',
                height: 48,
                width: 48,
                '&:hover': { backgroundColor: storefrontColors.navyDark },
              }}
            >
              <AddRoundedIcon />
            </IconButton>
          </Stack>
        </Stack>

        <Stack spacing={2} sx={{ maxWidth: 720, pt: { md: 1.5, xs: 0 } }}>
          <TextField
            fullWidth
            minRows={3}
            multiline
            placeholder="add a message"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
                color: storefrontColors.navy,
                fontWeight: 700,
              },
            }}
          />
          <Stack
            direction="row"
            spacing={1.2}
            sx={{ justifyContent: { sm: 'center', xs: 'flex-start' } }}
          >
            <Button
              sx={{
                backgroundColor: '#f1f3f8',
                borderRadius: 999,
                color: storefrontColors.navy,
                fontWeight: 900,
                px: 3.4,
                textTransform: 'none',
                '&:hover': { backgroundColor: '#e7ebf4' },
              }}
            >
              Cancel
            </Button>
            <Button
              sx={{
                backgroundColor: storefrontColors.navy,
                borderRadius: 999,
                color: '#ffffff',
                fontWeight: 900,
                px: 3.8,
                textTransform: 'none',
                '&:hover': { backgroundColor: storefrontColors.navyDark },
              }}
            >
              Save
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
};

export const CartPage = () => {
  const { addToCart, clearCart, decreaseQuantity, items, removeFromCart, totalItems, totalPrice } =
    useCart();
  const { data: suggestionProducts = [] } = useProducts();
  const currency = items[0]?.product.currency ?? 'MMK';

  if (!items.length) {
    return (
      <Stack spacing={3}>
        <AppBackButton label="Continue shopping" to={routePaths.catalog} />
        <Box
          sx={{
            backgroundColor: storefrontColors.navy,
            borderRadius: 1,
            color: '#ffffff',
            px: 2.2,
            py: 1.4,
          }}
        >
          <Typography sx={{ fontSize: '1.2rem', fontWeight: 900 }}>MY CART</Typography>
        </Box>
        <EmptyState
          description="Add products from the catalog to see checkout totals, notes, and quantity controls."
          title="Your cart is empty"
        />
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <AppBackButton label="Continue shopping" to={routePaths.catalog} />
      <Box
        sx={{
          backgroundColor: storefrontColors.navy,
          borderRadius: 1,
          color: '#ffffff',
          px: 2.2,
          py: 1.4,
        }}
      >
        <Typography sx={{ fontSize: '1.2rem', fontWeight: 900 }}>MY CART</Typography>
      </Box>

      <Box>
        <Typography
          sx={{ color: storefrontColors.navy, fontSize: '1.25rem', fontWeight: 900, mb: 1.5 }}
        >
          Things you might like
        </Typography>
        <Box
          sx={{
            display: 'flex',
            gap: 2.2,
            overflowX: 'auto',
            pb: 1,
            pt: 0.4,
            '&::-webkit-scrollbar': { height: 8 },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: alpha(storefrontColors.navy, 0.18),
              borderRadius: 999,
            },
          }}
        >
          {suggestionProducts.length ? (
            suggestionProducts
              .slice(0, 7)
              .map((product) => (
                <CartSuggestionCard key={product.id} onAddToCart={addToCart} product={product} />
              ))
          ) : (
            <Box sx={{ minWidth: '100%' }}>
              <EmptyState
                description="Recommended products are connected to the live catalog and will appear here soon."
                title="Suggestions coming soon"
              />
            </Box>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          backgroundColor: '#ffffff',
          border: `1px solid ${storefrontColors.border}`,
          borderRadius: 1,
          overflow: 'hidden',
        }}
      >
        <Stack
          direction="row"
          spacing={1.4}
          sx={{
            alignItems: 'center',
            backgroundColor: '#f4f6fb',
            justifyContent: 'space-between',
            px: { md: 2.2, xs: 1.5 },
            py: 1.45,
          }}
        >
          <Stack direction="row" spacing={1.3} sx={{ alignItems: 'center' }}>
            <Typography sx={{ color: storefrontColors.navy, fontSize: '1.2rem', fontWeight: 900 }}>
              Cart Item ({totalItems})
            </Typography>
            <Button
              onClick={clearCart}
              sx={{
                backgroundColor: '#ffffff',
                border: `1px solid ${storefrontColors.border}`,
                borderRadius: 999,
                color: storefrontColors.navy,
                fontWeight: 800,
                px: 1.7,
                py: 0.25,
                textTransform: 'none',
              }}
            >
              Clear Cart
            </Button>
          </Stack>
          <Typography sx={{ color: storefrontColors.navy, fontSize: '1.12rem', fontWeight: 900 }}>
            {formatCurrency(totalPrice, currency)}
          </Typography>
        </Stack>

        {items.map((item) => (
          <CartLineItem
            item={item}
            key={item.product.id}
            onAdd={addToCart}
            onDecrease={decreaseQuantity}
            onRemove={removeFromCart}
          />
        ))}
      </Box>

      <Stack direction="row" sx={{ justifyContent: 'flex-end', pb: 1.5, pt: 2 }}>
        <Button
          component={Link}
          to={routePaths.checkout}
          sx={{
            backgroundColor: storefrontColors.navy,
            borderRadius: 999,
            color: '#ffffff',
            fontSize: '1rem',
            fontWeight: 900,
            minHeight: 56,
            px: { md: 9, xs: 4 },
            textTransform: 'none',
            width: { md: 390, xs: '100%' },
            '&:hover': { backgroundColor: storefrontColors.navyDark },
          }}
        >
          Checkout&nbsp;&nbsp;{formatCurrency(totalPrice, currency)}
        </Button>
      </Stack>
    </Stack>
  );
};
