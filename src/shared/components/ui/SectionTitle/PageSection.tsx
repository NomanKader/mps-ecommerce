import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
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
      sx={{
        alignItems: { md: 'center', xs: 'flex-start' },
        background: 'linear-gradient(135deg, rgba(255,255,255,0.42), rgba(255,248,240,0.2))',
        border: '1px solid',
        borderColor: (theme) => alpha(theme.palette.common.white, 0.56),
        borderRadius: 1,
        boxShadow: '0 18px 46px rgba(83, 36, 23, 0.06)',
        justifyContent: 'space-between',
        p: { sm: 2.25, xs: 1.75 },
      }}
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
