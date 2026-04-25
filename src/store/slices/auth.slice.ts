import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { User } from '@entities/user/types/user.types';
import type { AuthSession } from '@features/auth/types/auth.types';

type AuthState = {
  accessToken: string | null;
  isAuthenticated: boolean;
  user: User | null;
};

const initialState: AuthState = {
  accessToken: null,
  isAuthenticated: false,
  user: null,
};

const authSlice = createSlice({
  initialState,
  name: 'auth',
  reducers: {
    clearSession(state) {
      state.accessToken = null;
      state.isAuthenticated = false;
      state.user = null;
    },
    setSession(state, action: PayloadAction<AuthSession>) {
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.user = action.payload.user;
    },
  },
});

export const { clearSession, setSession } = authSlice.actions;
export const authReducer = authSlice.reducer;
