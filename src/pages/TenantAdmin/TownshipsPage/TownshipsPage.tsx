import { PersistentDialog as Dialog } from '@shared/components/ui/Dialog/AppDialog';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
  Chip,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { GridActionsCellItem, type GridColDef } from '@mui/x-data-grid';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { adminApi } from '@features/admin/api/adminApi';
import type { AdminTownship } from '@features/admin/types/admin.types';
import { useDebounce } from '@hooks/useDebounce';
import { toApiError } from '@shared/api/apiError';
import { AppButton } from '@shared/components/ui/Button/AppButton';
import { AppDataTable } from '@shared/components/ui/DataTable/DataTable';
import { PageSection } from '@shared/components/ui/SectionTitle/PageSection';

type TownshipForm = {
  name: string;
  regionId: string;
  status: AdminTownship['status'];
};

const emptyForm: TownshipForm = {
  name: '',
  regionId: '',
  status: 'active',
};

export const TownshipsPage = () => {
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<AdminTownship | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TownshipForm>(emptyForm);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [regionFilter, setRegionFilter] = useState('all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);

  const regionsQuery = useQuery({
    queryFn: ({ signal }) => adminApi.listRegions({}, { signal }),
    queryKey: ['admin', 'regions'],
  });
  const regions = regionsQuery.data ?? [];
  const townshipsQuery = useQuery({
    queryFn: ({ signal }) =>
      adminApi.listTownships(
        { regionId: regionFilter === 'all' ? undefined : regionFilter, search: debouncedSearch },
        { signal },
      ),
    queryKey: ['admin', 'townships', debouncedSearch, regionFilter],
  });
  const townships = townshipsQuery.data ?? [];

  const openCreateDialog = () => {
    setEditingId(null);
    setForm({ ...emptyForm, regionId: regions[0]?.id ?? '' });
    setIsDialogOpen(true);
  };

  const openEditDialog = (township: AdminTownship) => {
    setEditingId(township.id);
    setForm({
      name: township.name,
      regionId:
        township.regionId ?? regions.find((region) => region.name === township.region)?.id ?? '',
      status: township.status,
    });
    setIsDialogOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: () => {
      const name = form.name.trim();
      const regionId = form.regionId.trim();

      if (!name || !regionId) {
        throw new Error('Township name and region are required.');
      }

      const payload = { country: 'Myanmar' as const, name, regionId, status: form.status };
      return editingId
        ? adminApi.updateTownship(editingId, payload)
        : adminApi.createTownship(payload);
    },
    onError: (error) => toast.error(toApiError(error).message),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'townships'] });
      await queryClient.invalidateQueries({ queryKey: ['admin', 'delivery-fees'] });
      toast.success(result.message);
      setEditingId(null);
      setForm(emptyForm);
      setIsDialogOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteTownship,
    onError: (error) => toast.error(toApiError(error).message),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'townships'] });
      toast.success(result.message);
      setDeleteTarget(null);
    },
  });

  const columns: GridColDef<AdminTownship>[] = [
    { field: 'name', flex: 1, headerName: 'Township', minWidth: 220 },
    { field: 'country', headerName: 'Country', minWidth: 130 },
    { field: 'region', flex: 1, headerName: 'Region', minWidth: 180 },
    {
      field: 'status',
      headerName: 'Status',
      renderCell: (params) => (
        <Chip
          color={params.value === 'active' ? 'success' : 'default'}
          label={params.value}
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
          onClick={() => openEditDialog(row)}
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

  return (
    <PageSection
      action={
        <AppButton onClick={openCreateDialog} startIcon={<AddRoundedIcon />}>
          Add township
        </AppButton>
      }
      description="Manage townships independently from delivery fee rules."
      title="Townships"
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
          label="Search townships"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Township, region, or status"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ minWidth: { lg: 340 } }}
          value={search}
        />
        <TextField
          label="Region"
          onChange={(event) => setRegionFilter(event.target.value)}
          select
          sx={{ minWidth: { lg: 200 } }}
          value={regionFilter}
        >
          <MenuItem value="all">All regions</MenuItem>
          {regions.map((region) => (
            <MenuItem key={region.id} value={region.id}>
              {region.name}
            </MenuItem>
          ))}
        </TextField>
        <Typography color="text.secondary" sx={{ ml: { lg: 'auto' } }} variant="body2">
          Showing {townships.length}
        </Typography>
      </Stack>

      <AppDataTable
        columns={columns}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        loading={townshipsQuery.isLoading}
        rows={townships}
      />

      <Dialog fullWidth maxWidth="sm" onClose={() => setIsDialogOpen(false)} open={isDialogOpen}>
        <DialogTitle>{editingId ? 'Edit Township' : 'Create Township'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.25} sx={{ pt: 1 }}>
            <TextField disabled fullWidth label="Country" value="Myanmar" />
            <TextField
              fullWidth
              label="Region"
              onChange={(event) =>
                setForm((current) => ({ ...current, regionId: event.target.value }))
              }
              select
              value={form.regionId}
            >
              {regionsQuery.isLoading ? (
                <MenuItem disabled value="">
                  Loading regions...
                </MenuItem>
              ) : null}
              {!regionsQuery.isLoading && regions.length === 0 ? (
                <MenuItem disabled value="">
                  Create a region first
                </MenuItem>
              ) : null}
              {regions.map((region) => (
                <MenuItem key={region.id} value={region.id}>
                  {region.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              autoFocus
              fullWidth
              label="Township name"
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              value={form.name}
            />
            <TextField
              fullWidth
              label="Status"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  status: event.target.value as AdminTownship['status'],
                }))
              }
              select
              value={form.status}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="paused">Paused</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <AppButton color="inherit" onClick={() => setIsDialogOpen(false)} variant="outlined">
            Cancel
          </AppButton>
          <AppButton disabled={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
            {editingId ? 'Save township' : 'Add township'}
          </AppButton>
        </DialogActions>
      </Dialog>

      <Dialog
        fullWidth
        maxWidth="xs"
        onClose={() => setDeleteTarget(null)}
        open={Boolean(deleteTarget)}
      >
        <DialogTitle>Delete Township?</DialogTitle>
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
