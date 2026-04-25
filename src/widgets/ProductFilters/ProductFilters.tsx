import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { Grid, InputAdornment } from '@mui/material';

import { AppSelect } from '@shared/components/ui/Select/AppSelect';
import { AppTextField } from '@shared/components/ui/Input/AppTextField';

type ProductFiltersProps = {
  category: string;
  onCategoryChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  search: string;
};

export const ProductFilters = ({
  category,
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
        options={[
          { label: 'All categories', value: 'all' },
          { label: 'Fresh Produce', value: 'cat-1' },
          { label: 'Fruits', value: 'fruits' },
          { label: 'Vegetables', value: 'vegetables' },
          { label: 'Quick Meals', value: 'quick-meals' },
          { label: 'Meat', value: 'meat' },
          { label: 'Seafood', value: 'seafood' },
          { label: 'Bakery', value: 'cat-2' },
          { label: 'Bakery Storefront', value: 'bakery' },
          { label: 'Pantry', value: 'cat-3' },
          { label: 'Pantry Storefront', value: 'pantry' },
          { label: 'Drinks', value: 'drinks' },
          { label: 'Frozen', value: 'frozen' },
          { label: 'Dairy', value: 'dairy' },
          { label: 'Self-care', value: 'care' },
          { label: 'Flowers', value: 'flowers' },
          { label: 'Gifts', value: 'gifts' },
        ]}
        value={category}
      />
    </Grid>
  </Grid>
);
