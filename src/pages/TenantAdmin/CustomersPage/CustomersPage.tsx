import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
  Alert,
  Chip,
  Grid,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { type GridColDef } from '@mui/x-data-grid';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { adminApi } from '@features/admin/api/adminApi';
import type { AdminCustomer } from '@features/admin/types/admin.types';
import { useDebounce } from '@hooks/useDebounce';
import { toApiError } from '@shared/api/apiError';
import { AppDataTable } from '@shared/components/ui/DataTable/DataTable';
import { PageSection } from '@shared/components/ui/SectionTitle/PageSection';
import { formatCurrency } from '@utils/formatCurrency';
import { formatDate } from '@utils/formatDate';

type SegmentFilter = AdminCustomer['segment'] | 'all';

const segmentOptions: Array<{ label: string; value: SegmentFilter }> = [
  { label: 'All segments', value: 'all' },
  { label: 'VIP', value: 'VIP' },
  { label: 'Loyal', value: 'Loyal' },
  { label: 'New', value: 'New' },
  { label: 'At Risk', value: 'At Risk' },
];

export const CustomersPage = () => {
  const [search, setSearch] = useState('');
  const [segmentFilter, setSegmentFilter] = useState<SegmentFilter>('all');
  const debouncedSearch = useDebounce(search);
  const customersQuery = useQuery({
    queryFn: ({ signal }) =>
      adminApi.listCustomers(
        { search: debouncedSearch, segment: segmentFilter === 'all' ? undefined : segmentFilter },
        { signal },
      ),
    queryKey: ['admin', 'customers', debouncedSearch, segmentFilter],
  });
  const customers = customersQuery.data ?? [];

  const columns: GridColDef<AdminCustomer>[] = [
    { field: 'name', flex: 1, headerName: 'Customer', minWidth: 180 },
    { field: 'email', flex: 1, headerName: 'Email', minWidth: 220 },
    {
      field: 'segment',
      headerName: 'Segment',
      renderCell: (params) => <Chip label={params.value} size="small" />,
      width: 120,
    },
    { field: 'orders', headerName: 'Orders', type: 'number', width: 100 },
    {
      field: 'totalSpend',
      headerName: 'Total spend',
      valueFormatter: (value: number) => formatCurrency(value),
      width: 140,
    },
    {
      field: 'lastOrderAt',
      headerName: 'Last order',
      valueFormatter: (value: string) => formatDate(value),
      width: 140,
    },
  ];

  return (
    <PageSection
      description="View customer records, segments, spend, and loyalty status."
      title="Customers"
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
          label="Search customers"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Name, email, or segment"
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
          label="Segment"
          onChange={(event) => setSegmentFilter(event.target.value as SegmentFilter)}
          select
          sx={{ minWidth: { lg: 160 } }}
          value={segmentFilter}
        >
          {segmentOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          disabled
          helperText="Date filtering is not available from the backend yet."
          label="Last order from"
          slotProps={{ inputLabel: { shrink: true } }}
          type="date"
        />
        <TextField
          disabled
          label="Last order to"
          slotProps={{ inputLabel: { shrink: true } }}
          type="date"
        />
        <Typography color="text.secondary" sx={{ ml: { lg: 'auto' } }} variant="body2">
          Showing {customers.length}
        </Typography>
      </Stack>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Stack>
            {customersQuery.isError ? (
              <Alert severity="error">{toApiError(customersQuery.error).message}</Alert>
            ) : null}
            <AppDataTable columns={columns} loading={customersQuery.isLoading} rows={customers} />
          </Stack>
        </Grid>
      </Grid>
    </PageSection>
  );
};
