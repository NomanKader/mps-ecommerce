import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
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
import { useMemo, useState } from 'react';

import { AppButton } from '@shared/components/ui/Button/AppButton';
import { AppDataTable } from '@shared/components/ui/DataTable/DataTable';
import { PageSection } from '@shared/components/ui/SectionTitle/PageSection';
import { type DemoPromotion, mockPromotions } from '@shared/lib/mockData';
import { formatDate } from '@utils/formatDate';

type PromotionForm = Pick<DemoPromotion, 'code' | 'discount' | 'endsAt' | 'name' | 'startsAt'>;

const emptyForm: PromotionForm = {
  code: '',
  discount: '',
  endsAt: '2026-06-30',
  name: '',
  startsAt: '2026-04-27',
};

const toDateInputValue = (date: string) => date.slice(0, 10);

const getPromotionStatus = (promotion: DemoPromotion): DemoPromotion['status'] => {
  const today = '2026-04-27';
  const startsAt = toDateInputValue(promotion.startsAt);
  const endsAt = toDateInputValue(promotion.endsAt);

  if (today < startsAt) {
    return 'Scheduled';
  }

  if (today > endsAt) {
    return 'Paused';
  }

  return 'Active';
};

export const PromotionsPage = () => {
  const [promotions, setPromotions] = useState<DemoPromotion[]>(mockPromotions);
  const [form, setForm] = useState<PromotionForm>(emptyForm);
  const [isPromotionDialogOpen, setIsPromotionDialogOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredPromotions = useMemo(
    () =>
      promotions.filter((promotion) => {
        const normalizedSearch = search.trim().toLowerCase();
        const searchableValue = [
          promotion.name,
          promotion.code,
          promotion.discount,
          getPromotionStatus(promotion),
          formatDate(promotion.startsAt),
          formatDate(promotion.endsAt),
        ]
          .join(' ')
          .toLowerCase();

        return normalizedSearch ? searchableValue.includes(normalizedSearch) : true;
      }),
    [promotions, search],
  );

  const columns: GridColDef<DemoPromotion>[] = [
    { field: 'name', flex: 1, headerName: 'Campaign', minWidth: 200 },
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
        const status = getPromotionStatus(params.row);

        return (
          <Chip
            color={status === 'Active' ? 'success' : status === 'Paused' ? 'default' : 'info'}
            label={status}
            size="small"
          />
        );
      },
      width: 130,
    },
    { field: 'redemptions', headerName: 'Uses', type: 'number', width: 100 },
    {
      field: 'actions',
      getActions: ({ row }) => [
        <GridActionsCellItem
          icon={<DeleteOutlineRoundedIcon />}
          key="delete"
          label="Delete"
          onClick={() => setPromotions((current) => current.filter((promotion) => promotion.id !== row.id))}
        />,
      ],
      type: 'actions',
      width: 80,
    },
  ];

  const addPromotion = () => {
    const name = form.name.trim();
    const code = form.code.trim().toUpperCase();
    const discount = form.discount.trim();

    if (!name || !code || !discount || !form.startsAt || !form.endsAt) {
      return;
    }

    const promotionPayload: DemoPromotion = {
      code,
      discount,
      endsAt: `${form.endsAt}T23:59:00Z`,
      id: `promo-${Date.now()}`,
      name,
      redemptions: 0,
      startsAt: `${form.startsAt}T00:00:00Z`,
      status: 'Scheduled',
    };

    setPromotions((current) => [{ ...promotionPayload, status: getPromotionStatus(promotionPayload) }, ...current]);
    setForm(emptyForm);
    setIsPromotionDialogOpen(false);
  };

  return (
    <PageSection
      action={
        <AppButton
          onClick={() => {
            setForm(emptyForm);
            setIsPromotionDialogOpen(true);
          }}
          startIcon={<AddRoundedIcon />}
        >
          Add promotion
        </AppButton>
      }
      description="Create demo campaigns, manage promotion dates, and remove outdated offers."
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
          Showing {filteredPromotions.length} of {promotions.length}
        </Typography>
      </Stack>

      <AppDataTable
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        rows={filteredPromotions}
      />

      <Dialog
        fullWidth
        maxWidth="sm"
        onClose={() => setIsPromotionDialogOpen(false)}
        open={isPromotionDialogOpen}
      >
        <DialogTitle>Create Promotion</DialogTitle>
        <DialogContent>
          <Stack spacing={2.25} sx={{ pt: 1 }}>
            <TextField
              autoFocus
              label="Campaign name"
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              value={form.name}
            />
            <TextField
              label="Promo code"
              onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))}
              value={form.code}
            />
            <TextField
              label="Discount"
              onChange={(event) => setForm((current) => ({ ...current, discount: event.target.value }))}
              value={form.discount}
            />
            <Grid container spacing={2}>
              <Grid size={{ sm: 6, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Promotion start date"
                  onChange={(event) => setForm((current) => ({ ...current, startsAt: event.target.value }))}
                  slotProps={{ inputLabel: { shrink: true } }}
                  type="date"
                  value={form.startsAt}
                />
              </Grid>
              <Grid size={{ sm: 6, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Promotion end date"
                  onChange={(event) => setForm((current) => ({ ...current, endsAt: event.target.value }))}
                  slotProps={{ inputLabel: { shrink: true } }}
                  type="date"
                  value={form.endsAt}
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <AppButton color="inherit" onClick={() => setIsPromotionDialogOpen(false)} variant="outlined">
            Cancel
          </AppButton>
          <AppButton onClick={addPromotion}>Add promotion</AppButton>
        </DialogActions>
      </Dialog>
    </PageSection>
  );
};
