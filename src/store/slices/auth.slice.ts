import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { User } from '@entities/user/types/user.types';
import type { AuthSession } from '@features/auth/types/auth.types';

type AuthState = {
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  user: User | null;
};

const initialState: AuthState = {
  accessToken: null,
  isAuthenticated: false,
  isInitializing: true,
  user: null,
};

const authSlice = createSlice({
  initialState,
  name: 'auth',
  reducers: {
    clearSession(state) {
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isInitializing = false;
      state.user = null;
    },
    finishInitialization(state) {
      state.isInitializing = false;
    },
    setSession(state, action: PayloadAction<AuthSession>) {
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.isInitializing = false;
      state.user = action.payload.user;
    },
    updateUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
  },
});

export const { clearSession, finishInitialization, setSession, updateUser } = authSlice.actions;
export const authReducer = authSlice.reducer;
