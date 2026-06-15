import { Button, type ButtonProps } from '@mui/material';

export const AppButton = ({ sx, ...props }: ButtonProps) => (
  <Button
    size="medium"
    sx={[
      {
        borderRadius: 999,
        height: 48,
        lineHeight: 1.2,
        minHeight: 48,
        px: 2.5,
        textTransform: 'none',
        transition: 'transform 160ms ease, box-shadow 160ms ease, background-color 160ms ease',
        whiteSpace: 'nowrap',
        '&:hover': {
          transform: 'translateY(-1px)',
        },
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
    variant="contained"
    {...props}
  />
);
