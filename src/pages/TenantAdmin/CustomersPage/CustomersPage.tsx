import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { Chip, Grid, InputAdornment, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { type GridColDef } from '@mui/x-data-grid';
import { useMemo, useState } from 'react';

import { AppDataTable } from '@shared/components/ui/DataTable/DataTable';
import { PageSection } from '@shared/components/ui/SectionTitle/PageSection';
import { type DemoCustomer, mockCustomers } from '@shared/lib/mockData';
import { formatCurrency } from '@utils/formatCurrency';
import { formatDate } from '@utils/formatDate';

type SegmentFilter = DemoCustomer['segment'] | 'all';

const segmentOptions: Array<{ label: string; value: SegmentFilter }> = [
  { label: 'All segments', value: 'all' },
  { label: 'VIP', value: 'VIP' },
  { label: 'Loyal', value: 'Loyal' },
  { label: 'New', value: 'New' },
  { label: 'At Risk', value: 'At Risk' },
];

const toDateInputValue = (date: string) => date.slice(0, 10);

export const CustomersPage = () => {
  const [customers] = useState<DemoCustomer[]>(mockCustomers);
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');
  const [segmentFilter, setSegmentFilter] = useState<SegmentFilter>('all');
  const [startDate, setStartDate] = useState('');

  const filteredCustomers = useMemo(
    () =>
      customers.filter((customer) => {
        const normalizedSearch = search.trim().toLowerCase();
        const searchableValue = [customer.name, customer.email, customer.segment].join(' ').toLowerCase();
        const lastOrderDate = toDateInputValue(customer.lastOrderAt);
        const matchesSearch = normalizedSearch ? searchableValue.includes(normalizedSearch) : true;
        const matchesSegment = segmentFilter === 'all' || customer.segment === segmentFilter;
        const matchesStartDate = startDate ? lastOrderDate >= startDate : true;
        const matchesEndDate = endDate ? lastOrderDate <= endDate : true;

        return matchesSearch && matchesSegment && matchesStartDate && matchesEndDate;
      }),
    [customers, endDate, search, segmentFilter, startDate],
  );

  const columns: GridColDef<DemoCustomer>[] = [
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
      description="Manage demo customer records, segments, spend, and loyalty status."
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
          label="Last order from"
          onChange={(event) => setStartDate(event.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          type="date"
          value={startDate}
        />
        <TextField
          label="Last order to"
          onChange={(event) => setEndDate(event.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          type="date"
          value={endDate}
        />
        <Typography color="text.secondary" sx={{ ml: { lg: 'auto' } }} variant="body2">
          Showing {filteredCustomers.length} of {customers.length}
        </Typography>
      </Stack>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Stack>
            <AppDataTable columns={columns} rows={filteredCustomers} />
          </Stack>
        </Grid>
      </Grid>
    </PageSection>
  );
};
