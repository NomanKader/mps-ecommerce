import { Box, CircularProgress, Typography } from '@mui/material';

type AppLoaderProps = {
  label?: string;
};

export const AppLoader = ({ label = 'Loading content' }: AppLoaderProps) => (
  <Box
    sx={{
      alignItems: 'center',
      display: 'grid',
      gap: 2,
      justifyItems: 'center',
      py: 8,
    }}
  >
    <CircularProgress />
    <Typography color="text.secondary" variant="body2">
      {label}
    </Typography>
  </Box>
);
