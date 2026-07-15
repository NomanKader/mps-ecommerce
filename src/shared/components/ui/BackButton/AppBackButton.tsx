import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { Button } from '@mui/material';
import { Link } from 'react-router-dom';

import { storefrontColors } from '@app/providers/theme/tokens';

type AppBackButtonProps = {
  label: string;
  to: string;
};

export const AppBackButton = ({ label, to }: AppBackButtonProps) => (
  <Button
    component={Link}
    startIcon={<ArrowBackRoundedIcon />}
    sx={{
      alignSelf: 'flex-start',
      border: `1px solid ${storefrontColors.border}`,
      borderRadius: 999,
      color: storefrontColors.navy,
      fontWeight: 850,
      minHeight: 42,
      px: 2,
      textTransform: 'none',
      '&:hover': {
        backgroundColor: '#f7f8fb',
        borderColor: storefrontColors.navy,
      },
    }}
    to={to}
  >
    {label}
  </Button>
);
