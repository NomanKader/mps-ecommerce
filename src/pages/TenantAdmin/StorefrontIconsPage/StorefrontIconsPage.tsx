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
import { alpha } from '@mui/material/styles';
import { GridActionsCellItem, type GridColDef } from '@mui/x-data-grid';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import { storefrontColors } from '@app/providers/theme/tokens';
import { storefrontCategories } from '@features/home/data/homePage.data';
import { merchandisingApi } from '@features/home/api/merchandisingApi';
import type {
  StorefrontHighlightItem,
  StorefrontHighlightSection,
} from '@features/home/types/home.types';
import { toApiError } from '@shared/api/apiError';
import { AppButton } from '@shared/components/ui/Button/AppButton';
import { AppDataTable } from '@shared/components/ui/DataTable/DataTable';
import { PageSection } from '@shared/components/ui/SectionTitle/PageSection';

type HighlightForm = Omit<StorefrontHighlightItem, 'id'>;

const emptyForm: HighlightForm = {
  color: '#e43224',
  icon: '🏷️',
  label: '',
  section: 'featured',
  sortOrder: 1,
  status: 'active',
  surfaceColor: '#fff2b8',
  targetCategoryId: 'all',
  targetSearch: '',
};

const sectionLabels: Record<StorefrontHighlightSection, string> = {
  featured: 'Feature cards',
  merchandising: 'Merchandising tabs',
};

const categoryOptions = [
  { id: 'all', label: 'All categories' },
  ...storefrontCategories.map((category) => ({ id: category.id, label: category.label })),
];

const iconOptions = [
  { label: 'New', value: '🆕' },
  { label: 'Promotion tag', value: '🏷️' },
  { label: 'Imperfect strawberry', value: '🍓' },
  { label: 'Bulk box', value: '📦' },
  { label: 'Frozen snowflake', value: '❄️' },
  { label: 'Organic leaf', value: '🌿' },
  { label: 'Gluten-free grain', value: '🌾' },
  { label: 'No added sugar candy', value: '🍬' },
  { label: 'Vegan bowl', value: '🥗' },
  { label: 'Keto bowl', value: '🥣' },
  { label: 'Recipes chef', value: '👨‍🍳' },
  { label: 'Gift ribbon', value: '🎀' },
  { label: 'Gift box', value: '🎁' },
  { label: 'Must try', value: '👍' },
  { label: 'Local store', value: '🏬' },
  { label: 'Coming soon', value: '⏳' },
  { label: 'Fresh fruit', value: '🍎' },
  { label: 'Vegetables', value: '🥬' },
  { label: 'Bakery', value: '🍞' },
  { label: 'Dairy', value: '🥛' },
  { label: 'Pantry', value: '🥫' },
  { label: 'Delivery', value: '🚚' },
];

const toPayload = (form: HighlightForm): Omit<StorefrontHighlightItem, 'id'> => ({
  color: form.color.trim() || '#e43224',
  icon: form.icon.trim() || '🏷️',
  label: form.label.trim(),
  section: form.section,
  sortOrder: Number(form.sortOrder) || 1,
  status: form.status,
  surfaceColor: form.surfaceColor?.trim() || undefined,
  targetCategoryId: form.targetCategoryId,
  targetSearch: form.targetSearch?.trim() || undefined,
});

const IconPreview = ({ item }: { item: StorefrontHighlightItem }) =>
  item.section === 'featured' ? (
    <Stack
      spacing={1}
      sx={{
        alignItems: 'center',
        backgroundColor: item.surfaceColor ?? storefrontColors.surface,
        border: `1px solid ${alpha(item.color, 0.14)}`,
        borderRadius: 2,
        boxShadow: `0 14px 22px ${alpha(item.color, 0.08)}`,
        minWidth: 132,
        p: 1.4,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          alignItems: 'center',
          backgroundColor: item.color,
          borderRadius: '50%',
          color: '#ffffff',
          display: 'flex',
          fontSize: 30,
          height: 68,
          justifyContent: 'center',
          width: 68,
        }}
      >
        {item.icon}
      </Box>
      <Typography sx={{ fontWeight: 900, lineHeight: 1.12 }}>
        {item.label || 'Icon label'}
      </Typography>
    </Stack>
  ) : (
    <Stack spacing={0.8} sx={{ alignItems: 'center', minWidth: 110, textAlign: 'center' }}>
      <Box
        sx={{
          alignItems: 'center',
          backgroundColor: item.color,
          borderRadius: '50%',
          color: '#ffffff',
          display: 'flex',
          fontSize: '1.55rem',
          height: 64,
          justifyContent: 'center',
          position: 'relative',
          width: 64,
          '&::before': {
            border: '2px solid rgba(255,255,255,0.92)',
            borderRadius: '50%',
            content: '""',
            inset: 7,
            position: 'absolute',
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>{item.icon}</Box>
      </Box>
      <Typography sx={{ color: '#5d5d5d', fontSize: '0.82rem', fontWeight: 800, lineHeight: 1.3 }}>
        {item.label || 'Icon label'}
      </Typography>
    </Stack>
  );

export const StorefrontIconsPage = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StorefrontHighlightItem | null>(null);
  const [form, setForm] = useState<HighlightForm>(emptyForm);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState<'all' | StorefrontHighlightSection>('all');
  const iconsQuery = useQuery({
    queryFn: ({ signal }) => merchandisingApi.listAdminStorefrontIcons({}, { signal }),
    queryKey: ['admin', 'storefront-icons'],
  });
  const items = iconsQuery.data ?? [];

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return items
      .filter((item) => sectionFilter === 'all' || item.section === sectionFilter)
      .filter((item) =>
        normalizedSearch
          ? [item.label, item.icon, item.targetCategoryId, item.targetSearch ?? '']
              .join(' ')
              .toLowerCase()
              .includes(normalizedSearch)
          : true,
      )
      .sort(
        (first, second) =>
          first.section.localeCompare(second.section) || first.sortOrder - second.sortOrder,
      );
  }, [items, search, sectionFilter]);

  const columns: GridColDef<StorefrontHighlightItem>[] = [
    {
      field: 'label',
      flex: 1,
      headerName: 'Name',
      minWidth: 220,
      renderCell: (params) => (
        <Stack direction="row" spacing={1.2} sx={{ alignItems: 'center', minWidth: 0 }}>
          <Box
            sx={{
              alignItems: 'center',
              bgcolor: params.row.color,
              borderRadius: '50%',
              color: '#ffffff',
              display: 'flex',
              flex: '0 0 auto',
              height: 34,
              justifyContent: 'center',
              width: 34,
            }}
          >
            {params.row.icon}
          </Box>
          <Typography noWrap sx={{ fontWeight: 800 }} variant="body2">
            {params.row.label}
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'section',
      headerName: 'Section',
      renderCell: (params) => sectionLabels[params.row.section],
      width: 170,
    },
    { field: 'sortOrder', headerName: 'Order', type: 'number', width: 90 },
    {
      field: 'targetCategoryId',
      headerName: 'Target',
      valueGetter: (_value, row) => row.targetSearch || row.targetCategoryId,
      width: 150,
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
      width: 120,
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
              color: row.color,
              icon: row.icon,
              label: row.label,
              section: row.section,
              sortOrder: row.sortOrder,
              status: row.status,
              surfaceColor: row.surfaceColor ?? '',
              targetCategoryId: row.targetCategoryId,
              targetSearch: row.targetSearch ?? '',
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

  const createMutation = useMutation({
    mutationFn: merchandisingApi.createStorefrontIcon,
    onError: (error) => toast.error(toApiError(error).message),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'storefront-icons'] });
      await queryClient.invalidateQueries({ queryKey: ['storefront', 'icons'] });
      setEditingId(null);
      setForm(emptyForm);
      setIsDialogOpen(false);
      toast.success(result.message);
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Omit<StorefrontHighlightItem, 'id'> }) =>
      merchandisingApi.updateStorefrontIcon(id, payload),
    onError: (error) => toast.error(toApiError(error).message),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'storefront-icons'] });
      await queryClient.invalidateQueries({ queryKey: ['storefront', 'icons'] });
      setEditingId(null);
      setForm(emptyForm);
      setIsDialogOpen(false);
      toast.success(result.message);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: merchandisingApi.deleteStorefrontIcon,
    onError: (error) => toast.error(toApiError(error).message),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'storefront-icons'] });
      await queryClient.invalidateQueries({ queryKey: ['storefront', 'icons'] });
      setDeleteTarget(null);
      toast.success(result.message);
    },
  });

  const handleSave = () => {
    const item = toPayload(form);

    if (!item.label || !item.icon) {
      toast.error('Complete the name and icon fields.');
      return;
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, payload: item });
      return;
    }

    createMutation.mutate(item);
  };

  const previewItem = { ...toPayload(form), id: editingId ?? 'preview' };

  return (
    <PageSection
      action={
        <Stack
          direction={{ sm: 'row', xs: 'column' }}
          spacing={1.25}
          sx={{ alignItems: 'stretch', width: { sm: 'auto', xs: '100%' } }}
        >
          <AppButton
            onClick={() => {
              setForm({ ...emptyForm, sortOrder: items.length + 1 });
              setEditingId(null);
              setIsDialogOpen(true);
            }}
            startIcon={<AddRoundedIcon />}
            sx={{ minWidth: { sm: 128, xs: '100%' } }}
          >
            Add icon
          </AppButton>
        </Stack>
      }
      description="Customize the icon, name, color, ordering, and catalog target for homepage feature cards and merchandising tabs."
      title="Storefront Icons"
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
          label="Search icons"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Name, icon, or target"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ minWidth: { lg: 320 } }}
          value={search}
        />
        <TextField
          label="Section"
          onChange={(event) =>
            setSectionFilter(event.target.value as 'all' | StorefrontHighlightSection)
          }
          select
          sx={{ minWidth: { lg: 220 } }}
          value={sectionFilter}
        >
          <MenuItem value="all">All sections</MenuItem>
          <MenuItem value="featured">Feature cards</MenuItem>
          <MenuItem value="merchandising">Merchandising tabs</MenuItem>
        </TextField>
        <Typography color="text.secondary" sx={{ ml: { lg: 'auto' } }} variant="body2">
          Showing {filteredItems.length}
        </Typography>
      </Stack>

      <AppDataTable
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        loading={iconsQuery.isLoading}
        rows={filteredItems}
      />

      <Dialog fullWidth maxWidth="md" onClose={() => setIsDialogOpen(false)} open={isDialogOpen}>
        <DialogTitle>{editingId ? 'Edit Storefront Icon' : 'Create Storefront Icon'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2.25} sx={{ pt: 1 }}>
            <Grid size={{ md: 4, xs: 12 }}>
              <Stack spacing={2}>
                <Typography sx={{ fontWeight: 800 }}>Preview</Typography>
                <IconPreview item={previewItem} />
              </Stack>
            </Grid>
            <Grid size={{ md: 8, xs: 12 }}>
              <Grid container spacing={2}>
                <Grid size={{ sm: 8, xs: 12 }}>
                  <TextField
                    autoFocus
                    fullWidth
                    label="Name"
                    onChange={(event) =>
                      setForm((current) => ({ ...current, label: event.target.value }))
                    }
                    value={form.label}
                  />
                </Grid>
                <Grid size={{ sm: 4, xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Icon"
                    onChange={(event) =>
                      setForm((current) => ({ ...current, icon: event.target.value }))
                    }
                    select
                    value={form.icon}
                  >
                    {iconOptions.map((option) => (
                      <MenuItem key={`${option.label}-${option.value}`} value={option.value}>
                        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
                          <Typography sx={{ fontSize: '1.25rem', lineHeight: 1 }}>
                            {option.value}
                          </Typography>
                          <Typography>{option.label}</Typography>
                        </Stack>
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ sm: 6, xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Section"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        section: event.target.value as StorefrontHighlightSection,
                      }))
                    }
                    select
                    value={form.section}
                  >
                    <MenuItem value="featured">Feature cards</MenuItem>
                    <MenuItem value="merchandising">Merchandising tabs</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ sm: 6, xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Status"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        status: event.target.value as StorefrontHighlightItem['status'],
                      }))
                    }
                    select
                    value={form.status}
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="hidden">Hidden</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ sm: 4, xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Icon color"
                    onChange={(event) =>
                      setForm((current) => ({ ...current, color: event.target.value }))
                    }
                    type="color"
                    value={form.color}
                  />
                </Grid>
                <Grid size={{ sm: 4, xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Card background"
                    onChange={(event) =>
                      setForm((current) => ({ ...current, surfaceColor: event.target.value }))
                    }
                    type="color"
                    value={form.surfaceColor || '#ffffff'}
                  />
                </Grid>
                <Grid size={{ sm: 4, xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Sort order"
                    onChange={(event) =>
                      setForm((current) => ({ ...current, sortOrder: Number(event.target.value) }))
                    }
                    type="number"
                    value={form.sortOrder}
                  />
                </Grid>
                <Grid size={{ sm: 6, xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Target category"
                    onChange={(event) =>
                      setForm((current) => ({ ...current, targetCategoryId: event.target.value }))
                    }
                    select
                    value={form.targetCategoryId}
                  >
                    {categoryOptions.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ sm: 6, xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Target search"
                    onChange={(event) =>
                      setForm((current) => ({ ...current, targetSearch: event.target.value }))
                    }
                    value={form.targetSearch}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <AppButton color="inherit" onClick={() => setIsDialogOpen(false)} variant="outlined">
            Cancel
          </AppButton>
          <AppButton
            disabled={createMutation.isPending || updateMutation.isPending}
            onClick={handleSave}
          >
            {editingId ? 'Save icon' : 'Add icon'}
          </AppButton>
        </DialogActions>
      </Dialog>

      <Dialog
        fullWidth
        maxWidth="xs"
        onClose={() => setDeleteTarget(null)}
        open={Boolean(deleteTarget)}
      >
        <DialogTitle>Delete Storefront Icon?</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">Delete {deleteTarget?.label}?</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <AppButton color="inherit" onClick={() => setDeleteTarget(null)} variant="outlined">
            Cancel
          </AppButton>
          <AppButton
            color="error"
            onClick={() => {
              if (!deleteTarget) {
                return;
              }

              deleteMutation.mutate(deleteTarget.id);
            }}
            disabled={deleteMutation.isPending}
          >
            Delete
          </AppButton>
        </DialogActions>
      </Dialog>
    </PageSection>
  );
};
