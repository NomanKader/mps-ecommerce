import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
  Box,
  Chip,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  InputAdornment,
  ListSubheader,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { GridActionsCellItem, type GridColDef } from '@mui/x-data-grid';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import { storefrontColors } from '@app/providers/theme/tokens';
import { merchandisingApi } from '@features/home/api/merchandisingApi';
import type {
  StorefrontHighlightItem,
  StorefrontHighlightSection,
} from '@features/home/types/home.types';
import { toApiError } from '@shared/api/apiError';
import { AppButton } from '@shared/components/ui/Button/AppButton';
import { AppDataTable } from '@shared/components/ui/DataTable/DataTable';
import { PageSection } from '@shared/components/ui/SectionTitle/PageSection';

type HighlightForm = Omit<StorefrontHighlightItem, 'id'>;
type StorefrontIconsPageProps = {
  description?: string;
  itemLabel?: string;
  sectionFilter?: StorefrontHighlightSection;
  title?: string;
};

const emptyForm: HighlightForm = {
  color: '#e43224',
  icon: '🏷️',
  label: '',
  section: 'featured',
  status: 'active',
};

const iconGroups = [
  {
    label: 'Storefront',
    options: [
      { label: 'New', value: '🆕' },
      { label: 'Promotion tag', value: '🏷️' },
      { label: 'Sale', value: '💸' },
      { label: 'Best seller', value: '🏆' },
      { label: 'Must try', value: '👍' },
      { label: 'Hot deal', value: '🔥' },
      { label: 'Coming soon', value: '⏳' },
      { label: 'Local store', value: '🏬' },
      { label: 'Delivery', value: '🚚' },
      { label: 'Easy payment', value: '💳' },
    ],
  },
  {
    label: 'Fresh food',
    options: [
      { label: 'Fresh fruit', value: '🍎' },
      { label: 'Apple', value: '🍏' },
      { label: 'Pear', value: '🍐' },
      { label: 'Orange', value: '🍊' },
      { label: 'Strawberry', value: '🍓' },
      { label: 'Blueberries', value: '🫐' },
      { label: 'Grapes', value: '🍇' },
      { label: 'Watermelon', value: '🍉' },
      { label: 'Banana', value: '🍌' },
      { label: 'Lemon', value: '🍋' },
      { label: 'Pineapple', value: '🍍' },
      { label: 'Mango', value: '🥭' },
      { label: 'Avocado', value: '🥑' },
      { label: 'Vegetables', value: '🥬' },
      { label: 'Carrot', value: '🥕' },
      { label: 'Tomato', value: '🍅' },
      { label: 'Cucumber', value: '🥒' },
      { label: 'Broccoli', value: '🥦' },
      { label: 'Corn', value: '🌽' },
      { label: 'Potato', value: '🥔' },
      { label: 'Onion', value: '🧅' },
      { label: 'Garlic', value: '🧄' },
      { label: 'Chilli', value: '🌶️' },
      { label: 'Mushroom', value: '🍄' },
    ],
  },
  {
    label: 'Departments',
    options: [
      { label: 'Bakery', value: '🍞' },
      { label: 'Croissant', value: '🥐' },
      { label: 'Bagel', value: '🥯' },
      { label: 'Baguette', value: '🥖' },
      { label: 'Pretzel', value: '🥨' },
      { label: 'Dairy', value: '🥛' },
      { label: 'Cheese', value: '🧀' },
      { label: 'Eggs', value: '🥚' },
      { label: 'Meat', value: '🥩' },
      { label: 'Chicken', value: '🍗' },
      { label: 'Bacon', value: '🥓' },
      { label: 'Burger', value: '🍔' },
      { label: 'Seafood', value: '🐟' },
      { label: 'Shrimp', value: '🦐' },
      { label: 'Crab', value: '🦀' },
      { label: 'Lobster', value: '🦞' },
      { label: 'Sushi', value: '🍣' },
      { label: 'Pantry', value: '🥫' },
      { label: 'Frozen', value: '❄️' },
    ],
  },
  {
    label: 'Global staples',
    options: [
      { label: 'Rice', value: '🍚' },
      { label: 'Cooked rice', value: '🍙' },
      { label: 'Noodles', value: '🍜' },
      { label: 'Spaghetti', value: '🍝' },
      { label: 'Flatbread', value: '🫓' },
      { label: 'Taco', value: '🌮' },
      { label: 'Burrito', value: '🌯' },
      { label: 'Dumpling', value: '🥟' },
      { label: 'Curry', value: '🍛' },
      { label: 'Soup', value: '🍲' },
      { label: 'Salad', value: '🥗' },
      { label: 'Beans', value: '🫘' },
      { label: 'Peanuts', value: '🥜' },
      { label: 'Honey', value: '🍯' },
      { label: 'Olive', value: '🫒' },
    ],
  },
  {
    label: 'Drinks and snacks',
    options: [
      { label: 'Water', value: '💧' },
      { label: 'Soft drink', value: '🥤' },
      { label: 'Juice box', value: '🧃' },
      { label: 'Coffee', value: '☕' },
      { label: 'Tea', value: '🍵' },
      { label: 'Bubble tea', value: '🧋' },
      { label: 'Chocolate', value: '🍫' },
      { label: 'Candy', value: '🍬' },
      { label: 'Cookie', value: '🍪' },
      { label: 'Doughnut', value: '🍩' },
      { label: 'Cake', value: '🍰' },
      { label: 'Ice cream', value: '🍨' },
      { label: 'Popcorn', value: '🍿' },
    ],
  },
  {
    label: 'Prepared meals',
    options: [
      { label: 'Pizza', value: '🍕' },
      { label: 'Sandwich', value: '🥪' },
      { label: 'Hot dog', value: '🌭' },
      { label: 'Fries', value: '🍟' },
      { label: 'Pancakes', value: '🥞' },
      { label: 'Waffle', value: '🧇' },
      { label: 'Tamale', value: '🫔' },
      { label: 'Fondue', value: '🫕' },
      { label: 'Takeout box', value: '🥡' },
      { label: 'Bento', value: '🍱' },
      { label: 'Pot of food', value: '🍲' },
      { label: 'Stew', value: '🥘' },
    ],
  },
  {
    label: 'Lifestyle',
    options: [
      { label: 'Organic leaf', value: '🌿' },
      { label: 'Seedling', value: '🌱' },
      { label: 'Gluten-free grain', value: '🌾' },
      { label: 'No added sugar candy', value: '🍬' },
      { label: 'Vegan bowl', value: '🥗' },
      { label: 'Keto bowl', value: '🥣' },
      { label: 'Recipes chef', value: '👨‍🍳' },
      { label: 'Healthy heart', value: '💚' },
      { label: 'Baby care', value: '🧸' },
      { label: 'Home care', value: '🧼' },
      { label: 'Pet care', value: '🐾' },
      { label: 'Medicine', value: '💊' },
      { label: 'First aid', value: '🩹' },
      { label: 'Tooth care', value: '🪥' },
      { label: 'Paper goods', value: '🧻' },
      { label: 'Cleaning sponge', value: '🧽' },
      { label: 'Laundry', value: '🧺' },
      { label: 'Soap', value: '🧼' },
      { label: 'Lotion', value: '🧴' },
      { label: 'Razor', value: '🪒' },
      { label: 'Cosmetics', value: '💄' },
      { label: 'Perfume', value: '🧴' },
    ],
  },
  {
    label: 'Gifting and bulk',
    options: [
      { label: 'Bulk box', value: '📦' },
      { label: 'Shopping bags', value: '🛍️' },
      { label: 'Gift ribbon', value: '🎀' },
      { label: 'Gift box', value: '🎁' },
      { label: 'Celebration', value: '🎉' },
      { label: 'Flowers', value: '💐' },
      { label: 'Rose', value: '🌹' },
      { label: 'Star', value: '⭐' },
      { label: 'Sparkles', value: '✨' },
      { label: 'Diamond', value: '💎' },
    ],
  },
  {
    label: 'Household and pets',
    options: [
      { label: 'Home', value: '🏠' },
      { label: 'Kitchen', value: '🍽️' },
      { label: 'Cutlery', value: '🍴' },
      { label: 'Cooking pot', value: '🍳' },
      { label: 'Basket', value: '🧺' },
      { label: 'Broom', value: '🧹' },
      { label: 'Bucket', value: '🪣' },
      { label: 'Tissue', value: '🧻' },
      { label: 'Dog', value: '🐶' },
      { label: 'Cat', value: '🐱' },
      { label: 'Pet food', value: '🦴' },
      { label: 'Paw', value: '🐾' },
    ],
  },
  {
    label: 'Service and trust',
    options: [
      { label: 'Verified', value: '✅' },
      { label: 'Quality', value: '🏅' },
      { label: 'Eco', value: '♻️' },
      { label: 'Fast', value: '⚡' },
      { label: 'Clock', value: '🕒' },
      { label: 'Support', value: '🎧' },
      { label: 'Phone', value: '☎️' },
      { label: 'Location', value: '📍' },
      { label: 'Wallet', value: '👛' },
      { label: 'Receipt', value: '🧾' },
      { label: 'Shield', value: '🛡️' },
      { label: 'Warning', value: '⚠️' },
    ],
  },
];

const toPayload = (form: HighlightForm): Omit<StorefrontHighlightItem, 'id'> => ({
  color: form.color.trim() || '#e43224',
  icon: form.icon.trim() || '🏷️',
  label: form.label.trim(),
  section: form.section,
  status: form.status,
  surfaceColor: form.surfaceColor?.trim() || undefined,
  textColor: form.textColor?.trim() || undefined,
});

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#ffffff',
    borderRadius: 1,
  },
};

const ColorPickerField = ({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) => {
  const isLight =
    value.toLowerCase() === '#ffffff' ||
    value.toLowerCase() === '#fff2b8' ||
    value.toLowerCase() === '#fff';

  return (
    <Stack spacing={0.75}>
      <Typography sx={{ color: 'text.secondary', fontSize: '0.82rem', fontWeight: 800 }}>
        {label}
      </Typography>
      <Box
        component="label"
        sx={{
          alignItems: 'center',
          backgroundColor: value,
          border: `1px solid ${alpha(storefrontColors.navy, 0.16)}`,
          borderRadius: 1,
          boxShadow: `inset 0 0 0 2px ${alpha('#ffffff', 0.32)}`,
          color: isLight ? storefrontColors.navy : '#ffffff',
          cursor: 'pointer',
          display: 'flex',
          fontWeight: 900,
          height: 58,
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
          textTransform: 'uppercase',
        }}
      >
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 900 }}>{value}</Typography>
        <Box
          component="input"
          onChange={(event) => onChange(event.target.value)}
          sx={{
            cursor: 'pointer',
            inset: 0,
            opacity: 0,
            position: 'absolute',
          }}
          type="color"
          value={value}
        />
      </Box>
    </Stack>
  );
};

const IconPreview = ({ item }: { item: StorefrontHighlightItem }) => (
  <Stack
    spacing={1.15}
    sx={{
      alignItems: 'center',
      background: `linear-gradient(135deg, ${item.surfaceColor ?? storefrontColors.surface} 0%, ${alpha(item.color, 0.12)} 100%)`,
      border: `1px solid ${alpha(item.color, 0.22)}`,
      borderRadius: 1,
      boxShadow: `0 20px 44px ${alpha(item.color, 0.12)}`,
      minHeight: 188,
      overflow: 'hidden',
      p: 2.25,
      position: 'relative',
      textAlign: 'center',
      width: '100%',
      '&::before': {
        background: `radial-gradient(circle, ${alpha('#ffffff', 0.72)} 0%, transparent 64%)`,
        content: '""',
        height: 160,
        position: 'absolute',
        right: -52,
        top: -72,
        width: 160,
      },
    }}
  >
    <Box
      sx={{
        alignItems: 'center',
        background: `linear-gradient(135deg, ${item.color} 0%, ${alpha(item.color, 0.78)} 100%)`,
        borderRadius: '50%',
        color: '#ffffff',
        display: 'flex',
        fontSize: 36,
        height: 82,
        justifyContent: 'center',
        position: 'relative',
        width: 82,
        zIndex: 1,
      }}
    >
      {item.icon}
    </Box>
    <Typography
      sx={{
        color: alpha('#171717', 0.9),
        fontSize: '1.05rem',
        fontWeight: 900,
        lineHeight: 1.15,
        maxWidth: '100%',
        overflowWrap: 'anywhere',
        position: 'relative',
        zIndex: 1,
      }}
    >
      {item.label || 'Icon label'}
    </Typography>
  </Stack>
);

export const StorefrontIconsPage = ({
  description = 'Customize reusable storefront icons for categories and other admin workflows.',
  itemLabel = 'icon',
  sectionFilter,
  title = 'Storefront Icons',
}: StorefrontIconsPageProps) => {
  const queryClient = useQueryClient();
  const emptySectionForm = useMemo(
    () => ({
      ...emptyForm,
      section: sectionFilter ?? emptyForm.section,
    }),
    [sectionFilter],
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StorefrontHighlightItem | null>(null);
  const [form, setForm] = useState<HighlightForm>(emptySectionForm);
  const [iconSearch, setIconSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [search, setSearch] = useState('');
  const iconsQuery = useQuery({
    queryFn: ({ signal }) => merchandisingApi.listAdminStorefrontIcons({}, { signal }),
    queryKey: ['admin', 'storefront-icons'],
  });
  const items = useMemo(
    () =>
      (iconsQuery.data ?? []).filter((item) =>
        sectionFilter ? (item.section ?? 'featured') === sectionFilter : true,
      ),
    [iconsQuery.data, sectionFilter],
  );
  const iconUsageByValue = useMemo(
    () =>
      items.reduce<Record<string, number>>((usage, item) => {
        usage[item.icon] = (usage[item.icon] ?? 0) + 1;
        return usage;
      }, {}),
    [items],
  );
  const repeatedIconCount = useMemo(
    () => Object.values(iconUsageByValue).filter((count) => count > 1).length,
    [iconUsageByValue],
  );

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return items
      .filter((item) =>
        normalizedSearch
          ? [item.label, item.icon].join(' ').toLowerCase().includes(normalizedSearch)
          : true,
      )
      .sort((first, second) => first.label.localeCompare(second.label));
  }, [items, search]);
  const filteredIconGroups = useMemo(() => {
    const normalizedSearch = iconSearch.trim().toLowerCase();

    if (!normalizedSearch) {
      return iconGroups;
    }

    return iconGroups
      .map((group) => ({
        ...group,
        options: group.options.filter((option) =>
          `${option.label} ${option.value}`.toLowerCase().includes(normalizedSearch),
        ),
      }))
      .filter((group) => group.options.length > 0);
  }, [iconSearch]);

  const columns: GridColDef<StorefrontHighlightItem>[] = [
    {
      field: 'label',
      flex: 1,
      headerName: 'Name',
      minWidth: 220,
      renderCell: (params) => (
        <Stack direction="row" spacing={1.2} sx={{ alignItems: 'center', minWidth: 0 }}>
          <Box
            sx={{
              alignItems: 'center',
              bgcolor: params.row.color,
              borderRadius: '50%',
              color: '#ffffff',
              display: 'flex',
              flex: '0 0 auto',
              height: 34,
              justifyContent: 'center',
              width: 34,
            }}
          >
            {params.row.icon}
          </Box>
          <Typography noWrap sx={{ fontWeight: 800 }} variant="body2">
            {params.row.label}
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      renderCell: (params) => (
        <Chip
          color={params.row.status === 'active' ? 'success' : 'default'}
          label={params.row.status}
          size="small"
        />
      ),
      width: 120,
    },
    {
      field: 'iconUsage',
      headerName: 'Used',
      renderCell: (params) => {
        const usageCount = iconUsageByValue[params.row.icon] ?? 0;

        return (
          <Chip
            color={usageCount > 1 ? 'warning' : 'default'}
            label={`${usageCount} ${usageCount === 1 ? 'time' : 'times'}`}
            size="small"
            variant={usageCount > 1 ? 'filled' : 'outlined'}
          />
        );
      },
      sortable: false,
      width: 130,
    },
    {
      field: 'section',
      headerName: 'Section',
      renderCell: (params) => (
        <Chip label={params.row.section ?? 'featured'} size="small" variant="outlined" />
      ),
      width: 150,
    },
    {
      field: 'actions',
      getActions: ({ row }) => [
        <GridActionsCellItem
          icon={<EditRoundedIcon />}
          key="edit"
          label="Edit"
          onClick={() => {
            setEditingId(row.id);
            setIconSearch('');
            setForm({
              color: row.color,
              icon: row.icon,
              label: row.label,
              section: sectionFilter ?? row.section ?? 'featured',
              status: row.status,
              surfaceColor: row.surfaceColor ?? '',
              textColor: row.textColor ?? '',
            });
            setIsDialogOpen(true);
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
      width: 90,
    },
  ];

  const createMutation = useMutation({
    mutationFn: merchandisingApi.createStorefrontIcon,
    onError: (error) => toast.error(toApiError(error).message),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'storefront-icons'] });
      await queryClient.invalidateQueries({ queryKey: ['storefront', 'icons'] });
      setEditingId(null);
      setForm(emptySectionForm);
      setIsDialogOpen(false);
      toast.success(result.message);
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Omit<StorefrontHighlightItem, 'id'> }) =>
      merchandisingApi.updateStorefrontIcon(id, payload),
    onError: (error) => toast.error(toApiError(error).message),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'storefront-icons'] });
      await queryClient.invalidateQueries({ queryKey: ['storefront', 'icons'] });
      setEditingId(null);
      setForm(emptySectionForm);
      setIsDialogOpen(false);
      toast.success(result.message);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: merchandisingApi.deleteStorefrontIcon,
    onError: (error) => toast.error(toApiError(error).message),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'storefront-icons'] });
      await queryClient.invalidateQueries({ queryKey: ['storefront', 'icons'] });
      setDeleteTarget(null);
      toast.success(result.message);
    },
  });

  const handleSave = () => {
    const item = toPayload({
      ...form,
      section: sectionFilter ?? form.section,
    });

    if (!item.label || !item.icon) {
      toast.error(`Complete the ${itemLabel} name and icon fields.`);
      return;
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, payload: item });
      return;
    }

    createMutation.mutate(item);
  };

  const previewItem = {
    ...toPayload({
      ...form,
      section: sectionFilter ?? form.section,
    }),
    id: editingId ?? 'preview',
  };

  return (
    <PageSection
      action={
        <Stack
          direction={{ sm: 'row', xs: 'column' }}
          spacing={1.25}
          sx={{ alignItems: 'stretch', width: { sm: 'auto', xs: '100%' } }}
        >
          <AppButton
            onClick={() => {
              setForm(emptySectionForm);
              setIconSearch('');
              setEditingId(null);
              setIsDialogOpen(true);
            }}
            startIcon={<AddRoundedIcon />}
            sx={{ minWidth: { sm: 128, xs: '100%' } }}
          >
            Add {itemLabel}
          </AppButton>
        </Stack>
      }
      description={description}
      title={title}
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
          label={`Search ${itemLabel}s`}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Name or icon"
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
        <Typography color="text.secondary" sx={{ ml: { lg: 'auto' } }} variant="body2">
          Showing {filteredItems.length}
        </Typography>
        <Chip
          color={repeatedIconCount > 0 ? 'warning' : 'success'}
          label={
            repeatedIconCount > 0
              ? `${repeatedIconCount} repeated ${repeatedIconCount === 1 ? 'icon' : 'icons'}`
              : 'No repeated icons'
          }
          size="small"
          sx={{ alignSelf: { lg: 'center', xs: 'flex-start' }, fontWeight: 800 }}
          variant={repeatedIconCount > 0 ? 'filled' : 'outlined'}
        />
      </Stack>

      <AppDataTable
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        loading={iconsQuery.isLoading}
        rows={filteredItems}
      />

      <Dialog
        fullWidth
        maxWidth="lg"
        onClose={() => setIsDialogOpen(false)}
        open={isDialogOpen}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 1,
              boxShadow: '0 28px 80px rgba(0, 0, 0, 0.28)',
              overflow: 'hidden',
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            background: `linear-gradient(135deg, ${alpha(storefrontColors.navy, 0.06)} 0%, ${alpha(storefrontColors.accent, 0.08)} 100%)`,
            borderBottom: `1px solid ${alpha(storefrontColors.navy, 0.08)}`,
            px: { sm: 4, xs: 2.25 },
            py: 2.5,
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                alignItems: 'center',
                backgroundColor: alpha(form.color, 0.12),
                border: `1px solid ${alpha(form.color, 0.18)}`,
                borderRadius: 1,
                color: form.color,
                display: 'flex',
                fontSize: '1.35rem',
                height: 44,
                justifyContent: 'center',
                width: 44,
              }}
            >
              {form.icon}
            </Box>
            <Box>
              <Typography sx={{ fontSize: '1.35rem', fontWeight: 900, lineHeight: 1.15 }}>
                {editingId ? `Edit ${itemLabel}` : `Create ${itemLabel}`}
              </Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem', mt: 0.35 }}>
                Configure this item for storefront containers.
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: '#fbfaf8', p: { sm: 4, xs: 2.25 } }}>
          <Grid container spacing={3}>
            <Grid size={{ md: 4.2, xs: 12 }}>
              <Stack
                spacing={2}
                sx={{
                  backgroundColor: '#ffffff',
                  border: `1px solid ${alpha(storefrontColors.navy, 0.08)}`,
                  borderRadius: 1,
                  boxShadow: `0 16px 40px ${alpha(storefrontColors.navy, 0.08)}`,
                  p: 2.25,
                }}
              >
                <Stack spacing={0.35}>
                  <Typography sx={{ fontWeight: 900 }}>Live preview</Typography>
                  <Typography color="text.secondary" variant="body2">
                    This mirrors the storefront card treatment.
                  </Typography>
                </Stack>
                <IconPreview item={previewItem} />
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                  <Chip
                    color={form.status === 'active' ? 'success' : 'default'}
                    label={form.status}
                    size="small"
                  />
                </Stack>
              </Stack>
            </Grid>
            <Grid size={{ md: 7.8, xs: 12 }}>
              <Stack
                spacing={2.25}
                sx={{
                  backgroundColor: '#ffffff',
                  border: `1px solid ${alpha(storefrontColors.navy, 0.08)}`,
                  borderRadius: 1,
                  p: 2.25,
                }}
              >
                <Stack spacing={0.35}>
                  <Typography sx={{ fontWeight: 900 }}>Icon details</Typography>
                  <Typography color="text.secondary" variant="body2">
                    Keep labels short so cards remain compact on mobile.
                  </Typography>
                </Stack>
                <Divider />
                <Grid container spacing={2}>
                  <Grid size={{ sm: 8, xs: 12 }}>
                    <TextField
                      autoFocus
                      fullWidth
                      label={itemLabel === 'icon' ? 'Name' : 'Label'}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, label: event.target.value }))
                      }
                      sx={fieldSx}
                      value={form.label}
                    />
                  </Grid>
                  <Grid size={{ sm: 4, xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Icon"
                      onChange={(event) =>
                        setForm((current) => ({ ...current, icon: event.target.value }))
                      }
                      select
                      slotProps={{
                        select: {
                          MenuProps: {
                            slotProps: {
                              paper: {
                                sx: { borderRadius: 1, maxHeight: 460 },
                              },
                            },
                          },
                          renderValue: (selected) => (
                            <Typography sx={{ fontSize: '1.25rem', lineHeight: 1 }}>
                              {selected as string}
                            </Typography>
                          ),
                        },
                      }}
                      sx={fieldSx}
                      value={form.icon}
                    >
                      <ListSubheader
                        disableSticky={false}
                        sx={{
                          backgroundColor: '#ffffff',
                          borderBottom: `1px solid ${alpha(storefrontColors.navy, 0.08)}`,
                          lineHeight: 'normal',
                          p: 1.25,
                          position: 'sticky',
                          top: 0,
                          zIndex: 2,
                        }}
                      >
                        <TextField
                          autoFocus
                          fullWidth
                          onChange={(event) => setIconSearch(event.target.value)}
                          onClick={(event) => event.stopPropagation()}
                          onKeyDown={(event) => event.stopPropagation()}
                          placeholder="Search icons"
                          size="small"
                          slotProps={{
                            input: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <SearchRoundedIcon fontSize="small" />
                                </InputAdornment>
                              ),
                            },
                          }}
                          value={iconSearch}
                        />
                      </ListSubheader>
                      {filteredIconGroups.length === 0 ? (
                        <MenuItem disabled value="">
                          No icons found
                        </MenuItem>
                      ) : null}
                      {filteredIconGroups.flatMap((group) => [
                        <ListSubheader
                          disableSticky
                          key={group.label}
                          sx={{
                            backgroundColor: '#ffffff',
                            color: storefrontColors.navy,
                            fontSize: '0.72rem',
                            fontWeight: 900,
                            letterSpacing: '0.08em',
                            lineHeight: '34px',
                            textTransform: 'uppercase',
                          }}
                        >
                          {group.label}
                        </ListSubheader>,
                        ...group.options.map((option) => (
                          <MenuItem key={`${option.label}-${option.value}`} value={option.value}>
                            <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
                              <Typography
                                sx={{
                                  alignItems: 'center',
                                  backgroundColor: alpha(storefrontColors.navy, 0.05),
                                  borderRadius: 1,
                                  display: 'flex',
                                  fontSize: '1.25rem',
                                  height: 32,
                                  justifyContent: 'center',
                                  lineHeight: 1,
                                  width: 32,
                                }}
                              >
                                {option.value}
                              </Typography>
                              <Typography>{option.label}</Typography>
                            </Stack>
                          </MenuItem>
                        )),
                      ])}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Status"
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          status: event.target.value as StorefrontHighlightItem['status'],
                        }))
                      }
                      select
                      sx={fieldSx}
                      value={form.status}
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="hidden">Hidden</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid size={{ sm: 6, xs: 12 }}>
                    <ColorPickerField
                      label="Icon color"
                      onChange={(color) => setForm((current) => ({ ...current, color }))}
                      value={form.color}
                    />
                  </Grid>
                  <Grid size={{ sm: 6, xs: 12 }}>
                    <ColorPickerField
                      label="Text color"
                      onChange={(textColor) => setForm((current) => ({ ...current, textColor }))}
                      value={form.textColor || '#171717'}
                    />
                  </Grid>
                </Grid>
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions
          sx={{
            backgroundColor: '#ffffff',
            borderTop: `1px solid ${alpha(storefrontColors.navy, 0.08)}`,
            gap: 1.25,
            px: { sm: 4, xs: 2.25 },
            py: 2.25,
          }}
        >
          <AppButton color="inherit" onClick={() => setIsDialogOpen(false)} variant="outlined">
            Cancel
          </AppButton>
          <AppButton
            disabled={createMutation.isPending || updateMutation.isPending}
            onClick={handleSave}
          >
            {editingId ? `Save ${itemLabel}` : `Add ${itemLabel}`}
          </AppButton>
        </DialogActions>
      </Dialog>

      <Dialog
        fullWidth
        maxWidth="xs"
        onClose={() => setDeleteTarget(null)}
        open={Boolean(deleteTarget)}
      >
        <DialogTitle>Delete {itemLabel}?</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">Delete {deleteTarget?.label}?</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <AppButton color="inherit" onClick={() => setDeleteTarget(null)} variant="outlined">
            Cancel
          </AppButton>
          <AppButton
            color="error"
            onClick={() => {
              if (!deleteTarget) {
                return;
              }

              deleteMutation.mutate(deleteTarget.id);
            }}
            disabled={deleteMutation.isPending}
          >
            Delete
          </AppButton>
        </DialogActions>
      </Dialog>
    </PageSection>
  );
};
