import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import PauseCircleOutlineRoundedIcon from '@mui/icons-material/PauseCircleOutlineRounded';
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded';
import {
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import { GridActionsCellItem, type GridColDef } from '@mui/x-data-grid';
import { useState } from 'react';

import { AppButton } from '@shared/components/ui/Button/AppButton';
import { AppDataTable } from '@shared/components/ui/DataTable/DataTable';
import { PageSection } from '@shared/components/ui/SectionTitle/PageSection';
import { type DemoPromotion, mockPromotions } from '@shared/lib/mockData';
import { formatDate } from '@utils/formatDate';

type PromotionForm = Pick<DemoPromotion, 'code' | 'discount' | 'name' | 'status'>;

const emptyForm: PromotionForm = {
  code: '',
  discount: '',
  name: '',
  status: 'Scheduled',
};

export const PromotionsPage = () => {
  const [promotions, setPromotions] = useState<DemoPromotion[]>(mockPromotions);
  const [form, setForm] = useState<PromotionForm>(emptyForm);
  const [isPromotionDialogOpen, setIsPromotionDialogOpen] = useState(false);

  const columns: GridColDef<DemoPromotion>[] = [
    { field: 'name', flex: 1, headerName: 'Campaign', minWidth: 200 },
    { field: 'code', headerName: 'Code', width: 130 },
    { field: 'discount', flex: 1, headerName: 'Discount', minWidth: 220 },
    {
      field: 'status',
      headerName: 'Status',
      renderCell: (params) => (
        <Chip
          color={params.value === 'Active' ? 'success' : params.value === 'Paused' ? 'default' : 'info'}
          label={params.value}
          size="small"
        />
      ),
      width: 130,
    },
    { field: 'redemptions', headerName: 'Uses', type: 'number', width: 100 },
    {
      field: 'endsAt',
      headerName: 'Ends',
      valueFormatter: (value: string) => formatDate(value),
      width: 140,
    },
    {
      field: 'actions',
      getActions: ({ row }) => [
        <GridActionsCellItem
          icon={row.status === 'Active' ? <PauseCircleOutlineRoundedIcon /> : <PlayCircleOutlineRoundedIcon />}
          key="toggle"
          label={row.status === 'Active' ? 'Pause' : 'Activate'}
          onClick={() =>
            setPromotions((current) =>
              current.map((promotion) =>
                promotion.id === row.id
                  ? { ...promotion, status: promotion.status === 'Active' ? 'Paused' : 'Active' }
                  : promotion,
              ),
            )
          }
        />,
        <GridActionsCellItem
          icon={<DeleteOutlineRoundedIcon />}
          key="delete"
          label="Delete"
          onClick={() => setPromotions((current) => current.filter((promotion) => promotion.id !== row.id))}
        />,
      ],
      type: 'actions',
      width: 110,
    },
  ];

  const addPromotion = () => {
    const name = form.name.trim();
    const code = form.code.trim().toUpperCase();
    const discount = form.discount.trim();

    if (!name || !code || !discount) {
      return;
    }

    setPromotions((current) => [
      {
        code,
        discount,
        endsAt: '2026-06-30T23:59:00Z',
        id: `promo-${Date.now()}`,
        name,
        redemptions: 0,
        status: form.status,
      },
      ...current,
    ]);
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
      description="Create demo campaigns, activate or pause promotions, and remove outdated offers."
      title="Promotions"
    >
      <AppDataTable
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        rows={promotions}
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
            <TextField
              label="Status"
              onChange={(event) =>
                setForm((current) => ({ ...current, status: event.target.value as DemoPromotion['status'] }))
              }
              select
              value={form.status}
            >
              {(['Scheduled', 'Active', 'Paused'] satisfies DemoPromotion['status'][]).map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>
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
