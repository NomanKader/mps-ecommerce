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
          backgroundColor: 'rgba(255, 255, 255, 0.44)',
          borderColor: 'rgba(255, 255, 255, 0.72)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.76)',
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
          background: 'linear-gradient(145deg, rgba(255,255,255,0.72), rgba(255,248,240,0.48))',
          backdropFilter: 'blur(24px) saturate(142%)',
          border: '1px solid rgba(255, 255, 255, 0.64)',
          boxShadow: '0 24px 70px rgba(64, 35, 21, 0.11), inset 0 1px 0 rgba(255,255,255,0.72)',
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
        '.admin-liquid-glass .MuiPaper-root': {
          backgroundImage: 'none',
        },
        '.admin-liquid-glass .MuiDialog-paper': {
          background: 'linear-gradient(145deg, rgba(255,255,255,0.82), rgba(255,248,240,0.66))',
          backdropFilter: 'blur(30px) saturate(150%)',
          border: '1px solid rgba(255,255,255,0.72)',
          boxShadow: '0 34px 96px rgba(53, 24, 15, 0.28), inset 0 1px 0 rgba(255,255,255,0.82)',
          overflow: 'hidden',
        },
        '.admin-liquid-glass .MuiDialogTitle-root': {
          borderBottom: '1px solid rgba(255,255,255,0.62)',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.58), rgba(255,242,230,0.36))',
        },
        '.admin-liquid-glass .MuiDialogActions-root': {
          borderTop: '1px solid rgba(255,255,255,0.62)',
          background: 'rgba(255,255,255,0.34)',
        },
        '.admin-liquid-glass .MuiDataGrid-root, .admin-liquid-glass .MuiCard-root, .admin-liquid-glass .MuiDialog-paper':
          {
            position: 'relative',
          },
        '.admin-liquid-glass .MuiDataGrid-root::before, .admin-liquid-glass .MuiCard-root::before, .admin-liquid-glass .MuiDialog-paper::before':
          {
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.76), rgba(255,255,255,0.12) 42%, rgba(255,255,255,0))',
            content: '""',
            inset: 0,
            pointerEvents: 'none',
            position: 'absolute',
          },
        '.admin-liquid-glass .MuiCardContent-root, .admin-liquid-glass .MuiDataGrid-main, .admin-liquid-glass .MuiDialogContent-root, .admin-liquid-glass .MuiDialogActions-root, .admin-liquid-glass .MuiDialogTitle-root':
          {
            position: 'relative',
            zIndex: 1,
          },
        '.admin-liquid-glass section > .MuiStack-root + .MuiStack-root, .admin-liquid-glass section > .MuiStack-root + .MuiBox-root':
          {
            backdropFilter: 'blur(24px) saturate(142%)',
            background: 'linear-gradient(145deg, rgba(255,255,255,0.62), rgba(255,248,240,0.44))',
            borderColor: 'rgba(255,255,255,0.62)',
            boxShadow: '0 20px 56px rgba(83,36,23,0.08), inset 0 1px 0 rgba(255,255,255,0.74)',
          },
        '.admin-liquid-glass .MuiListItemButton-root': {
          transition: 'background-color 160ms ease, box-shadow 160ms ease, transform 160ms ease',
        },
        '.admin-liquid-glass .MuiListItemButton-root:hover': {
          backgroundColor: 'rgba(255,255,255,0.46)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.72)',
        },
        '.admin-liquid-glass .MuiListItemButton-root.active': {
          background: 'linear-gradient(135deg, rgba(255,255,255,0.72), rgba(198,37,31,0.12))',
          boxShadow: '0 12px 30px rgba(143,23,23,0.10), inset 0 1px 0 rgba(255,255,255,0.78)',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255,255,255,0.62)',
          backdropFilter: 'blur(16px) saturate(135%)',
          borderRadius: 14,
          '& fieldset': {
            borderColor: 'rgba(255,255,255,0.72)',
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
