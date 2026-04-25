import { Button, type ButtonProps } from '@mui/material';

export const AppButton = (props: ButtonProps) => (
  <Button
    size="medium"
    sx={{
      borderRadius: 999,
      px: 2.5,
      textTransform: 'none',
    }}
    variant="contained"
    {...props}
  />
);
