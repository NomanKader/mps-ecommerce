import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

import { adminApi } from '@features/admin/api/adminApi';
import type { AdminCategory } from '@features/admin/types/admin.types';
import { merchandisingApi } from '@features/home/api/merchandisingApi';
import { useDebounce } from '@hooks/useDebounce';
import { toApiError } from '@shared/api/apiError';
import { AppButton } from '@shared/components/ui/Button/AppButton';
import { PageSection } from '@shared/components/ui/SectionTitle/PageSection';

type CategoryForm = {
  color: string;
  icon: string;
  name: string;
  primaryCategoryId: string;
};

type CategoryFilter = 'all' | 'with-subcategories' | 'large-assortment' | 'small-assortment';
type SubcategoryOption = {
  icon: string;
  label: string;
};
type SubcategoryRow = {
  category: AdminCategory;
  categoryId: string;
  categoryIcon: string;
  categoryName: string;
  id: string;
  icon: string;
  index: number;
  label: string;
  name: string;
  value: string;
};

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
  name: '',
  primaryCategoryId: '',
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

const parseSubcategory = (categoryIcon: string, value: string) => {
  const normalized = normalizeSubcategory(categoryIcon, value);
  const [first = '', ...rest] = normalized.split(' ');
  const hasSeparateIcon = rest.length > 0 && first.length <= 6;

  return {
    icon: hasSeparateIcon ? first : categoryIcon,
    label: normalized,
    name: hasSeparateIcon ? rest.join(' ') : normalized,
  };
};

const categoryPayloadWithSubcategories = (category: AdminCategory, subcategories: string[]) => ({
  color: category.color ?? '#2db34b',
  icon: category.icon ?? '🛒',
  name: category.name,
  slug: category.slug,
  subcategories,
});

const toForm = (category: AdminCategory): CategoryForm => {
  const icon = category.icon ?? '🛒';

  return {
    color: category.color ?? '#2db34b',
    icon,
    name: category.name,
    primaryCategoryId: '',
  };
};

export const CategoriesPage = () => {
  const queryClient = useQueryClient();
  const location = useLocation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<SubcategoryRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminCategory | null>(null);
  const [deleteSubcategoryTarget, setDeleteSubcategoryTarget] = useState<SubcategoryRow | null>(
    null,
  );
  const [filter, setFilter] = useState<CategoryFilter>('all');
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const categoriesQuery = useQuery({
    queryFn: ({ signal }) => adminApi.listCategories({ search: debouncedSearch }, { signal }),
    queryKey: ['admin', 'categories', debouncedSearch],
  });
  const iconsQuery = useQuery({
    queryFn: ({ signal }) => merchandisingApi.listAdminStorefrontIcons({}, { signal }),
    queryKey: ['admin', 'storefront-icons'],
  });
  const isSubCategoryPage = location.pathname.includes('/sub-category');
  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);
  const primaryCategory = useMemo(
    () => categories.find((category) => category.id === form.primaryCategoryId),
    [categories, form.primaryCategoryId],
  );
  const iconOptions = useMemo(() => {
    const uniqueIcons = new Map<string, { icon: string; label: string }>();

    (iconsQuery.data ?? []).forEach((item) => {
      if (item.icon && !uniqueIcons.has(item.icon)) {
        uniqueIcons.set(item.icon, { icon: item.icon, label: item.label });
      }
    });

    if (form.icon && !uniqueIcons.has(form.icon)) {
      uniqueIcons.set(form.icon, { icon: form.icon, label: 'Saved icon' });
    }

    return [...uniqueIcons.values()];
  }, [form.icon, iconsQuery.data]);

  const subcategoryRows = useMemo(
    () =>
      categories.flatMap((category) =>
        (category.subcategories ?? []).map((subcategory, index) => {
          const categoryIcon = category.icon ?? '🛒';
          const parsed = parseSubcategory(categoryIcon, subcategory);

          return {
            category,
            categoryId: category.id,
            categoryIcon,
            categoryName: category.name,
            id: `${category.id}:${index}`,
            icon: parsed.icon,
            index,
            label: parsed.label,
            name: parsed.name,
            value: subcategory,
          };
        }),
      ),
    [categories],
  );

  const filteredSubcategoryRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return subcategoryRows.filter((subcategory) => {
      const searchableValue = [
        subcategory.name,
        subcategory.label,
        subcategory.icon,
        subcategory.categoryName,
      ]
        .join(' ')
        .toLowerCase();

      return normalizedSearch ? searchableValue.includes(normalizedSearch) : true;
    });
  }, [search, subcategoryRows]);

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

      if (isSubCategoryPage) {
        if (!form.primaryCategoryId || !primaryCategory) {
          throw new Error('Select a primary category for this sub category.');
        }

        const subcategory = `${form.icon.trim() || primaryCategory.icon || '🛒'} ${trimmedName}`;
        const subcategories = primaryCategory.subcategories ?? [];
        const duplicateIndex = subcategories.findIndex(
          (item) => item.toLowerCase() === subcategory.toLowerCase(),
        );
        const isEditingSameSubcategory =
          editingSubcategory?.categoryId === primaryCategory.id &&
          duplicateIndex === editingSubcategory.index;

        if (duplicateIndex !== -1 && !isEditingSameSubcategory) {
          throw new Error('This sub category already exists in the selected primary category.');
        }

        const nextSubcategories = editingSubcategory
          ? subcategories.map((item, index) =>
              index === editingSubcategory.index ? subcategory : item,
            )
          : [...subcategories, subcategory];

        return adminApi.updateCategory(primaryCategory.id, {
          ...categoryPayloadWithSubcategories(primaryCategory, nextSubcategories),
        });
      }

      const slug = slugify(trimmedName);
      const categoryPayload = {
        color: form.color || '#2db34b',
        icon: form.icon.trim() || '🛒',
        name: trimmedName,
        slug,
      };

      return editingId
        ? adminApi.updateCategory(editingId, categoryPayload)
        : adminApi.createCategory(categoryPayload);
    },
    onError: (error) => toast.error(toApiError(error).message),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      await queryClient.invalidateQueries({ queryKey: ['admin', 'storefront-icons'] });
      await queryClient.invalidateQueries({ queryKey: ['storefront', 'icons'] });
      toast.success(result.message);
      setEditingId(null);
      setEditingSubcategory(null);
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
  const deleteSubcategoryMutation = useMutation({
    mutationFn: (subcategory: SubcategoryRow) => {
      const nextSubcategories = (subcategory.category.subcategories ?? []).filter(
        (_item, index) => index !== subcategory.index,
      );

      return adminApi.updateCategory(
        subcategory.categoryId,
        categoryPayloadWithSubcategories(subcategory.category, nextSubcategories),
      );
    },
    onError: (error) => toast.error(toApiError(error).message),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      toast.success(result.message);
      setDeleteSubcategoryTarget(null);
    },
  });

  const openCreateDialog = () => {
    setEditingId(null);
    setEditingSubcategory(null);
    setForm({
      ...emptyForm,
      icon: iconOptions[0]?.icon ?? emptyForm.icon,
      primaryCategoryId: isSubCategoryPage ? (categories[0]?.id ?? '') : '',
    });
    setIsCategoryDialogOpen(true);
  };

  const openEditDialog = (category: AdminCategory) => {
    setEditingId(category.id);
    setEditingSubcategory(null);
    setForm(toForm(category));
    setIsCategoryDialogOpen(true);
  };

  const openEditSubcategoryDialog = (subcategory: SubcategoryRow) => {
    setEditingId(null);
    setEditingSubcategory(subcategory);
    setForm({
      color: subcategory.category.color ?? '#2db34b',
      icon: subcategory.icon,
      name: subcategory.name,
      primaryCategoryId: subcategory.categoryId,
    });
    setIsCategoryDialogOpen(true);
  };

  return (
    <PageSection
      action={
        <AppButton onClick={openCreateDialog} startIcon={<AddRoundedIcon />}>
          {isSubCategoryPage ? 'New sub category' : 'New category'}
        </AppButton>
      }
      description={
        isSubCategoryPage
          ? 'Manage sub categories under their parent primary category.'
          : 'Manage customer-facing storefront categories, icons, and subcategory navigation.'
      }
      title={isSubCategoryPage ? 'Sub Category' : 'Categories'}
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
          label={isSubCategoryPage ? 'Search sub categories' : 'Search categories'}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={
            isSubCategoryPage
              ? 'Sub category or parent category'
              : 'Category, slug, icon, or subcategory'
          }
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
        {isSubCategoryPage ? null : (
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
        )}
        <Typography color="text.secondary" sx={{ ml: { lg: 'auto' } }} variant="body2">
          {isSubCategoryPage
            ? `Showing ${filteredSubcategoryRows.length} of ${subcategoryRows.length}`
            : `Showing ${filteredCategories.length} of ${categories.length}`}
        </Typography>
      </Stack>

      {isSubCategoryPage ? (
        <Grid container spacing={2}>
          {filteredSubcategoryRows.map((subcategory) => (
            <Grid key={subcategory.id} size={{ lg: 4, md: 6, xs: 12 }}>
              <Card sx={{ borderRadius: 1, height: '100%' }}>
                <CardContent>
                  <Stack
                    direction="row"
                    sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
                  >
                    <Stack direction="row" spacing={1.5} sx={{ minWidth: 0 }}>
                      <Box
                        sx={{
                          alignItems: 'center',
                          bgcolor: subcategory.category.color ?? 'primary.main',
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
                        {subcategory.icon}
                      </Box>
                      <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                        <Typography noWrap variant="h6">
                          {subcategory.name}
                        </Typography>
                        <Typography color="text.secondary" variant="body2">
                          {subcategory.categoryName}
                        </Typography>
                        <Chip label={subcategory.label} size="small" variant="outlined" />
                      </Stack>
                    </Stack>
                    <Stack direction="row">
                      <IconButton
                        aria-label={`Edit ${subcategory.name}`}
                        onClick={() => openEditSubcategoryDialog(subcategory)}
                      >
                        <EditRoundedIcon />
                      </IconButton>
                      <IconButton
                        aria-label={`Delete ${subcategory.name}`}
                        onClick={() => setDeleteSubcategoryTarget(subcategory)}
                      >
                        <DeleteOutlineRoundedIcon />
                      </IconButton>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
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
      )}
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
        <DialogTitle>
          {editingId
            ? 'Edit Category'
            : isSubCategoryPage
              ? editingSubcategory
                ? 'Edit Sub Category'
                : 'Create Sub Category'
              : 'Create Category'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.25} sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid size={{ sm: 8, xs: 12 }}>
                <TextField
                  autoFocus
                  fullWidth
                  label={isSubCategoryPage ? 'Sub category name' : 'Category name'}
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
                    }))
                  }
                  slotProps={{
                    select: {
                      renderValue: (selected) => (
                        <Box component="span" sx={{ fontSize: 22, lineHeight: 1 }}>
                          {selected as string}
                        </Box>
                      ),
                    },
                  }}
                  value={form.icon}
                >
                  {iconsQuery.isLoading ? (
                    <MenuItem disabled value="">
                      Loading icons...
                    </MenuItem>
                  ) : null}
                  {!iconsQuery.isLoading && iconOptions.length === 0 ? (
                    <MenuItem disabled value="">
                      Create icons in Icon first
                    </MenuItem>
                  ) : null}
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
            {isSubCategoryPage ? (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Primary category"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        primaryCategoryId: event.target.value,
                      }))
                    }
                    disabled={Boolean(editingSubcategory)}
                    select
                    value={form.primaryCategoryId}
                  >
                    {categoriesQuery.isLoading ? (
                      <MenuItem disabled value="">
                        Loading primary categories...
                      </MenuItem>
                    ) : null}
                    {!categoriesQuery.isLoading && categories.length === 0 ? (
                      <MenuItem disabled value="">
                        Create a primary category first
                      </MenuItem>
                    ) : null}
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            ) : null}
            <Stack spacing={1.25}>
              <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
                <Box
                  sx={{
                    alignItems: 'center',
                    bgcolor: form.color,
                    borderRadius: 1,
                    color: '#ffffff',
                    display: 'flex',
                    fontSize: 24,
                    height: 46,
                    justifyContent: 'center',
                    width: 46,
                  }}
                >
                  {form.icon}
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 800 }} variant="body2">
                    Theme color
                  </Typography>
                  <Typography color="text.secondary" variant="caption">
                    Click the picker and choose a custom shade.
                  </Typography>
                </Box>
              </Stack>
              <Box
                component="label"
                sx={{
                  alignItems: 'center',
                  bgcolor: form.color,
                  border: '1px solid rgba(255,255,255,0.72)',
                  borderRadius: 1,
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.72), 0 14px 32px rgba(0,0,0,0.1)',
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  fontWeight: 900,
                  height: 64,
                  justifyContent: 'center',
                  overflow: 'hidden',
                  position: 'relative',
                  textTransform: 'uppercase',
                }}
              >
                {form.color}
                <Box
                  component="input"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, color: event.target.value }))
                  }
                  sx={{
                    cursor: 'pointer',
                    inset: 0,
                    opacity: 0,
                    position: 'absolute',
                  }}
                  type="color"
                  value={form.color}
                />
              </Box>
            </Stack>
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
            {editingId
              ? 'Save category'
              : isSubCategoryPage
                ? editingSubcategory
                  ? 'Save sub category'
                  : 'Add sub category'
                : 'Add category'}
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
      <Dialog
        fullWidth
        maxWidth="xs"
        onClose={() => setDeleteSubcategoryTarget(null)}
        open={Boolean(deleteSubcategoryTarget)}
      >
        <DialogTitle>Delete Sub Category?</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            Delete {deleteSubcategoryTarget?.name} from {deleteSubcategoryTarget?.categoryName}?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <AppButton
            color="inherit"
            onClick={() => setDeleteSubcategoryTarget(null)}
            variant="outlined"
          >
            Cancel
          </AppButton>
          <AppButton
            color="error"
            disabled={deleteSubcategoryMutation.isPending}
            onClick={() =>
              deleteSubcategoryTarget && deleteSubcategoryMutation.mutate(deleteSubcategoryTarget)
            }
          >
            Delete
          </AppButton>
        </DialogActions>
      </Dialog>
    </PageSection>
  );
};
