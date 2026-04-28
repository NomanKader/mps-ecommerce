import { createTheme } from '@mui/material/styles';

import { storefrontColors } from '@app/providers/theme/tokens';

const baseThemeOptions = {
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: '"Nunito Sans", "Segoe UI", sans-serif',
    h1: { fontSize: '3rem', fontWeight: 800 },
    h2: { fontSize: '2.4rem', fontWeight: 800 },
    h3: { fontSize: '2rem', fontWeight: 800 },
    h4: { fontSize: '1.5rem', fontWeight: 700 },
    h5: { fontSize: '1.25rem', fontWeight: 700 },
    subtitle1: { fontWeight: 700 },
    subtitle2: { fontWeight: 700 },
    button: { fontWeight: 700 },
  },
} as const;

export const lightTheme = createTheme({
  ...baseThemeOptions,
  palette: {
    background: {
      default: storefrontColors.page,
      paper: storefrontColors.surface,
    },
    error: {
      main: '#c45353',
    },
    primary: {
      main: storefrontColors.navy,
    },
    secondary: {
      main: storefrontColors.accent,
    },
    success: {
      main: storefrontColors.success,
    },
    text: {
      primary: storefrontColors.slate,
      secondary: storefrontColors.muted,
    },
  },
  spacing: 8,
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 18px 55px rgba(16, 43, 93, 0.08)',
        },
      },
    },
    MuiContainer: {
      defaultProps: {
        maxWidth: 'xl',
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: storefrontColors.page,
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  ...lightTheme,
  palette: {
    ...lightTheme.palette,
    mode: 'dark',
    background: {
      default: '#1e100d',
      paper: '#2b1712',
    },
    text: {
      primary: '#fff8f2',
      secondary: '#f6c9ba',
    },
  },
});
