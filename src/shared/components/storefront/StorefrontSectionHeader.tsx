import { Box, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

import { storefrontColors } from '@app/providers/theme/tokens';
import { storefrontSectionTitleSx } from '@shared/styles/storefront';

type StorefrontSectionHeaderProps = {
  action?: ReactNode;
  description?: string;
  title: string;
};

export const StorefrontSectionHeader = ({
  action,
  description,
  title,
}: StorefrontSectionHeaderProps) => (
  <Stack
    direction={{ md: 'row', xs: 'column' }}
    spacing={2}
    sx={{ alignItems: { md: 'center', xs: 'flex-start' }, justifyContent: 'space-between' }}
  >
    <Box>
      <Typography sx={storefrontSectionTitleSx} variant="h3">
        {title}
      </Typography>
      {description ? (
        <Typography color={storefrontColors.muted} sx={{ maxWidth: 720, mt: 1.25 }} variant="body1">
          {description}
        </Typography>
      ) : null}
    </Box>
    {action}
  </Stack>
);
