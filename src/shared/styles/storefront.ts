import type { SxProps, Theme } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { storefrontColors } from '@app/providers/theme/tokens';

export const storefrontShellSx: SxProps<Theme> = {
  background:
    'radial-gradient(circle at 8% 0%, rgba(216, 169, 66, 0.14), transparent 30%), linear-gradient(180deg, #fffdf9 0%, #fbf7f1 100%)',
};

export const storefrontPanelSx: SxProps<Theme> = {
  background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,252,248,0.94) 100%)',
  border: `1px solid ${storefrontColors.border}`,
  borderRadius: 2,
  boxShadow: `0 22px 55px ${alpha('#4a2418', 0.1)}`,
};

export const storefrontMutedPanelSx: SxProps<Theme> = {
  ...storefrontPanelSx,
  background: 'linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(246,239,230,0.95) 100%)',
};

export const storefrontSectionTitleSx: SxProps<Theme> = {
  color: storefrontColors.navy,
  fontWeight: 900,
  letterSpacing: 0,
};

export const storefrontIconButtonSx: SxProps<Theme> = {
  border: `1px solid ${storefrontColors.border}`,
  borderRadius: 2,
  boxShadow: `0 12px 26px ${alpha('#4a2418', 0.08)}`,
  color: storefrontColors.navy,
  height: 70,
  width: 70,
  '&:hover': {
    backgroundColor: storefrontColors.accentSoft,
    borderColor: alpha(storefrontColors.accent, 0.45),
    boxShadow: `0 16px 34px ${alpha('#4a2418', 0.12)}`,
  },
};
