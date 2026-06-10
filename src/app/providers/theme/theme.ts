import { createTheme } from '@mui/material/styles';

import { storefrontColors } from '@app/providers/theme/tokens';

const baseThemeOptions = {
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", "Segoe UI", sans-serif',
    h1: { fontSize: '3rem', fontWeight: 900, letterSpacing: 0 },
    h2: { fontSize: '2.4rem', fontWeight: 900, letterSpacing: 0 },
    h3: { fontSize: '2rem', fontWeight: 900, letterSpacing: 0 },
    h4: { fontSize: '1.5rem', fontWeight: 800, letterSpacing: 0 },
    h5: { fontSize: '1.25rem', fontWeight: 800, letterSpacing: 0 },
    subtitle1: { fontWeight: 700 },
    subtitle2: { fontWeight: 700 },
    button: { fontWeight: 800, letterSpacing: 0 },
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
      main: '#bd2d2a',
    },
    primary: {
      dark: storefrontColors.navyDark,
      light: '#ee6b5c',
      main: storefrontColors.navy,
    },
    secondary: {
      contrastText: '#2b211c',
      dark: '#a87c25',
      light: storefrontColors.accentSoft,
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
          boxShadow: '0 14px 40px rgba(61, 20, 15, 0.08)',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 999,
          height: 48,
          lineHeight: 1.2,
          minHeight: 48,
          textTransform: 'none',
          whiteSpace: 'nowrap',
        },
        outlined: {
          borderColor: storefrontColors.border,
        },
      },
      variants: [
        {
          props: { color: 'primary', variant: 'contained' },
          style: {
            background: `linear-gradient(135deg, ${storefrontColors.navy} 0%, ${storefrontColors.navyDark} 100%)`,
            boxShadow: '0 14px 28px rgba(143, 23, 23, 0.2)',
            color: '#ffffff',
            '&:hover': {
              boxShadow: '0 18px 34px rgba(143, 23, 23, 0.28)',
            },
          },
        },
      ],
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${storefrontColors.border}`,
          boxShadow: '0 22px 60px rgba(64, 35, 21, 0.1)',
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
          backgroundImage:
            'radial-gradient(circle at 8% -8%, rgba(216, 169, 66, 0.16), transparent 34%), radial-gradient(circle at 102% 4%, rgba(198, 37, 31, 0.1), transparent 30%)',
          color: storefrontColors.slate,
          textRendering: 'optimizeLegibility',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          borderRadius: 14,
          '& fieldset': {
            borderColor: storefrontColors.border,
          },
          '&:hover fieldset': {
            borderColor: storefrontColors.accent,
          },
          '&.Mui-focused fieldset': {
            borderColor: storefrontColors.navy,
            boxShadow: '0 0 0 4px rgba(198, 37, 31, 0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        rounded: {
          borderRadius: 16,
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
      default: '#18100d',
      paper: '#241815',
    },
    text: {
      primary: '#fffaf3',
      secondary: '#ead1c0',
    },
  },
});
