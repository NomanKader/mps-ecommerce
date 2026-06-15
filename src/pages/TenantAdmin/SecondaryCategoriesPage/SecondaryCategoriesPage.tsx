import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
  Box,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { GridActionsCellItem, type GridColDef } from '@mui/x-data-grid';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import { adminApi } from '@features/admin/api/adminApi';
import type {
  AdminSecondaryCategory,
  AdminSecondaryCategoryPayload,
} from '@features/admin/types/admin.types';
import { useDebounce } from '@hooks/useDebounce';
import { toApiError } from '@shared/api/apiError';
import { AppButton } from '@shared/components/ui/Button/AppButton';
import { AppDataTable } from '@shared/components/ui/DataTable/DataTable';
import { PageSection } from '@shared/components/ui/SectionTitle/PageSection';

type SecondaryCategoryForm = {
  color: string;
  icon: string;
  name: string;
  productId: string;
  status: AdminSecondaryCategory['status'];
  targetSectionId: AdminSecondaryCategory['targetSectionId'];
};

const emptyForm: SecondaryCategoryForm = {
  color: '#2db34b',
  icon: '🌿',
  name: '',
  productId: '',
  status: 'active',
  targetSectionId: 'top-offers',
};

const targetSectionOptions: Array<{
  label: string;
  value: AdminSecondaryCategory['targetSectionId'];
}> = [
  { label: 'Top Offers', value: 'top-offers' },
  { label: 'Top Blooms', value: 'top-blooms' },
  { label: 'New Season', value: 'new-season' },
  { label: 'Pantry Ready', value: 'pantry-ready' },
];

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const toPayload = (form: SecondaryCategoryForm): AdminSecondaryCategoryPayload => ({
  color: form.color,
  icon: form.icon.trim() || undefined,
  name: form.name.trim(),
  productId: form.productId,
  slug: slugify(form.name),
  status: form.status,
  targetSectionId: form.targetSectionId,
});

export const SecondaryCategoriesPage = () => {
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<AdminSecondaryCategory | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SecondaryCategoryForm>(emptyForm);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);

  const secondaryCategoriesQuery = useQuery({
    queryFn: ({ signal }) =>
      adminApi.listSecondaryCategories({ search: debouncedSearch }, { signal }),
    queryKey: ['admin', 'secondary-categories', debouncedSearch],
  });
  const productsQuery = useQuery({
    queryFn: ({ signal }) => adminApi.listProducts({}, { signal }),
    queryKey: ['admin', 'products', 'secondary-category-targets'],
  });

  const secondaryCategories = useMemo(
    () => secondaryCategoriesQuery.data ?? [],
    [secondaryCategoriesQuery.data],
  );
  const products = useMemo(() => productsQuery.data ?? [], [productsQuery.data]);
  const productById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );
  const targetSectionLabel = (sectionId: AdminSecondaryCategory['targetSectionId']) =>
    targetSectionOptions.find((option) => option.value === sectionId)?.label ?? sectionId;

  const columns: GridColDef<AdminSecondaryCategory>[] = [
    {
      field: 'name',
      flex: 1,
      headerName: 'Name',
      minWidth: 240,
      renderCell: (params) => (
        <Stack direction="row" spacing={1.2} sx={{ alignItems: 'center', minWidth: 0 }}>
          <Box
            sx={{
              alignItems: 'center',
              bgcolor: params.row.color ?? '#2db34b',
              borderRadius: '50%',
              color: '#ffffff',
              display: 'flex',
              flex: '0 0 auto',
              fontSize: 18,
              height: 34,
              justifyContent: 'center',
              width: 34,
            }}
          >
            {params.row.icon ?? '🌿'}
          </Box>
          <Stack sx={{ minWidth: 0 }}>
            <Typography noWrap sx={{ fontWeight: 800 }} variant="body2">
              {params.row.name}
            </Typography>
            <Typography noWrap color="text.secondary" variant="caption">
              /{params.row.slug}
            </Typography>
          </Stack>
        </Stack>
      ),
    },
    {
      field: 'targetSectionId',
      flex: 0.6,
      headerName: 'Target section',
      minWidth: 160,
      valueGetter: (_value, row) => targetSectionLabel(row.targetSectionId),
    },
    {
      field: 'productId',
      flex: 1,
      headerName: 'Product',
      minWidth: 220,
      valueGetter: (_value, row) => productById.get(row.productId)?.name ?? row.productId,
    },
    {
      field: 'status',
      headerName: 'Status',
      renderCell: (params) => (
        <Chip
          color={params.row.status === 'active' ? 'success' : 'default'}
          label={params.row.status}
          size="small"
        />
      ),
      width: 130,
    },
    {
      field: 'actions',
      getActions: ({ row }) => [
        <GridActionsCellItem
          icon={<EditRoundedIcon />}
          key="edit"
          label="Edit"
          onClick={() => {
            setEditingId(row.id);
            setForm({
              color: row.color ?? emptyForm.color,
              icon: row.icon ?? emptyForm.icon,
              name: row.name,
              productId: row.productId ?? '',
              status: row.status,
              targetSectionId: row.targetSectionId ?? 'top-offers',
            });
            setIsDialogOpen(true);
          }}
        />,
        <GridActionsCellItem
          icon={<DeleteOutlineRoundedIcon />}
          key="delete"
          label="Delete"
          onClick={() => setDeleteTarget(row)}
        />,
      ],
      type: 'actions',
      width: 90,
    },
  ];

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = toPayload(form);

      if (!payload.name) {
        throw new Error('Secondary category name is required.');
      }

      if (!payload.productId) {
        throw new Error('Select a product for this secondary category.');
      }

      return editingId
        ? adminApi.updateSecondaryCategory(editingId, payload)
        : adminApi.createSecondaryCategory(payload);
    },
    onError: (error) => toast.error(toApiError(error).message),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'secondary-categories'] });
      toast.success(result.message);
      setEditingId(null);
      setForm(emptyForm);
      setIsDialogOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteSecondaryCategory,
    onError: (error) => toast.error(toApiError(error).message),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'secondary-categories'] });
      toast.success(result.message);
      setDeleteTarget(null);
    },
  });

  return (
    <PageSection
      action={
        <AppButton
          onClick={() => {
            setEditingId(null);
            setForm(emptyForm);
            setIsDialogOpen(true);
          }}
          startIcon={<AddRoundedIcon />}
        >
          Add secondary category
        </AppButton>
      }
      description="Manage secondary categories and their target product placement."
      title="Secondary Category"
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
          label="Search secondary categories"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Name or icon"
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
        <Typography color="text.secondary" sx={{ ml: { lg: 'auto' } }} variant="body2">
          Showing {secondaryCategories.length}
        </Typography>
      </Stack>

      <AppDataTable
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        loading={secondaryCategoriesQuery.isLoading}
        rows={secondaryCategories}
      />

      <Dialog fullWidth maxWidth="sm" onClose={() => setIsDialogOpen(false)} open={isDialogOpen}>
        <DialogTitle>
          {editingId ? 'Edit secondary category' : 'Create secondary category'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.25} sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid size={{ sm: 8, xs: 12 }}>
                <TextField
                  autoFocus
                  fullWidth
                  label="Name"
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
                  onChange={(event) =>
                    setForm((current) => ({ ...current, icon: event.target.value }))
                  }
                  value={form.icon}
                />
              </Grid>
            </Grid>
            <TextField
              fullWidth
              label="Target section"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  targetSectionId: event.target.value as AdminSecondaryCategory['targetSectionId'],
                }))
              }
              select
              value={form.targetSectionId}
            >
              {targetSectionOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Product"
              onChange={(event) =>
                setForm((current) => ({ ...current, productId: event.target.value }))
              }
              select
              value={form.productId}
            >
              {productsQuery.isLoading ? (
                <MenuItem disabled value="">
                  Loading products...
                </MenuItem>
              ) : null}
              {!productsQuery.isLoading && products.length === 0 ? (
                <MenuItem disabled value="">
                  Create products first
                </MenuItem>
              ) : null}
              {products.map((product) => (
                <MenuItem key={product.id} value={product.id}>
                  <Stack spacing={0.25}>
                    <Typography variant="body2">{product.name}</Typography>
                    <Typography color="text.secondary" variant="caption">
                      {product.sku}
                      {product.categoryName ? ` / ${product.categoryName}` : ''}
                    </Typography>
                  </Stack>
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Status"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  status: event.target.value as AdminSecondaryCategory['status'],
                }))
              }
              select
              value={form.status}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="hidden">Hidden</MenuItem>
            </TextField>
            <Stack spacing={1}>
              <Typography sx={{ fontWeight: 800 }} variant="body2">
                Theme color
              </Typography>
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
                  height: 58,
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
          <AppButton color="inherit" onClick={() => setIsDialogOpen(false)} variant="outlined">
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
        <DialogTitle>Delete secondary category?</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">Delete {deleteTarget?.name}?</Typography>
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
