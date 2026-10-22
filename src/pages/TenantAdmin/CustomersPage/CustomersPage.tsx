import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
  Alert,
  Box,
  Button,
  Chip,
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
import { type GridColDef } from '@mui/x-data-grid';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type FormEvent, useState } from 'react';
import toast from 'react-hot-toast';

import { adminApi } from '@features/admin/api/adminApi';
import type { AdminCustomer, AdminCustomerPayload } from '@features/admin/types/admin.types';
import { useDebounce } from '@hooks/useDebounce';
import { toApiError } from '@shared/api/apiError';
import { AppDataTable } from '@shared/components/ui/DataTable/DataTable';
import { PersistentDialog as Dialog } from '@shared/components/ui/Dialog/AppDialog';
import { PageSection } from '@shared/components/ui/SectionTitle/PageSection';
import { createReportFilename, downloadCsv } from '@shared/utils/downloadCsv';
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

const createCustomerDefaults: AdminCustomerPayload = {
  email: '',
  name: '',
  segment: 'New',
};

export const CustomersPage = () => {
  const [search, setSearch] = useState('');
  const [segmentFilter, setSegmentFilter] = useState<SegmentFilter>('all');
  const [createCustomerOpen, setCreateCustomerOpen] = useState(false);
  const [createCustomerForm, setCreateCustomerForm] =
    useState<AdminCustomerPayload>(createCustomerDefaults);
  const [walletLoadTarget, setWalletLoadTarget] = useState<AdminCustomer | null>(null);
  const [walletLoadAmount, setWalletLoadAmount] = useState('');
  const [walletLoadNote, setWalletLoadNote] = useState('');
  const queryClient = useQueryClient();
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
  const canSubmitCustomer =
    createCustomerForm.name.trim().length >= 2 && /\S+@\S+\.\S+/.test(createCustomerForm.email);
  const walletLoadValue = Number(walletLoadAmount);
  const canSubmitWalletLoad =
    Boolean(walletLoadTarget?.email) && Number.isFinite(walletLoadValue) && walletLoadValue >= 100;
  const walletLoadMutation = useMutation({
    mutationFn: () => {
      if (!walletLoadTarget) throw new Error('Select a customer first.');

      return adminApi.loadCustomerWallet({
        adminNote: walletLoadNote.trim() || undefined,
        amount: walletLoadValue,
        customerEmail: walletLoadTarget.email,
      });
    },
    onError: (error) => toast.error(toApiError(error).message),
    onSuccess: (result) => {
      toast.success(
        `${formatCurrency(result.data.amount)} loaded. New balance: ${formatCurrency(
          result.data.balance,
        )}`,
      );
      setWalletLoadTarget(null);
      setWalletLoadAmount('');
      setWalletLoadNote('');
      void queryClient.invalidateQueries({ queryKey: ['admin', 'customers'] });
      void queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
  });
  const createCustomerMutation = useMutation({
    mutationFn: () =>
      adminApi.createCustomer({
        email: createCustomerForm.email.trim(),
        name: createCustomerForm.name.trim(),
        segment: createCustomerForm.segment,
      }),
    onError: (error) => toast.error(toApiError(error).message),
    onSuccess: (result) => {
      toast.success(`${result.data.name} was added to customers.`);
      setCreateCustomerOpen(false);
      setCreateCustomerForm(createCustomerDefaults);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'customers'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });

  const openWalletLoadDialog = (customer: AdminCustomer) => {
    setWalletLoadTarget(customer);
    setWalletLoadAmount('');
    setWalletLoadNote('');
  };

  const submitCreateCustomer = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (canSubmitCustomer && !createCustomerMutation.isPending) createCustomerMutation.mutate();
  };

  const downloadCustomersReport = () => {
    downloadCsv(createReportFilename('customers-report'), customers, [
      { header: 'Customer', value: (customer) => customer.name },
      { header: 'Email', value: (customer) => customer.email },
      { header: 'Segment', value: (customer) => customer.segment },
      { header: 'Orders', value: (customer) => customer.orders },
      { header: 'Total spend', value: (customer) => customer.totalSpend },
      { header: 'Last order', value: (customer) => formatDate(customer.lastOrderAt) },
    ]);
  };

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
    {
      field: 'actions',
      headerName: 'Wallet',
      renderCell: (params) => (
        <Button onClick={() => openWalletLoadDialog(params.row)} size="small" variant="outlined">
          Load wallet
        </Button>
      ),
      sortable: false,
      width: 140,
    },
  ];

  return (
    <PageSection
      description="View customer records, segments, spend, and loyalty status."
      title="Customers"
    >
      <Stack
        spacing={2}
        sx={{
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          mb: 2,
          p: 2,
        }}
      >
        <Box
          sx={{
            alignItems: 'start',
            display: 'grid',
            gap: 2,
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
            '& .MuiTextField-root': { minWidth: 0, width: '100%' },
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
            value={search}
          />
          <TextField
            label="Segment"
            onChange={(event) => setSegmentFilter(event.target.value as SegmentFilter)}
            select
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
        </Box>
        <Stack
          direction="row"
          spacing={2}
          useFlexGap
          sx={{ alignItems: 'center', flexWrap: 'wrap' }}
        >
          <Typography color="text.secondary" sx={{ flexGrow: 1 }} variant="body2">
            Showing {customers.length}
          </Typography>
          <Button
            disabled={customersQuery.isLoading || customers.length === 0}
            onClick={downloadCustomersReport}
            startIcon={<FileDownloadOutlinedIcon />}
            sx={{ flexShrink: 0, whiteSpace: 'nowrap', width: { xs: '100%', sm: 'auto' } }}
            variant="outlined"
          >
            Download report
          </Button>
          <Button
            onClick={() => setCreateCustomerOpen(true)}
            startIcon={<PersonAddAlt1RoundedIcon />}
            sx={{ flexShrink: 0, whiteSpace: 'nowrap', width: { xs: '100%', sm: 'auto' } }}
            variant="contained"
          >
            Create customer
          </Button>
        </Stack>
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

      <Dialog
        maxWidth="sm"
        onClose={() => {
          if (!createCustomerMutation.isPending) setCreateCustomerOpen(false);
        }}
        open={createCustomerOpen}
      >
        <form onSubmit={submitCreateCustomer}>
          <DialogTitle>Create Customer</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField
                autoFocus
                label="Customer name"
                onChange={(event) =>
                  setCreateCustomerForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                required
                value={createCustomerForm.name}
              />
              <TextField
                label="Email"
                onChange={(event) =>
                  setCreateCustomerForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                required
                type="email"
                value={createCustomerForm.email}
              />
              <TextField
                label="Segment"
                onChange={(event) =>
                  setCreateCustomerForm((current) => ({
                    ...current,
                    segment: event.target.value as AdminCustomer['segment'],
                  }))
                }
                select
                value={createCustomerForm.segment}
              >
                {segmentOptions
                  .filter(
                    (option): option is { label: string; value: AdminCustomer['segment'] } =>
                      option.value !== 'all',
                  )
                  .map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
              </TextField>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button
              disabled={createCustomerMutation.isPending}
              onClick={() => setCreateCustomerOpen(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={!canSubmitCustomer || createCustomerMutation.isPending}
              type="submit"
              variant="contained"
            >
              Create customer
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog
        maxWidth="sm"
        onClose={() => {
          if (!walletLoadMutation.isPending) setWalletLoadTarget(null);
        }}
        open={Boolean(walletLoadTarget)}
      >
        <DialogTitle>Load Customer Wallet</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Stack spacing={0.5}>
              <Typography sx={{ fontWeight: 700 }}>{walletLoadTarget?.name}</Typography>
              <Typography color="text.secondary" variant="body2">
                {walletLoadTarget?.email}
              </Typography>
            </Stack>
            <TextField
              autoFocus
              helperText="Minimum 100 MMK. This credits the wallet immediately."
              label="Cash amount"
              onChange={(event) => setWalletLoadAmount(event.target.value)}
              slotProps={{
                input: {
                  endAdornment: <InputAdornment position="end">MMK</InputAdornment>,
                },
              }}
              type="number"
              value={walletLoadAmount}
            />
            <TextField
              label="Admin note"
              multiline
              onChange={(event) => setWalletLoadNote(event.target.value)}
              placeholder="Cash paid at shop"
              rows={3}
              value={walletLoadNote}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button disabled={walletLoadMutation.isPending} onClick={() => setWalletLoadTarget(null)}>
            Cancel
          </Button>
          <Button
            disabled={!canSubmitWalletLoad || walletLoadMutation.isPending}
            onClick={() => walletLoadMutation.mutate()}
            variant="contained"
          >
            Load wallet
          </Button>
        </DialogActions>
      </Dialog>
    </PageSection>
  );
};
