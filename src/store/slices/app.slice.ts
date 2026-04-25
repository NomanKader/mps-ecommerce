import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type ThemeMode = 'light' | 'dark';

type AppState = {
  sidebarOpen: boolean;
  themeMode: ThemeMode;
};

const initialState: AppState = {
  sidebarOpen: true,
  themeMode: 'light',
};

const appSlice = createSlice({
  initialState,
  name: 'app',
  reducers: {
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    setThemeMode(state, action: PayloadAction<ThemeMode>) {
      state.themeMode = action.payload;
    },
  },
});

export const { setSidebarOpen, setThemeMode } = appSlice.actions;
export const appReducer = appSlice.reducer;
