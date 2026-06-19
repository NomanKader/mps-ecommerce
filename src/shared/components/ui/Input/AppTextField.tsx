import { TextField, type TextFieldProps } from '@mui/material';

export const AppTextField = (props: TextFieldProps) => (
  <TextField
    fullWidth
    size="medium"
    {...props}
    sx={{
      '& .MuiOutlinedInput-root': {
        borderRadius: 1,
      },
      ...props.sx,
    }}
  />
);
