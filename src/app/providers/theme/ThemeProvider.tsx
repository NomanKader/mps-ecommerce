import { CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material';
import type { ReactNode } from 'react';
import { useSelector } from 'react-redux';

import { darkTheme, lightTheme } from '@app/providers/theme/theme';
import type { RootState } from '@store/index';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const mode = useSelector((state: RootState) => state.app.themeMode);
  const theme = mode === 'dark' ? darkTheme : lightTheme;

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};
