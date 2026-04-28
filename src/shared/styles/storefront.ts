import type { SxProps, Theme } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { storefrontColors } from '@app/providers/theme/tokens';

export const storefrontShellSx: SxProps<Theme> = {
  backgroundColor: storefrontColors.page,
};

export const storefrontPanelSx: SxProps<Theme> = {
  backgroundColor: storefrontColors.surface,
  border: `1px solid ${storefrontColors.border}`,
  borderRadius: 3,
  boxShadow: `0 18px 40px ${alpha('#9f1714', 0.08)}`,
};

export const storefrontMutedPanelSx: SxProps<Theme> = {
  ...storefrontPanelSx,
  backgroundColor: storefrontColors.surfaceMuted,
};

export const storefrontSectionTitleSx: SxProps<Theme> = {
  color: storefrontColors.navy,
  fontWeight: 800,
  letterSpacing: '-0.03em',
};

export const storefrontIconButtonSx: SxProps<Theme> = {
  border: `1px solid ${storefrontColors.border}`,
  borderRadius: 3,
  color: storefrontColors.navy,
  height: 70,
  width: 70,
};
