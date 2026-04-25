import { combineReducers } from '@reduxjs/toolkit';

import { appReducer } from '@store/slices/app.slice';
import { authReducer } from '@store/slices/auth.slice';
import { cartReducer } from '@store/slices/cart.slice';
import { tenantReducer } from '@store/slices/tenant.slice';

export const rootReducer = combineReducers({
  app: appReducer,
  auth: authReducer,
  cart: cartReducer,
  tenant: tenantReducer,
});
