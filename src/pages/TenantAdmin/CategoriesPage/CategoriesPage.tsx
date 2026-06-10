import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
  Box,
  Alert,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { adminApi } from '@features/admin/api/adminApi';
import type { AdminCategory } from '@features/admin/types/admin.types';
import { useDebounce } from '@hooks/useDebounce';
import { toApiError } from '@shared/api/apiError';
import { AppButton } from '@shared/components/ui/Button/AppButton';
import { PageSection } from '@shared/components/ui/SectionTitle/PageSection';

type CategoryForm = {
  color: string;
  icon: string;
  itemCount: string;
  name: string;
  subcategories: string[];
};

type CategoryFilter = 'all' | 'with-subcategories' | 'large-assortment' | 'small-assortment';
type SubcategoryOption = {
  icon: string;
  label: string;
};

const categoryIconOptions = [
  { icon: '🥬', label: 'Leafy greens' },
  { icon: '🍎', label: 'Fruits' },
  { icon: '🥦', label: 'Vegetables' },
  { icon: '🥕', label: 'Root vegetables' },
  { icon: '🍞', label: 'Bakery' },
  { icon: '🥛', label: 'Dairy' },
  { icon: '🥚', label: 'Eggs' },
  { icon: '🥩', label: 'Meat' },
  { icon: '🐟', label: 'Seafood' },
  { icon: '🍚', label: 'Rice & grains' },
  { icon: '🧂', label: 'Pantry' },
  { icon: '🥫', label: 'Canned goods' },
  { icon: '🍪', label: 'Snacks' },
  { icon: '🧃', label: 'Beverages' },
  { icon: '🧊', label: 'Frozen' },
  { icon: '🧴', label: 'Household' },
  { icon: '🛒', label: 'General grocery' },
];

const categorySubcategoryOptions: Record<string, SubcategoryOption[]> = {
  '🥬': [
    { icon: '🥬', label: 'Lettuce' },
    { icon: '🌱', label: 'Spinach' },
    { icon: '🥬', label: 'Kale' },
    { icon: '🥬', label: 'Cabbage' },
    { icon: '🥬', label: 'Bok Choy' },
    { icon: '🌿', label: 'Fresh Herbs' },
    { icon: '🥗', label: 'Salad Mixes' },
  ],
  '🍎': [
    { icon: '🍎', label: 'Apples & Pears' },
    { icon: '🍊', label: 'Citrus' },
    { icon: '🫐', label: 'Berries' },
    { icon: '🍌', label: 'Bananas' },
    { icon: '🍈', label: 'Melons' },
    { icon: '🥭', label: 'Tropical Fruits' },
    { icon: '🍑', label: 'Stone Fruits' },
  ],
  '🥦': [
    { icon: '🥦', label: 'Broccoli' },
    { icon: '🥦', label: 'Cauliflower' },
    { icon: '🍅', label: 'Tomatoes' },
    { icon: '🥒', label: 'Cucumbers' },
    { icon: '🫑', label: 'Peppers' },
    { icon: '🍄', label: 'Mushrooms' },
    { icon: '🥗', label: 'Mixed Vegetables' },
  ],
  '🥕': [
    { icon: '🥕', label: 'Carrots' },
    { icon: '🥔', label: 'Potatoes' },
    { icon: '🧅', label: 'Onions' },
    { icon: '🧄', label: 'Garlic' },
    { icon: '🫜', label: 'Beetroot' },
    { icon: '🫜', label: 'Radish' },
    { icon: '🍠', label: 'Sweet Potatoes' },
  ],
  '🍞': [
    { icon: '🍞', label: 'Bread' },
    { icon: '🥖', label: 'Buns & Rolls' },
    { icon: '🥐', label: 'Pastries' },
    { icon: '🍰', label: 'Cakes' },
    { icon: '🫓', label: 'Tortillas' },
    { icon: '🥯', label: 'Breakfast Bakery' },
  ],
  '🥛': [
    { icon: '🥛', label: 'Milk' },
    { icon: '🧀', label: 'Cheese' },
    { icon: '🥣', label: 'Yogurt' },
    { icon: '🧈', label: 'Butter' },
    { icon: '🥛', label: 'Cream' },
    { icon: '🌱', label: 'Plant-Based Dairy' },
  ],
  '🥚': [
    { icon: '🥚', label: 'Chicken Eggs' },
    { icon: '🥚', label: 'Duck Eggs' },
    { icon: '🌿', label: 'Organic Eggs' },
    { icon: '🐔', label: 'Free-Range Eggs' },
  ],
  '🥩': [
    { icon: '🥩', label: 'Beef' },
    { icon: '🍗', label: 'Chicken' },
    { icon: '🥓', label: 'Pork' },
    { icon: '🥩', label: 'Lamb' },
    { icon: '🌭', label: 'Sausages' },
    { icon: '🥩', label: 'Marinated Meat' },
  ],
  '🐟': [
    { icon: '🐟', label: 'Fish' },
    { icon: '🦐', label: 'Shrimp' },
    { icon: '🦀', label: 'Crab' },
    { icon: '🦑', label: 'Squid' },
    { icon: '🦪', label: 'Shellfish' },
    { icon: '🐟', label: 'Seafood Packs' },
  ],
  '🍚': [
    { icon: '🍚', label: 'Rice' },
    { icon: '🍜', label: 'Noodles' },
    { icon: '🍝', label: 'Pasta' },
    { icon: '🌾', label: 'Flour' },
    { icon: '🫘', label: 'Beans' },
    { icon: '🫘', label: 'Lentils' },
    { icon: '🥣', label: 'Breakfast Grains' },
  ],
  '🧂': [
    { icon: '🫙', label: 'Cooking Oil' },
    { icon: '🥫', label: 'Sauces' },
    { icon: '🌶️', label: 'Spices' },
    { icon: '🧂', label: 'Condiments' },
    { icon: '🍬', label: 'Sugar' },
    { icon: '🧂', label: 'Salt' },
    { icon: '🥣', label: 'Baking Essentials' },
  ],
  '🥫': [
    { icon: '🐟', label: 'Canned Fish' },
    { icon: '🥫', label: 'Canned Vegetables' },
    { icon: '🍑', label: 'Canned Fruit' },
    { icon: '🍲', label: 'Soup' },
    { icon: '🍱', label: 'Ready Meals' },
  ],
  '🍪': [
    { icon: '🍪', label: 'Biscuits' },
    { icon: '🍟', label: 'Chips' },
    { icon: '🥜', label: 'Nuts' },
    { icon: '🍫', label: 'Chocolate' },
    { icon: '🍬', label: 'Candy' },
    { icon: '🥨', label: 'Crackers' },
  ],
  '🧃': [
    { icon: '🧃', label: 'Juice' },
    { icon: '🥤', label: 'Soft Drinks' },
    { icon: '💧', label: 'Water' },
    { icon: '🍵', label: 'Tea' },
    { icon: '☕', label: 'Coffee' },
    { icon: '⚡', label: 'Energy Drinks' },
  ],
  '🧊': [
    { icon: '🥦', label: 'Frozen Vegetables' },
    { icon: '🥩', label: 'Frozen Meat' },
    { icon: '🐟', label: 'Frozen Seafood' },
    { icon: '🍨', label: 'Ice Cream' },
    { icon: '🍱', label: 'Frozen Meals' },
  ],
  '🧴': [
    { icon: '🧽', label: 'Cleaning' },
    { icon: '🧺', label: 'Laundry' },
    { icon: '🧻', label: 'Paper Goods' },
    { icon: '🧴', label: 'Personal Care' },
    { icon: '🍽️', label: 'Kitchen Supplies' },
  ],
  '🛒': [
    { icon: '🥬', label: 'Fresh Food' },
    { icon: '🧂', label: 'Pantry' },
    { icon: '🧴', label: 'Household' },
    { icon: '🧃', label: 'Beverages' },
    { icon: '🍪', label: 'Snacks' },
    { icon: '🛒', label: 'Daily Essentials' },
  ],
};

const emptyForm: CategoryForm = {
  color: '#2db34b',
  icon: '🥬',
  itemCount: '0',
  name: '',
  subcategories: [],
};

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replaceAll('&', 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const subcategoryValue = (option: SubcategoryOption) =>
  option.icon ? `${option.icon} ${option.label}` : option.label;

const normalizeSubcategory = (categoryIcon: string, value: string) => {
  const match = (categorySubcategoryOptions[categoryIcon] ?? []).find(
    (option) => value === option.label || value === subcategoryValue(option),
  );

  return match ? subcategoryValue(match) : value;
};

const toForm = (category: AdminCategory): CategoryForm => {
  const icon = category.icon ?? '🛒';

  return {
    color: category.color ?? '#2db34b',
    icon,
    itemCount: String(category.itemCount),
    name: category.name,
    subcategories: category.subcategories.map((subcategory) =>
      normalizeSubcategory(icon, subcategory),
    ),
  };
};

const mergeOptions = (primary: SubcategoryOption[], selected: string[]) => {
  const primaryValues = new Set(primary.map(subcategoryValue));
  const savedOptions = selected
    .filter((value) => !primaryValues.has(value))
    .map((value) => ({ icon: '', label: value }));

  return [...savedOptions, ...primary];
};

export const CategoriesPage = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminCategory | null>(null);
  const [filter, setFilter] = useState<CategoryFilter>('all');
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const categoriesQuery = useQuery({
    queryFn: ({ signal }) => adminApi.listCategories({ search: debouncedSearch }, { signal }),
    queryKey: ['admin', 'categories', debouncedSearch],
  });
  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);
  const iconOptions = useMemo(
    () =>
      form.icon && !categoryIconOptions.some((option) => option.icon === form.icon)
        ? [{ icon: form.icon, label: 'Saved icon' }, ...categoryIconOptions]
        : categoryIconOptions,
    [form.icon],
  );
  const subcategoryOptions = useMemo(
    () => mergeOptions(categorySubcategoryOptions[form.icon] ?? [], form.subcategories),
    [form.icon, form.subcategories],
  );

  const filteredCategories = useMemo(
    () =>
      categories.filter((category) => {
        const normalizedSearch = search.trim().toLowerCase();
        const searchableValue = [
          category.name,
          category.slug,
          category.icon,
          ...category.subcategories,
        ]
          .join(' ')
          .toLowerCase();
        const matchesSearch = normalizedSearch ? searchableValue.includes(normalizedSearch) : true;
        const matchesFilter =
          filter === 'all' ||
          (filter === 'with-subcategories' && Boolean(category.subcategories?.length)) ||
          (filter === 'large-assortment' && category.itemCount >= 40) ||
          (filter === 'small-assortment' && category.itemCount < 40);

        return matchesSearch && matchesFilter;
      }),
    [categories, filter, search],
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      const trimmedName = form.name.trim();

      if (!trimmedName) {
        throw new Error('Category name is required.');
      }

      const slug = slugify(trimmedName);
      const categoryPayload = {
        color: form.color || '#2db34b',
        icon: form.icon.trim() || '🛒',
        itemCount: Number(form.itemCount) || 0,
        name: trimmedName,
        slug,
        subcategories: form.subcategories,
      };

      return editingId
        ? adminApi.updateCategory(editingId, categoryPayload)
        : adminApi.createCategory(categoryPayload);
    },
    onError: (error) => toast.error(toApiError(error).message),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      toast.success(result.message);
      setEditingId(null);
      setForm(emptyForm);
      setIsCategoryDialogOpen(false);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteCategory,
    onError: (error) => toast.error(toApiError(error).message),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      toast.success(result.message);
      setDeleteTarget(null);
    },
  });

  const openCreateDialog = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsCategoryDialogOpen(true);
  };

  const openEditDialog = (category: AdminCategory) => {
    setEditingId(category.id);
    setForm(toForm(category));
    setIsCategoryDialogOpen(true);
  };

  return (
    <PageSection
      action={
        <AppButton onClick={openCreateDialog} startIcon={<AddRoundedIcon />}>
          New category
        </AppButton>
      }
      description="Manage customer-facing storefront categories, icons, and subcategory navigation."
      title="Categories"
    >
      <Stack
        direction={{ lg: 'row', xs: 'column' }}
        spacing={2}
        sx={{
          alignItems: { lg: 'center', xs: 'stretch' },
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          mb: 2,
          p: 2,
        }}
      >
        <TextField
          label="Search categories"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Category, slug, icon, or subcategory"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ minWidth: { lg: 360 } }}
          value={search}
        />
        <TextField
          label="Filter"
          onChange={(event) => setFilter(event.target.value as CategoryFilter)}
          select
          sx={{ minWidth: { lg: 220 } }}
          value={filter}
        >
          <MenuItem value="all">All categories</MenuItem>
          <MenuItem value="with-subcategories">With subcategories</MenuItem>
          <MenuItem value="large-assortment">40+ items</MenuItem>
          <MenuItem value="small-assortment">Under 40 items</MenuItem>
        </TextField>
        <Typography color="text.secondary" sx={{ ml: { lg: 'auto' } }} variant="body2">
          Showing {filteredCategories.length} of {categories.length}
        </Typography>
      </Stack>

      <Grid container spacing={2}>
        {filteredCategories.map((category) => (
          <Grid key={category.id} size={{ lg: 4, md: 6, xs: 12 }}>
            <Card sx={{ borderRadius: 1, height: '100%' }}>
              <CardContent>
                <Stack spacing={2}>
                  <Stack
                    direction="row"
                    sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
                  >
                    <Stack direction="row" spacing={1.5} sx={{ minWidth: 0 }}>
                      <Box
                        sx={{
                          alignItems: 'center',
                          bgcolor: category.color ?? 'primary.main',
                          borderRadius: 1,
                          color: 'common.white',
                          display: 'flex',
                          flexShrink: 0,
                          fontSize: 24,
                          height: 48,
                          justifyContent: 'center',
                          width: 48,
                        }}
                      >
                        {category.icon ?? '🛒'}
                      </Box>
                      <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                        <Typography noWrap variant="h6">
                          {category.name}
                        </Typography>
                        <Typography color="text.secondary" variant="body2">
                          {category.itemCount} items · {(category.subcategories ?? []).length}{' '}
                          subcategories
                        </Typography>
                        <Typography color="text.secondary" variant="caption">
                          /{category.slug}
                        </Typography>
                      </Stack>
                    </Stack>
                    <Stack direction="row">
                      <IconButton
                        aria-label={`Edit ${category.name}`}
                        onClick={() => openEditDialog(category)}
                      >
                        <EditRoundedIcon />
                      </IconButton>
                      <IconButton
                        aria-label={`Delete ${category.name}`}
                        onClick={() => setDeleteTarget(category)}
                      >
                        <DeleteOutlineRoundedIcon />
                      </IconButton>
                    </Stack>
                  </Stack>

                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                    {category.subcategories.slice(0, 8).map((subcategory) => (
                      <Chip
                        key={subcategory}
                        label={normalizeSubcategory(category.icon ?? '🛒', subcategory)}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                    {(category.subcategories ?? []).length > 8 ? (
                      <Chip
                        label={`+${(category.subcategories ?? []).length - 8} more`}
                        size="small"
                      />
                    ) : null}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {categoriesQuery.isLoading ? <Alert severity="info">Loading categories...</Alert> : null}
      {categoriesQuery.isError ? (
        <Alert severity="error">{toApiError(categoriesQuery.error).message}</Alert>
      ) : null}

      <Dialog
        fullWidth
        maxWidth="sm"
        onClose={() => setIsCategoryDialogOpen(false)}
        open={isCategoryDialogOpen}
      >
        <DialogTitle>{editingId ? 'Edit Category' : 'Create Category'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.25} sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid size={{ sm: 8, xs: 12 }}>
                <TextField
                  autoFocus
                  fullWidth
                  label="Category name"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }
                  value={form.name}
                />
              </Grid>
              <Grid size={{ sm: 4, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Icon"
                  select
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      icon: event.target.value,
                      subcategories: [],
                    }))
                  }
                  value={form.icon}
                >
                  {iconOptions.map((option) => (
                    <MenuItem key={`${option.icon}-${option.label}`} value={option.icon}>
                      <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
                        <Box component="span" sx={{ fontSize: 22, lineHeight: 1 }}>
                          {option.icon}
                        </Box>
                        <Typography variant="body2">{option.label}</Typography>
                      </Stack>
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid size={{ sm: 6, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Theme color"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, color: event.target.value }))
                  }
                  value={form.color}
                />
              </Grid>
              <Grid size={{ sm: 6, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Item count"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, itemCount: event.target.value }))
                  }
                  type="number"
                  value={form.itemCount}
                />
              </Grid>
            </Grid>
            <TextField
              helperText="Select the related subcategories for the chosen main category."
              label="Subcategories"
              select
              onChange={(event) => {
                const value = event.target.value;
                const subcategories = typeof value === 'string' ? value.split(',') : value;
                setForm((current) => ({ ...current, subcategories }));
              }}
              slotProps={{
                select: {
                  multiple: true,
                  renderValue: (selected) => (selected as string[]).join(', '),
                },
              }}
              value={form.subcategories}
            >
              {subcategoryOptions.map((subcategory) => {
                const value = subcategoryValue(subcategory);

                return (
                  <MenuItem key={value} value={value}>
                    <Checkbox checked={form.subcategories.includes(value)} />
                    <Box
                      component="span"
                      sx={{ display: 'inline-block', fontSize: 20, lineHeight: 1, minWidth: 30 }}
                    >
                      {subcategory.icon}
                    </Box>
                    <ListItemText primary={subcategory.label} />
                  </MenuItem>
                );
              })}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <AppButton
            color="inherit"
            onClick={() => setIsCategoryDialogOpen(false)}
            variant="outlined"
          >
            Cancel
          </AppButton>
          <AppButton disabled={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
            {editingId ? 'Save category' : 'Add category'}
          </AppButton>
        </DialogActions>
      </Dialog>
      <Dialog
        fullWidth
        maxWidth="xs"
        onClose={() => setDeleteTarget(null)}
        open={Boolean(deleteTarget)}
      >
        <DialogTitle>Delete Category?</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            Delete {deleteTarget?.name} from the storefront categories?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <AppButton color="inherit" onClick={() => setDeleteTarget(null)} variant="outlined">
            Cancel
          </AppButton>
          <AppButton
            color="error"
            disabled={deleteMutation.isPending}
            onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
          >
            Delete
          </AppButton>
        </DialogActions>
      </Dialog>
    </PageSection>
  );
};
