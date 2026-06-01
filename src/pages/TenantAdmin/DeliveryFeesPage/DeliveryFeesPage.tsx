import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
  Alert,
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
import { useState } from 'react';
import toast from 'react-hot-toast';

import { adminApi } from '@features/admin/api/adminApi';
import type { AdminDeliveryFee } from '@features/admin/types/admin.types';
import { useDebounce } from '@hooks/useDebounce';
import { toApiError } from '@shared/api/apiError';
import { AppButton } from '@shared/components/ui/Button/AppButton';
import { AppDataTable } from '@shared/components/ui/DataTable/DataTable';
import { PageSection } from '@shared/components/ui/SectionTitle/PageSection';
import { formatCurrency } from '@utils/formatCurrency';

type DeliveryFeeForm = {
  estimatedDays: string;
  fee: string;
  freeDeliveryMinimum: string;
  region: string;
  status: AdminDeliveryFee['status'];
  township: string;
};

const myanmarRegions = [
  'Yangon',
  'Mandalay',
  'Naypyidaw',
  'Bago',
  'Ayeyarwady',
  'Sagaing',
  'Shan',
  'Mon',
] as const;

const emptyForm: DeliveryFeeForm = {
  estimatedDays: 'Same day',
  fee: '2.50',
  freeDeliveryMinimum: '50',
  region: 'Yangon',
  status: 'active',
  township: '',
};

const toForm = (deliveryFee: AdminDeliveryFee): DeliveryFeeForm => ({
  estimatedDays: deliveryFee.eta,
  fee: String(deliveryFee.fee),
  freeDeliveryMinimum: String(deliveryFee.freeOver),
  region: deliveryFee.region,
  status: deliveryFee.status,
  township: deliveryFee.township,
});

export const DeliveryFeesPage = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminDeliveryFee | null>(null);
  const [form, setForm] = useState<DeliveryFeeForm>(emptyForm);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [regionFilter, setRegionFilter] = useState('all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const deliveryFeesQuery = useQuery({
    queryFn: ({ signal }) =>
      adminApi.listDeliveryFees(
        { region: regionFilter === 'all' ? undefined : regionFilter, search: debouncedSearch },
        { signal },
      ),
    queryKey: ['admin', 'delivery-fees', debouncedSearch, regionFilter],
  });
  const deliveryFees = deliveryFeesQuery.data ?? [];

  const openCreateDialog = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsDialogOpen(true);
  };

  const openEditDialog = (deliveryFee: AdminDeliveryFee) => {
    setEditingId(deliveryFee.id);
    setForm(toForm(deliveryFee));
    setIsDialogOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const township = form.township.trim();

      if (!township) {
        throw new Error('Township is required.');
      }

      const fee = Number(form.fee);
      const freeOver = Number(form.freeDeliveryMinimum);
      if (!Number.isFinite(fee) || fee < 0 || !Number.isFinite(freeOver) || freeOver < 0) {
        throw new Error('Enter valid non-negative delivery fee values.');
      }
      const payload = {
        eta: form.estimatedDays.trim() || 'Same day',
        fee: Number(form.fee) || 0,
        freeOver,
        region: form.region,
        status: form.status,
        township,
      };

      return editingId
        ? adminApi.updateDeliveryFee(editingId, payload)
        : adminApi.createDeliveryFee(payload);
    },
    onError: (error) => toast.error(toApiError(error).message),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'delivery-fees'] });
      toast.success(result.message);
      setEditingId(null);
      setForm(emptyForm);
      setIsDialogOpen(false);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteDeliveryFee,
    onError: (error) => toast.error(toApiError(error).message),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'delivery-fees'] });
      toast.success(result.message);
      setDeleteTarget(null);
    },
  });

  const columns: GridColDef<AdminDeliveryFee>[] = [
    { field: 'region', flex: 1, headerName: 'Region', minWidth: 150 },
    { field: 'township', flex: 1, headerName: 'Township', minWidth: 180 },
    {
      field: 'fee',
      headerName: 'Delivery fee',
      valueFormatter: (value: number) => formatCurrency(value),
      width: 150,
    },
    {
      field: 'freeOver',
      headerName: 'Free over',
      valueFormatter: (value: number) => formatCurrency(value),
      width: 140,
    },
    { field: 'eta', headerName: 'ETA', width: 130 },
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
      width: 120,
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
      width: 100,
    },
  ];

  return (
    <PageSection
      action={
        <AppButton onClick={openCreateDialog} startIcon={<AddRoundedIcon />}>
          Add delivery fee
        </AppButton>
      }
      description="Configure delivery fees by Myanmar region and township."
      title="Delivery Fees"
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
          label="Search delivery fees"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Region, township, ETA, or status"
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
          sx={{ minWidth: { lg: 180 } }}
          value={regionFilter}
        >
          <MenuItem value="all">All regions</MenuItem>
          {myanmarRegions.map((region) => (
            <MenuItem key={region} value={region}>
              {region}
            </MenuItem>
          ))}
        </TextField>
        <Typography color="text.secondary" sx={{ ml: { lg: 'auto' } }} variant="body2">
          Showing {deliveryFees.length}
        </Typography>
      </Stack>

      {deliveryFeesQuery.isError ? (
        <Alert severity="error">{toApiError(deliveryFeesQuery.error).message}</Alert>
      ) : null}
      <AppDataTable columns={columns} loading={deliveryFeesQuery.isLoading} rows={deliveryFees} />

      <Dialog fullWidth maxWidth="sm" onClose={() => setIsDialogOpen(false)} open={isDialogOpen}>
        <DialogTitle>{editingId ? 'Edit Delivery Fee' : 'Create Delivery Fee'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.25} sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid size={{ sm: 6, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Region"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, region: event.target.value }))
                  }
                  select
                  value={form.region}
                >
                  {myanmarRegions.map((region) => (
                    <MenuItem key={region} value={region}>
                      {region}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ sm: 6, xs: 12 }}>
                <TextField
                  autoFocus
                  fullWidth
                  label="Township"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, township: event.target.value }))
                  }
                  value={form.township}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid size={{ sm: 6, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Delivery fee"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, fee: event.target.value }))
                  }
                  type="number"
                  value={form.fee}
                />
              </Grid>
              <Grid size={{ sm: 6, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Free delivery over"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, freeDeliveryMinimum: event.target.value }))
                  }
                  type="number"
                  value={form.freeDeliveryMinimum}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid size={{ sm: 6, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Estimated delivery"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, estimatedDays: event.target.value }))
                  }
                  value={form.estimatedDays}
                />
              </Grid>
              <Grid size={{ sm: 6, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Status"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      status: event.target.value as AdminDeliveryFee['status'],
                    }))
                  }
                  select
                  value={form.status}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="paused">Paused</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <AppButton color="inherit" onClick={() => setIsDialogOpen(false)} variant="outlined">
            Cancel
          </AppButton>
          <AppButton disabled={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
            {editingId ? 'Save fee' : 'Add fee'}
          </AppButton>
        </DialogActions>
      </Dialog>
      <Dialog
        fullWidth
        maxWidth="xs"
        onClose={() => setDeleteTarget(null)}
        open={Boolean(deleteTarget)}
      >
        <DialogTitle>Delete Delivery Fee?</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            Delete the {deleteTarget?.township}, {deleteTarget?.region} delivery fee?
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
