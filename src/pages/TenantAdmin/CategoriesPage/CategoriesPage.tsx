import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
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

import type { Category } from '@entities/category/types/category.types';
import { AppButton } from '@shared/components/ui/Button/AppButton';
import { PageSection } from '@shared/components/ui/SectionTitle/PageSection';
import { mockCategories } from '@shared/lib/mockData';

type CategoryForm = {
  color: string;
  icon: string;
  itemCount: string;
  name: string;
  subcategories: string;
};

type CategoryFilter = 'all' | 'with-subcategories' | 'large-assortment' | 'small-assortment';

const emptyForm: CategoryForm = {
  color: '#2db34b',
  icon: '🥬',
  itemCount: '0',
  name: '',
  subcategories: '',
};

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replaceAll('&', 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const subcategoriesToText = (category: Category) =>
  (category.subcategories ?? []).map((subcategory) => `${subcategory.icon} ${subcategory.name}`).join('\n');

const toForm = (category: Category): CategoryForm => ({
  color: category.color ?? '#2db34b',
  icon: category.icon ?? '🛒',
  itemCount: String(category.itemCount),
  name: category.name,
  subcategories: subcategoriesToText(category),
});

const parseSubcategories = (value: string, categorySlug: string): Category['subcategories'] =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(' ');
      const iconCandidate = parts[0] ?? '•';
      const nameParts = parts.slice(1);
      const name = nameParts.join(' ').trim() || iconCandidate;
      const icon = nameParts.length ? iconCandidate : '•';
      const slug = slugify(name);

      return {
        icon,
        id: `${categorySlug}-${slug}`,
        name,
        slug,
      };
    });

export const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<CategoryFilter>('all');
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredCategories = useMemo(
    () =>
      categories.filter((category) => {
        const normalizedSearch = search.trim().toLowerCase();
        const searchableValue = [
          category.name,
          category.slug,
          category.icon,
          ...(category.subcategories ?? []).flatMap((subcategory) => [
            subcategory.name,
            subcategory.slug,
            subcategory.icon,
          ]),
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

  const saveCategory = () => {
    const trimmedName = form.name.trim();

    if (!trimmedName) {
      return;
    }

    const slug = slugify(trimmedName);
    const categoryPayload: Category = {
      color: form.color || '#2db34b',
      icon: form.icon.trim() || '🛒',
      id: editingId ?? slug,
      itemCount: Number(form.itemCount) || 0,
      name: trimmedName,
      slug,
      subcategories: parseSubcategories(form.subcategories, slug),
    };

    setCategories((current) =>
      editingId
        ? current.map((category) => (category.id === editingId ? categoryPayload : category))
        : [categoryPayload, ...current],
    );

    setEditingId(null);
    setForm(emptyForm);
    setIsCategoryDialogOpen(false);
  };

  const openCreateDialog = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsCategoryDialogOpen(true);
  };

  const openEditDialog = (category: Category) => {
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
                  <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
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
                          {category.itemCount} items · {(category.subcategories ?? []).length} subcategories
                        </Typography>
                        <Typography color="text.secondary" variant="caption">
                          /{category.slug}
                        </Typography>
                      </Stack>
                    </Stack>
                    <Stack direction="row">
                      <IconButton aria-label={`Edit ${category.name}`} onClick={() => openEditDialog(category)}>
                        <EditRoundedIcon />
                      </IconButton>
                      <IconButton
                        aria-label={`Delete ${category.name}`}
                        onClick={() => setCategories((current) => current.filter((item) => item.id !== category.id))}
                      >
                        <DeleteOutlineRoundedIcon />
                      </IconButton>
                    </Stack>
                  </Stack>

                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                    {(category.subcategories ?? []).slice(0, 8).map((subcategory) => (
                      <Chip
                        icon={<span>{subcategory.icon}</span>}
                        key={subcategory.id}
                        label={subcategory.name}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                    {(category.subcategories ?? []).length > 8 ? (
                      <Chip label={`+${(category.subcategories ?? []).length - 8} more`} size="small" />
                    ) : null}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

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
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  value={form.name}
                />
              </Grid>
              <Grid size={{ sm: 4, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Icon"
                  onChange={(event) => setForm((current) => ({ ...current, icon: event.target.value }))}
                  value={form.icon}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid size={{ sm: 6, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Theme color"
                  onChange={(event) => setForm((current) => ({ ...current, color: event.target.value }))}
                  value={form.color}
                />
              </Grid>
              <Grid size={{ sm: 6, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Item count"
                  onChange={(event) => setForm((current) => ({ ...current, itemCount: event.target.value }))}
                  type="number"
                  value={form.itemCount}
                />
              </Grid>
            </Grid>
            <TextField
              helperText="Use one subcategory per line, for example: 🍎 Apples & Pears"
              label="Subcategories"
              minRows={6}
              multiline
              onChange={(event) => setForm((current) => ({ ...current, subcategories: event.target.value }))}
              value={form.subcategories}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <AppButton color="inherit" onClick={() => setIsCategoryDialogOpen(false)} variant="outlined">
            Cancel
          </AppButton>
          <AppButton onClick={saveCategory}>{editingId ? 'Save category' : 'Add category'}</AppButton>
        </DialogActions>
      </Dialog>
    </PageSection>
  );
};
