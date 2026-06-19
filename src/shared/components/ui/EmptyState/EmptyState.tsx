import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import { Box, Typography } from '@mui/material';

type EmptyStateProps = {
  description: string;
  title: string;
};

export const EmptyState = ({ description, title }: EmptyStateProps) => (
  <Box
    sx={{
      alignItems: 'center',
      border: '1px dashed',
      borderColor: 'divider',
      borderRadius: 1,
      display: 'grid',
      gap: 1,
      justifyItems: 'center',
      px: 4,
      py: 8,
      textAlign: 'center',
    }}
  >
    <Inventory2OutlinedIcon color="disabled" sx={{ fontSize: 40 }} />
    <Typography variant="h6">{title}</Typography>
    <Typography color="text.secondary" variant="body2">
      {description}
    </Typography>
  </Box>
);
