import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { CartItem } from '@entities/cart/types/cart.types';
import type { Product } from '@entities/product/types/product.types';

type CartState = {
  items: CartItem[];
};

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  initialState,
  name: 'cart',
  reducers: {
    addItem(state, action: PayloadAction<Product>) {
      const existingItem = state.items.find((item) => item.product.id === action.payload.id);

      if (existingItem) {
        existingItem.quantity += 1;
        return;
      }

      state.items.push({
        product: action.payload,
        quantity: 1,
      });
    },
    clearCart(state) {
      state.items = [];
    },
    decreaseItemQuantity(state, action: PayloadAction<string>) {
      const existingItem = state.items.find((item) => item.product.id === action.payload);

      if (!existingItem) {
        return;
      }

      if (existingItem.quantity <= 1) {
        state.items = state.items.filter((item) => item.product.id !== action.payload);
        return;
      }

      existingItem.quantity -= 1;
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.product.id !== action.payload);
    },
  },
});

export const { addItem, clearCart, decreaseItemQuantity, removeItem } = cartSlice.actions;
export const cartReducer = cartSlice.reducer;
