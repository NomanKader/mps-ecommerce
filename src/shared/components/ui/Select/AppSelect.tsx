import { FormControl, InputLabel, MenuItem, Select, type SelectChangeEvent } from '@mui/material';

type AppSelectOption = {
  label: string;
  value: string;
};

type AppSelectProps = {
  label: string;
  onChange: (event: SelectChangeEvent<string>) => void;
  options: AppSelectOption[];
  value: string;
};

export const AppSelect = ({ label, onChange, options, value }: AppSelectProps) => (
  <FormControl fullWidth>
    <InputLabel id={`${label}-select-label`}>{label}</InputLabel>
    <Select
      label={label}
      labelId={`${label}-select-label`}
      onChange={onChange}
      sx={{ borderRadius: 3 }}
      value={value}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);
