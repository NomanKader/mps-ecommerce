import { Box, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

type PageSectionProps = {
  action?: ReactNode;
  children: ReactNode;
  description?: string;
  title: string;
};

export const PageSection = ({ action, children, description, title }: PageSectionProps) => (
  <Box component="section" sx={{ display: 'grid', gap: 3 }}>
    <Stack
      direction={{ md: 'row', xs: 'column' }}
      spacing={2}
      sx={{ alignItems: { md: 'center', xs: 'flex-start' }, justifyContent: 'space-between' }}
    >
      <Box>
        <Typography variant="h4">{title}</Typography>
        {description ? (
          <Typography color="text.secondary" sx={{ mt: 1 }} variant="body1">
            {description}
          </Typography>
        ) : null}
      </Box>
      {action}
    </Stack>
    {children}
  </Box>
);
