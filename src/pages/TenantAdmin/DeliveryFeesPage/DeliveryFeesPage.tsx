import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
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
import { useMemo, useState } from 'react';

import { AppButton } from '@shared/components/ui/Button/AppButton';
import { AppDataTable } from '@shared/components/ui/DataTable/DataTable';
import { PageSection } from '@shared/components/ui/SectionTitle/PageSection';
import { formatCurrency } from '@utils/formatCurrency';

type DeliveryFee = {
  estimatedDays: string;
  fee: number;
  freeDeliveryMinimum: number;
  id: string;
  region: string;
  status: 'Active' | 'Paused';
  township: string;
};

type DeliveryFeeForm = {
  estimatedDays: string;
  fee: string;
  freeDeliveryMinimum: string;
  region: string;
  status: DeliveryFee['status'];
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

const initialDeliveryFees: DeliveryFee[] = [
  {
    estimatedDays: 'Same day',
    fee: 2.5,
    freeDeliveryMinimum: 50,
    id: 'delivery-yangon-kamayut',
    region: 'Yangon',
    status: 'Active',
    township: 'Kamayut',
  },
  {
    estimatedDays: 'Same day',
    fee: 3,
    freeDeliveryMinimum: 60,
    id: 'delivery-yangon-kyauktada',
    region: 'Yangon',
    status: 'Active',
    township: 'Kyauktada',
  },
  {
    estimatedDays: '1-2 days',
    fee: 4.5,
    freeDeliveryMinimum: 80,
    id: 'delivery-mandalay-chanayethazan',
    region: 'Mandalay',
    status: 'Active',
    township: 'Chanayethazan',
  },
  {
    estimatedDays: '2-3 days',
    fee: 5,
    freeDeliveryMinimum: 90,
    id: 'delivery-shan-taunggyi',
    region: 'Shan',
    status: 'Paused',
    township: 'Taunggyi',
  },
  {
    estimatedDays: '2-3 days',
    fee: 4.75,
    freeDeliveryMinimum: 85,
    id: 'delivery-mon-mawlamyine',
    region: 'Mon',
    status: 'Active',
    township: 'Mawlamyine',
  },
];

const emptyForm: DeliveryFeeForm = {
  estimatedDays: 'Same day',
  fee: '2.50',
  freeDeliveryMinimum: '50',
  region: 'Yangon',
  status: 'Active',
  township: '',
};

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const toForm = (deliveryFee: DeliveryFee): DeliveryFeeForm => ({
  estimatedDays: deliveryFee.estimatedDays,
  fee: String(deliveryFee.fee),
  freeDeliveryMinimum: String(deliveryFee.freeDeliveryMinimum),
  region: deliveryFee.region,
  status: deliveryFee.status,
  township: deliveryFee.township,
});

export const DeliveryFeesPage = () => {
  const [deliveryFees, setDeliveryFees] = useState<DeliveryFee[]>(initialDeliveryFees);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<DeliveryFeeForm>(emptyForm);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [regionFilter, setRegionFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredDeliveryFees = useMemo(
    () =>
      deliveryFees.filter((deliveryFee) => {
        const normalizedSearch = search.trim().toLowerCase();
        const searchableValue = [
          deliveryFee.region,
          deliveryFee.township,
          deliveryFee.estimatedDays,
          deliveryFee.status,
        ]
          .join(' ')
          .toLowerCase();
        const matchesSearch = normalizedSearch ? searchableValue.includes(normalizedSearch) : true;
        const matchesRegion = regionFilter === 'all' || deliveryFee.region === regionFilter;

        return matchesSearch && matchesRegion;
      }),
    [deliveryFees, regionFilter, search],
  );

  const openCreateDialog = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsDialogOpen(true);
  };

  const openEditDialog = (deliveryFee: DeliveryFee) => {
    setEditingId(deliveryFee.id);
    setForm(toForm(deliveryFee));
    setIsDialogOpen(true);
  };

  const saveDeliveryFee = () => {
    const township = form.township.trim();

    if (!township) {
      return;
    }

    const payload: DeliveryFee = {
      estimatedDays: form.estimatedDays.trim() || 'Same day',
      fee: Number(form.fee) || 0,
      freeDeliveryMinimum: Number(form.freeDeliveryMinimum) || 0,
      id: editingId ?? `delivery-${slugify(form.region)}-${slugify(township)}`,
      region: form.region,
      status: form.status,
      township,
    };

    setDeliveryFees((current) =>
      editingId ? current.map((item) => (item.id === editingId ? payload : item)) : [payload, ...current],
    );
    setEditingId(null);
    setForm(emptyForm);
    setIsDialogOpen(false);
  };

  const columns: GridColDef<DeliveryFee>[] = [
    { field: 'region', flex: 1, headerName: 'Region', minWidth: 150 },
    { field: 'township', flex: 1, headerName: 'Township', minWidth: 180 },
    {
      field: 'fee',
      headerName: 'Delivery fee',
      valueFormatter: (value: number) => formatCurrency(value),
      width: 150,
    },
    {
      field: 'freeDeliveryMinimum',
      headerName: 'Free over',
      valueFormatter: (value: number) => formatCurrency(value),
      width: 140,
    },
    { field: 'estimatedDays', headerName: 'ETA', width: 130 },
    {
      field: 'status',
      headerName: 'Status',
      renderCell: (params) => (
        <Chip color={params.value === 'Active' ? 'success' : 'default'} label={params.value} size="small" />
      ),
      width: 120,
    },
    {
      field: 'actions',
      getActions: ({ row }) => [
        <GridActionsCellItem icon={<EditRoundedIcon />} key="edit" label="Edit" onClick={() => openEditDialog(row)} />,
        <GridActionsCellItem
          icon={<DeleteOutlineRoundedIcon />}
          key="delete"
          label="Delete"
          onClick={() => setDeliveryFees((current) => current.filter((item) => item.id !== row.id))}
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
          Showing {filteredDeliveryFees.length} of {deliveryFees.length}
        </Typography>
      </Stack>

      <AppDataTable columns={columns} rows={filteredDeliveryFees} />

      <Dialog fullWidth maxWidth="sm" onClose={() => setIsDialogOpen(false)} open={isDialogOpen}>
        <DialogTitle>{editingId ? 'Edit Delivery Fee' : 'Create Delivery Fee'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.25} sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid size={{ sm: 6, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Region"
                  onChange={(event) => setForm((current) => ({ ...current, region: event.target.value }))}
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
                  onChange={(event) => setForm((current) => ({ ...current, township: event.target.value }))}
                  value={form.township}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid size={{ sm: 6, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Delivery fee"
                  onChange={(event) => setForm((current) => ({ ...current, fee: event.target.value }))}
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
                  onChange={(event) => setForm((current) => ({ ...current, estimatedDays: event.target.value }))}
                  value={form.estimatedDays}
                />
              </Grid>
              <Grid size={{ sm: 6, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Status"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, status: event.target.value as DeliveryFee['status'] }))
                  }
                  select
                  value={form.status}
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Paused">Paused</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <AppButton color="inherit" onClick={() => setIsDialogOpen(false)} variant="outlined">
            Cancel
          </AppButton>
          <AppButton onClick={saveDeliveryFee}>{editingId ? 'Save fee' : 'Add fee'}</AppButton>
        </DialogActions>
      </Dialog>
    </PageSection>
  );
};
