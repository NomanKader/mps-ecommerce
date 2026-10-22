import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { isProductId } from '@entities/product/lib/isProductId';
import { useSelector } from 'react-redux';

import type { Product } from '@entities/product/types/product.types';
import { useAppDispatch } from '@store/hooks';
import type { RootState } from '@store/index';
import {
  addItem,
  clearCart,
  decreaseItemQuantity,
  removeItem,
  setItemMessage,
} from '@store/slices/cart.slice';

export const useCart = () => {
  const dispatch = useAppDispatch();
  const items = useSelector((state: RootState) => state.cart.items);

  return useMemo(
    () => ({
      addToCart: (product: Product) => {
        if (!isProductId(product.id)) {
          toast.error(
            'This product is no longer available. Please choose a product from the catalog.',
          );
          return;
        }
        dispatch(addItem(product));
      },
      clearCart: () => dispatch(clearCart()),
      decreaseQuantity: (productId: string) => dispatch(decreaseItemQuantity(productId)),
      items,
      removeFromCart: (productId: string) => dispatch(removeItem(productId)),
      saveMessage: (productId: string, message: string) =>
        dispatch(setItemMessage({ productId, message })),
      totalItems: items.reduce((total, item) => total + item.quantity, 0),
      totalPrice: items.reduce((total, item) => total + item.product.price * item.quantity, 0),
    }),
    [dispatch, items],
  );
};
