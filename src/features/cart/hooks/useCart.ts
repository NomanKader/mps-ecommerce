import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import type { Product } from '@entities/product/types/product.types';
import { useAppDispatch } from '@store/hooks';
import type { RootState } from '@store/index';
import { addItem, clearCart, decreaseItemQuantity, removeItem } from '@store/slices/cart.slice';

export const useCart = () => {
  const dispatch = useAppDispatch();
  const items = useSelector((state: RootState) => state.cart.items);

  return useMemo(
    () => ({
      addToCart: (product: Product) => dispatch(addItem(product)),
      clearCart: () => dispatch(clearCart()),
      decreaseQuantity: (productId: string) => dispatch(decreaseItemQuantity(productId)),
      items,
      removeFromCart: (productId: string) => dispatch(removeItem(productId)),
      totalItems: items.reduce((total, item) => total + item.quantity, 0),
      totalPrice: items.reduce((total, item) => total + item.product.price * item.quantity, 0),
    }),
    [dispatch, items],
  );
};
