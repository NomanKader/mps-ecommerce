import { PersistentDialog as Dialog } from '@shared/components/ui/Dialog/AppDialog';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import {
  Alert,
  Box,
  Button,
  Chip,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import { adminApi } from '@features/admin/api/adminApi';
import type {
  AdminWalletTopUpRequest,
  AdminWalletTopUpStatus,
} from '@features/admin/types/admin.types';
import { toApiError } from '@shared/api/apiError';
import { AppDataTable } from '@shared/components/ui/DataTable/DataTable';
import { PageSection } from '@shared/components/ui/SectionTitle/PageSection';
import { formatCurrency } from '@utils/formatCurrency';
import { formatDate } from '@utils/formatDate';

type StatusFilter = AdminWalletTopUpStatus | 'all';

const statusColors: Record<AdminWalletTopUpStatus, 'default' | 'success' | 'warning' | 'error'> = {
  approved: 'success',
  pending: 'warning',
  rejected: 'error',
};

const receiptLabel = (request: AdminWalletTopUpRequest) =>
  `Receipt for ${formatCurrency(request.amount)} top-up`;

export const WalletTopUpsPage = () => {
  const queryClient = useQueryClient();
  const [reviewTarget, setReviewTarget] = useState<AdminWalletTopUpRequest | null>(null);
  const [approvedAmount, setApprovedAmount] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');

  const topUpsQuery = useQuery({
    queryFn: ({ signal }) =>
      adminApi.listWalletTopUps(
        { status: statusFilter === 'all' ? undefined : statusFilter },
        { signal },
      ),
    queryKey: ['admin', 'wallet-topups', statusFilter],
  });
  const topUps = useMemo(() => topUpsQuery.data ?? [], [topUpsQuery.data]);
  const pendingCount = useMemo(
    () => topUps.filter((request) => request.status === 'pending').length,
    [topUps],
  );

  const closeReview = () => {
    setReviewTarget(null);
    setAdminNote('');
    setApprovedAmount('');
  };

  const openReview = (request: AdminWalletTopUpRequest) => {
    setReviewTarget(request);
    setApprovedAmount(String(request.approvedAmount ?? request.amount));
    setAdminNote('');
  };

  const approveMutation = useMutation({
    mutationFn: () => {
      if (!reviewTarget) throw new Error('Select a request first.');
      return adminApi.approveWalletTopUp(reviewTarget.id, {
        adminNote,
        approvedAmount: Number(approvedAmount),
      });
    },
    onError: (error) => toast.error(toApiError(error).message),
    onSuccess: async (result) => {
      toast.success(result.message);
      closeReview();
      await queryClient.invalidateQueries({ queryKey: ['admin', 'wallet-topups'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => {
      if (!reviewTarget) throw new Error('Select a request first.');
      return adminApi.rejectWalletTopUp(reviewTarget.id, { adminNote });
    },
    onError: (error) => toast.error(toApiError(error).message),
    onSuccess: async (result) => {
      toast.success(result.message);
      closeReview();
      await queryClient.invalidateQueries({ queryKey: ['admin', 'wallet-topups'] });
    },
  });

  const columns: GridColDef<AdminWalletTopUpRequest>[] = [
    { field: 'customerName', flex: 1, headerName: 'Customer', minWidth: 180 },
    { field: 'customerEmail', flex: 1, headerName: 'Email', minWidth: 220 },
    {
      field: 'amount',
      headerName: 'Requested',
      valueFormatter: (value: number) => formatCurrency(value),
      width: 140,
    },
    {
      field: 'status',
      headerName: 'Status',
      renderCell: (params) => (
        <Chip
          color={statusColors[params.value as AdminWalletTopUpStatus]}
          label={params.value}
          size="small"
        />
      ),
      width: 120,
    },
    { field: 'promoCode', headerName: 'Promo', minWidth: 110 },
    {
      field: 'createdAt',
      headerName: 'Submitted',
      valueFormatter: (value: string) => formatDate(value),
      width: 150,
    },
    {
      field: 'actions',
      headerName: 'Action',
      renderCell: (params) => (
        <Button
          onClick={() => openReview(params.row)}
          size="small"
          sx={{ borderRadius: 999, fontWeight: 800, textTransform: 'none' }}
          variant="outlined"
        >
          View
        </Button>
      ),
      sortable: false,
      width: 110,
    },
  ];

  return (
    <PageSection
      action={
        <Chip color={pendingCount ? 'warning' : 'default'} label={`${pendingCount} pending`} />
      }
      description="Review customer wallet top-up transfer receipts and manually approve wallet balance updates."
      title="Wallet Top-ups"
    >
      <Stack spacing={2}>
        <Stack
          direction={{ sm: 'row', xs: 'column' }}
          spacing={2}
          sx={{
            alignItems: { sm: 'center', xs: 'stretch' },
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            p: 2,
          }}
        >
          <TextField
            label="Status"
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            select
            sx={{ maxWidth: { sm: 240 } }}
            value={statusFilter}
          >
            <MenuItem value="all">All requests</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </TextField>
          <Typography sx={{ color: 'text.secondary', fontWeight: 700 }}>
            Approve only after confirming the receipt amount in the uploaded image.
          </Typography>
        </Stack>
        {topUpsQuery.error ? (
          <Alert severity="error">{toApiError(topUpsQuery.error).message}</Alert>
        ) : null}
        <AppDataTable columns={columns} loading={topUpsQuery.isLoading} rows={topUps} />
      </Stack>

      <Dialog fullWidth maxWidth="md" onClose={closeReview} open={Boolean(reviewTarget)}>
        <DialogTitle sx={{ pr: 7 }}>
          Review wallet top-up
          <IconButton
            aria-label="Close"
            onClick={closeReview}
            sx={{ position: 'absolute', right: 12, top: 12 }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {reviewTarget ? (
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { md: '1fr 1fr', xs: '1fr' },
                mt: 1,
              }}
            >
              <Stack spacing={1.2}>
                <Typography sx={{ fontWeight: 900 }}>{reviewTarget.customerName}</Typography>
                <Typography>{reviewTarget.customerEmail}</Typography>
                <Typography>Requested: {formatCurrency(reviewTarget.amount)}</Typography>
                <Typography>
                  Status:{' '}
                  <Chip
                    color={statusColors[reviewTarget.status]}
                    label={reviewTarget.status}
                    size="small"
                    sx={{ ml: 0.5 }}
                  />
                </Typography>
                {reviewTarget.promoCode ? (
                  <Typography>Promo code: {reviewTarget.promoCode}</Typography>
                ) : null}
                {reviewTarget.status === 'pending' ? (
                  <>
                    <TextField
                      label="Amount to top up"
                      onChange={(event) => setApprovedAmount(event.target.value)}
                      required
                      type="number"
                      value={approvedAmount}
                    />
                    <TextField
                      label="Admin note"
                      minRows={3}
                      multiline
                      onChange={(event) => setAdminNote(event.target.value)}
                      value={adminNote}
                    />
                  </>
                ) : (
                  <>
                    {reviewTarget.approvedAmount ? (
                      <Typography>
                        Approved: {formatCurrency(reviewTarget.approvedAmount)}
                      </Typography>
                    ) : null}
                    {reviewTarget.adminNote ? (
                      <Typography>Admin note: {reviewTarget.adminNote}</Typography>
                    ) : null}
                    {reviewTarget.reviewedAt ? (
                      <Typography>Reviewed: {formatDate(reviewTarget.reviewedAt)}</Typography>
                    ) : null}
                  </>
                )}
              </Stack>
              <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: 'center', bgcolor: 'grey.100', p: 1.2 }}
                >
                  <ReceiptLongOutlinedIcon fontSize="small" />
                  <Typography sx={{ fontWeight: 800 }}>{receiptLabel(reviewTarget)}</Typography>
                </Stack>
                {reviewTarget.receiptImageUrl ? (
                  <Box
                    component="img"
                    src={reviewTarget.receiptImageUrl}
                    sx={{ display: 'block', maxHeight: 420, objectFit: 'contain', width: '100%' }}
                  />
                ) : (
                  <Box sx={{ p: 3 }}>
                    <Alert severity="warning">
                      Receipt preview is not available. The signed S3 URL may have expired.
                    </Alert>
                  </Box>
                )}
              </Box>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: reviewTarget?.status === 'pending' ? 'space-between' : 'flex-end',
            px: 3,
            pb: 2.5,
          }}
        >
          {reviewTarget?.status === 'pending' ? (
            <>
              <Button
                color="error"
                disabled={approveMutation.isPending || rejectMutation.isPending}
                onClick={() => void rejectMutation.mutateAsync()}
                sx={{ textTransform: 'none' }}
                variant="outlined"
              >
                Reject request
              </Button>
              <Button
                disabled={approveMutation.isPending || rejectMutation.isPending}
                onClick={() => void approveMutation.mutateAsync()}
                sx={{ borderRadius: 999, px: 4, textTransform: 'none' }}
                variant="contained"
              >
                Approve top-up
              </Button>
            </>
          ) : null}
        </DialogActions>
      </Dialog>
    </PageSection>
  );
};
