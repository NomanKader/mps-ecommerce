import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { useAppDispatch } from '@store/hooks';
import { setThemeMode } from '@store/slices/app.slice';
import type { RootState } from '@store/index';

export const useAppThemeMode = () => {
  const dispatch = useAppDispatch();
  const mode = useSelector((state: RootState) => state.app.themeMode);

  return useMemo(
    () => ({
      mode,
      toggleTheme: () => {
        dispatch(setThemeMode(mode === 'light' ? 'dark' : 'light'));
      },
    }),
    [dispatch, mode],
  );
};
