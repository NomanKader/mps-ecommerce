import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { Grid, InputAdornment } from '@mui/material';

import { AppSelect } from '@shared/components/ui/Select/AppSelect';
import { AppTextField } from '@shared/components/ui/Input/AppTextField';

type ProductFiltersProps = {
  category: string;
  categoryOptions?: Array<{ label: string; value: string }>;
  onCategoryChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  search: string;
};

export const ProductFilters = ({
  category,
  categoryOptions,
  onCategoryChange,
  onSearchChange,
  search,
}: ProductFiltersProps) => (
  <Grid container spacing={2}>
    <Grid size={{ md: 7, xs: 12 }}>
      <AppTextField
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search products, tags, or SKU"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlinedIcon />
              </InputAdornment>
            ),
          },
        }}
        value={search}
      />
    </Grid>
    <Grid size={{ md: 5, xs: 12 }}>
      <AppSelect
        label="Category"
        onChange={(event) => onCategoryChange(event.target.value)}
        options={categoryOptions ?? [{ label: 'All categories', value: 'all' }]}
        value={category}
      />
    </Grid>
  </Grid>
);
