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
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { GridActionsCellItem, type GridColDef } from '@mui/x-data-grid';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { adminApi } from '@features/admin/api/adminApi';
import type { AdminPromotion } from '@features/admin/types/admin.types';
import { useDebounce } from '@hooks/useDebounce';
import { toApiError } from '@shared/api/apiError';
import { AppButton } from '@shared/components/ui/Button/AppButton';
import { AppDataTable } from '@shared/components/ui/DataTable/DataTable';
import { PageSection } from '@shared/components/ui/SectionTitle/PageSection';
import { formatDate } from '@utils/formatDate';

type PromotionForm = Pick<AdminPromotion, 'code' | 'discount' | 'endsAt' | 'startsAt'> & {
  campaign: string;
};

const emptyForm: PromotionForm = {
  code: '',
  discount: '',
  endsAt: '2026-06-30',
  campaign: '',
  startsAt: '2026-04-27',
};

const toDateInputValue = (date: string) => date.slice(0, 10);

export const PromotionsPage = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminPromotion | null>(null);
  const [form, setForm] = useState<PromotionForm>(emptyForm);
  const [isPromotionDialogOpen, setIsPromotionDialogOpen] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const promotionsQuery = useQuery({
    queryFn: ({ signal }) => adminApi.listPromotions({ search: debouncedSearch }, { signal }),
    queryKey: ['admin', 'promotions', debouncedSearch],
  });
  const promotions = promotionsQuery.data ?? [];

  const columns: GridColDef<AdminPromotion>[] = [
    { field: 'campaign', flex: 1, headerName: 'Campaign', minWidth: 200 },
    { field: 'code', headerName: 'Code', width: 130 },
    { field: 'discount', flex: 1, headerName: 'Discount', minWidth: 220 },
    {
      field: 'startsAt',
      headerName: 'Starts',
      valueFormatter: (value: string) => formatDate(value),
      width: 140,
    },
    {
      field: 'endsAt',
      headerName: 'Ends',
      valueFormatter: (value: string) => formatDate(value),
      width: 140,
    },
    {
      field: 'status',
      headerName: 'Status',
      renderCell: (params) => {
        const status = params.row.status;

        return (
          <Chip
            color={status === 'active' ? 'success' : status === 'paused' ? 'default' : 'info'}
            label={status}
            size="small"
          />
        );
      },
      width: 130,
    },
    { field: 'uses', headerName: 'Uses', type: 'number', width: 100 },
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
              campaign: row.campaign,
              code: row.code,
              discount: row.discount,
              endsAt: toDateInputValue(row.endsAt),
              startsAt: toDateInputValue(row.startsAt),
            });
            setIsPromotionDialogOpen(true);
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
      width: 80,
    },
  ];

  const saveMutation = useMutation({
    mutationFn: async () => {
      const campaign = form.campaign.trim();
      const code = form.code.trim().toUpperCase();
      const discount = form.discount.trim();

      if (!campaign || !code || !discount || !form.startsAt || !form.endsAt) {
        throw new Error('Complete the campaign, code, discount, and date fields.');
      }

      const existing = promotions.find((promotion) => promotion.id === editingId);
      const promotionPayload = {
        campaign,
        code,
        discount,
        endsAt: new Date(`${form.endsAt}T23:59:59.999Z`).toISOString(),
        startsAt: new Date(`${form.startsAt}T00:00:00.000Z`).toISOString(),
        status: existing?.status ?? ('scheduled' as const),
        uses: existing?.uses ?? 0,
      };

      return editingId
        ? adminApi.updatePromotion(editingId, promotionPayload)
        : adminApi.createPromotion(promotionPayload);
    },
    onError: (error) => toast.error(toApiError(error).message),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'promotions'] });
      toast.success(result.message);
      setEditingId(null);
      setForm(emptyForm);
      setIsPromotionDialogOpen(false);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: adminApi.deletePromotion,
    onError: (error) => toast.error(toApiError(error).message),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'promotions'] });
      toast.success(result.message);
      setDeleteTarget(null);
    },
  });

  return (
    <PageSection
      action={
        <AppButton
          onClick={() => {
            setForm(emptyForm);
            setEditingId(null);
            setIsPromotionDialogOpen(true);
          }}
          startIcon={<AddRoundedIcon />}
        >
          Add promotion
        </AppButton>
      }
      description="Create campaigns, manage promotion dates, and remove outdated offers."
      title="Promotions"
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
          label="Search promotions"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Campaign, code, discount, or date"
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
          Showing {promotions.length}
        </Typography>
      </Stack>

      <AppDataTable
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        loading={promotionsQuery.isLoading}
        rows={promotions}
      />
      {promotionsQuery.isError ? (
        <Alert severity="error">{toApiError(promotionsQuery.error).message}</Alert>
      ) : null}

      <Dialog
        fullWidth
        maxWidth="sm"
        onClose={() => setIsPromotionDialogOpen(false)}
        open={isPromotionDialogOpen}
      >
        <DialogTitle>{editingId ? 'Edit Promotion' : 'Create Promotion'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.25} sx={{ pt: 1 }}>
            <TextField
              autoFocus
              label="Campaign name"
              onChange={(event) =>
                setForm((current) => ({ ...current, campaign: event.target.value }))
              }
              value={form.campaign}
            />
            <TextField
              label="Promo code"
              onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))}
              value={form.code}
            />
            <TextField
              label="Discount"
              onChange={(event) =>
                setForm((current) => ({ ...current, discount: event.target.value }))
              }
              value={form.discount}
            />
            <Grid container spacing={2}>
              <Grid size={{ sm: 6, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Promotion start date"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, startsAt: event.target.value }))
                  }
                  slotProps={{ inputLabel: { shrink: true } }}
                  type="date"
                  value={form.startsAt}
                />
              </Grid>
              <Grid size={{ sm: 6, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Promotion end date"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, endsAt: event.target.value }))
                  }
                  slotProps={{ inputLabel: { shrink: true } }}
                  type="date"
                  value={form.endsAt}
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <AppButton
            color="inherit"
            onClick={() => setIsPromotionDialogOpen(false)}
            variant="outlined"
          >
            Cancel
          </AppButton>
          <AppButton disabled={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
            {editingId ? 'Save promotion' : 'Add promotion'}
          </AppButton>
        </DialogActions>
      </Dialog>
      <Dialog
        fullWidth
        maxWidth="xs"
        onClose={() => setDeleteTarget(null)}
        open={Boolean(deleteTarget)}
      >
        <DialogTitle>Delete Promotion?</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">Delete {deleteTarget?.campaign}?</Typography>
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
