import { PersistentDialog as Dialog } from '@shared/components/ui/Dialog/AppDialog';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
  Avatar,
  Box,
  Checkbox,
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
import { GridActionsCellItem, type GridColDef } from '@mui/x-data-grid';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import { adminApi } from '@features/admin/api/adminApi';
import type { AdminProduct } from '@features/admin/types/admin.types';
import { merchandisingApi } from '@features/home/api/merchandisingApi';
import { storefrontProductSections } from '@features/home/data/homePage.data';
import type {
  StoreProduct,
  StorefrontProductSectionAssignment,
  StorefrontProductSectionId,
} from '@features/home/types/home.types';
import { toApiError } from '@shared/api/apiError';
import { AppButton } from '@shared/components/ui/Button/AppButton';
import { AppDataTable } from '@shared/components/ui/DataTable/DataTable';
import { PageSection } from '@shared/components/ui/SectionTitle/PageSection';
import { formatCurrency } from '@utils/formatCurrency';

type AssignmentRow = StorefrontProductSectionAssignment & {
  product?: StoreProduct;
};

type AssignmentForm = {
  productIds: string[];
  sectionId: StorefrontProductSectionId;
  sortOrder: number;
  status: 'active' | 'hidden';
};

const emptyForm: AssignmentForm = {
  productIds: [],
  sectionId: 'top-offers',
  sortOrder: 1,
  status: 'active',
};

type ProductSectionsPageProps = {
  description?: string;
  sectionFilter?: 'all' | StorefrontProductSectionId;
  title?: string;
};

const toStoreProductOption = (product: AdminProduct): StoreProduct => ({
  badges: [],
  categoryId: product.categoryId ?? product.categoryName ?? 'all',
  currency: product.currency,
  description: product.description,
  id: product.id,
  imageUrl: product.imageUrl ?? '',
  inventory: product.stock,
  name: product.name,
  origin: product.categoryName ?? product.subcategory ?? '',
  price: product.price,
  rating: product.rating,
  sku: product.sku,
  slug: product.sku.toLowerCase(),
  tags: product.tags ?? [],
  tenantId: '',
  unit: product.subcategory ?? 'item',
});

const getAssignmentId = (
  sectionId: StorefrontProductSectionId,
  product: StoreProduct & Record<string, unknown>,
) => String(product.assignmentId ?? product.sectionAssignmentId ?? `${sectionId}-${product.id}`);

export const ProductSectionsPage = ({
  description = 'Choose existing products for each homepage product section. This page only assigns catalog items; product creation stays in Products.',
  sectionFilter: initialSectionFilter = 'all',
  title = 'Product Sections',
}: ProductSectionsPageProps) => {
  const queryClient = useQueryClient();
  const emptySectionForm = useMemo(
    () => ({
      ...emptyForm,
      sectionId: initialSectionFilter === 'all' ? emptyForm.sectionId : initialSectionFilter,
    }),
    [initialSectionFilter],
  );
  const [deleteTarget, setDeleteTarget] = useState<AssignmentRow | null>(null);
  const [form, setForm] = useState<AssignmentForm>(emptySectionForm);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const [productPickerSearch, setProductPickerSearch] = useState('');
  const [search, setSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState<'all' | StorefrontProductSectionId>(
    initialSectionFilter,
  );

  const sectionsQuery = useQuery({
    queryFn: ({ signal }) => merchandisingApi.listAdminProductSections({ signal }),
    queryKey: ['admin', 'product-sections'],
  });
  const productsQuery = useQuery({
    queryFn: ({ signal }) => adminApi.listProducts({}, { signal }),
    queryKey: ['admin', 'products', 'product-section-picker'],
  });

  const sectionDefinitions = useMemo(
    () =>
      sectionsQuery.data?.sections.length
        ? sectionsQuery.data.sections
        : storefrontProductSections.map((section) => ({ ...section, products: [] })),
    [sectionsQuery.data],
  );
  const productOptions = useMemo(
    () => (productsQuery.data ?? []).map(toStoreProductOption),
    [productsQuery.data],
  );
  const sectionLabel = useCallback(
    (sectionId: StorefrontProductSectionId) =>
      sectionDefinitions.find((section) => section.id === sectionId)?.title ?? sectionId,
    [sectionDefinitions],
  );

  const rows = useMemo<AssignmentRow[]>(
    () =>
      sectionDefinitions.flatMap((section) =>
        section.products.map((product, index) => ({
          id: getAssignmentId(section.id, product),
          product,
          productId: product.id,
          sectionId: section.id,
          sortOrder: product.sortOrder ?? index + 1,
          status: product.status ?? 'active',
        })),
      ),
    [sectionDefinitions],
  );

  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return rows
      .filter((row) => sectionFilter === 'all' || row.sectionId === sectionFilter)
      .filter((row) => {
        if (!normalizedSearch) {
          return true;
        }

        return [
          row.product?.name ?? '',
          row.product?.sku ?? '',
          row.product?.categoryId ?? '',
          row.product?.origin ?? '',
          sectionLabel(row.sectionId),
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch);
      })
      .sort(
        (first, second) =>
          first.sectionId.localeCompare(second.sectionId) || first.sortOrder - second.sortOrder,
      );
  }, [rows, search, sectionFilter, sectionLabel]);

  const assignedProductIds = new Set(
    rows
      .filter((assignment) => assignment.sectionId === form.sectionId)
      .map((assignment) => assignment.productId),
  );
  const availableProducts = productOptions.filter(
    (product) => form.productIds.includes(product.id) || !assignedProductIds.has(product.id),
  );
  const filteredAvailableProducts = availableProducts.filter((product) =>
    [product.name, product.sku, product.categoryId, product.origin]
      .join(' ')
      .toLowerCase()
      .includes(productPickerSearch.trim().toLowerCase()),
  );

  const assignMutation = useMutation({
    mutationFn: async (payload: AssignmentForm) => {
      const startSortOrder = Number(payload.sortOrder) || 1;

      return Promise.all(
        payload.productIds.map((productId, index) =>
          merchandisingApi.assignProductToSection({
            productId,
            sectionId: payload.sectionId,
            sortOrder: startSortOrder + index,
            status: payload.status,
          }),
        ),
      );
    },
    onError: (error) => toast.error(toApiError(error).message),
    onSuccess: async (results) => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'product-sections'] });
      await queryClient.invalidateQueries({ queryKey: ['storefront', 'product-sections'] });
      setForm(emptySectionForm);
      setProductPickerSearch('');
      setIsDialogOpen(false);
      toast.success(
        results.length === 1
          ? (results[0]?.message ?? 'Product assigned')
          : `${results.length} products assigned`,
      );
    },
  });
  const deleteMutation = useMutation({
    mutationFn: merchandisingApi.deleteProductSectionAssignment,
    onError: (error) => toast.error(toApiError(error).message),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'product-sections'] });
      await queryClient.invalidateQueries({ queryKey: ['storefront', 'product-sections'] });
      setDeleteTarget(null);
      toast.success(result.message);
    },
  });

  const columns: GridColDef<AssignmentRow>[] = [
    {
      field: 'productId',
      flex: 1,
      headerName: 'Product',
      minWidth: 280,
      renderCell: (params) => (
        <Box
          sx={{
            alignItems: 'center',
            columnGap: 1.5,
            display: 'grid',
            gridTemplateColumns: '48px minmax(0, 1fr)',
            height: '100%',
            minWidth: 0,
            width: '100%',
          }}
        >
          <Avatar
            alt={params.row.product?.name}
            src={params.row.product?.imageUrl}
            sx={{ borderRadius: 1, height: 40, width: 40 }}
            variant="rounded"
          />
          <Stack spacing={0.5} sx={{ justifyContent: 'center', minWidth: 0 }}>
            <Typography
              noWrap
              sx={{ display: 'block', fontWeight: 800, lineHeight: 1.25 }}
              variant="body2"
            >
              {params.row.product?.name ?? 'Missing product'}
            </Typography>
            <Typography
              color="text.secondary"
              noWrap
              sx={{ display: 'block', lineHeight: 1.35 }}
              variant="caption"
            >
              {params.row.product?.sku}
            </Typography>
          </Stack>
        </Box>
      ),
    },
    {
      field: 'sectionId',
      headerName: 'Section',
      renderCell: (params) => sectionLabel(params.row.sectionId),
      width: 180,
    },
    { field: 'sortOrder', headerName: 'Order', type: 'number', width: 90 },
    {
      field: 'price',
      headerName: 'Price',
      valueGetter: (_value, row) =>
        row.product ? formatCurrency(row.product.price, row.product.currency) : '',
      width: 120,
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
      field: 'actions',
      getActions: ({ row }) => [
        <GridActionsCellItem
          icon={<DeleteOutlineRoundedIcon />}
          key="remove"
          label="Remove from section"
          onClick={() => setDeleteTarget(row)}
        />,
      ],
      type: 'actions',
      width: 90,
    },
  ];

  const handleAssign = () => {
    if (!form.productIds.length) {
      toast.error('Select at least one existing product.');
      return;
    }

    const duplicate = form.productIds.find((productId) =>
      rows.some(
        (assignment) =>
          assignment.sectionId === form.sectionId &&
          assignment.productId === productId &&
          assignment.status === 'active',
      ),
    );

    if (duplicate && form.status === 'active') {
      toast.error('One or more selected products are already active in that section.');
      return;
    }

    assignMutation.mutate(form);
  };

  return (
    <PageSection
      action={
        <AppButton
          onClick={() => {
            const nextSectionAssignments = rows.filter(
              (assignment) => assignment.sectionId === form.sectionId,
            );
            setForm({
              ...emptySectionForm,
              sortOrder: nextSectionAssignments.length + 1,
            });
            setIsProductPickerOpen(false);
            setProductPickerSearch('');
            setIsDialogOpen(true);
          }}
          startIcon={<AddRoundedIcon />}
          sx={{ minWidth: { sm: 176, xs: '100%' } }}
        >
          Assign product
        </AppButton>
      }
      description={description}
      title={title}
    >
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {sectionDefinitions.map((section) => {
          const count = rows.filter(
            (assignment) => assignment.sectionId === section.id && assignment.status === 'active',
          ).length;

          return (
            <Grid key={section.id} size={{ lg: 3, sm: 6, xs: 12 }}>
              <Box
                sx={{
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  height: '100%',
                  p: 2,
                }}
              >
                <Typography sx={{ fontWeight: 900 }}>{section.title}</Typography>
                <Typography color="text.secondary" sx={{ mt: 0.75 }} variant="body2">
                  {count} active products
                </Typography>
              </Box>
            </Grid>
          );
        })}
      </Grid>

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
          label="Search assignments"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Product, SKU, category, or section"
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
          label="Section"
          onChange={(event) =>
            setSectionFilter(event.target.value as 'all' | StorefrontProductSectionId)
          }
          select
          sx={{ minWidth: { lg: 240 } }}
          value={sectionFilter}
        >
          <MenuItem value="all">All sections</MenuItem>
          {sectionDefinitions.map((section) => (
            <MenuItem key={section.id} value={section.id}>
              {section.title}
            </MenuItem>
          ))}
        </TextField>
        <Typography color="text.secondary" sx={{ ml: { lg: 'auto' } }} variant="body2">
          Showing {filteredRows.length}
        </Typography>
      </Stack>

      <AppDataTable
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        loading={sectionsQuery.isLoading}
        rowHeight={76}
        rows={filteredRows}
      />

      <Dialog
        fullWidth
        maxWidth="md"
        onClose={() => {
          setIsProductPickerOpen(false);
          setProductPickerSearch('');
          setIsDialogOpen(false);
        }}
        open={isDialogOpen}
        slotProps={{
          paper: {
            sx: {
              maxHeight: 'min(820px, calc(100dvh - 48px))',
            },
          },
        }}
      >
        <DialogTitle sx={{ flex: '0 0 auto', pb: 1.5 }}>Assign Existing Product</DialogTitle>
        <DialogContent sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto' }}>
          <Stack spacing={2} sx={{ height: '100%', minHeight: 0, pt: 1 }}>
            <TextField
              label="Section"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  productIds: [],
                  sectionId: event.target.value as StorefrontProductSectionId,
                  sortOrder:
                    rows.filter((assignment) => assignment.sectionId === event.target.value)
                      .length + 1,
                }))
              }
              select
              value={form.sectionId}
            >
              {sectionDefinitions.map((section) => (
                <MenuItem key={section.id} value={section.id}>
                  {section.title}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Existing products"
              onClick={() => setIsProductPickerOpen(true)}
              onFocus={() => setIsProductPickerOpen(true)}
              placeholder="Click to search and select products"
              slotProps={{
                input: {
                  readOnly: true,
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
              value={
                form.productIds.length
                  ? `${form.productIds.length} product${form.productIds.length === 1 ? '' : 's'} selected`
                  : ''
              }
            />
            <Box sx={{ minHeight: 0, position: 'relative' }}>
              {isProductPickerOpen ? (
                <Box
                  sx={{
                    bgcolor: 'background.paper',
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    boxShadow: '0 18px 44px rgba(0, 0, 0, 0.18)',
                    left: 0,
                    overflow: 'hidden',
                    position: 'relative',
                    right: 0,
                    display: 'flex',
                    flex: '1 1 auto',
                    flexDirection: 'column',
                    minHeight: 0,
                    zIndex: 1,
                  }}
                >
                  <Box sx={{ flex: '0 0 auto', p: 1.5 }}>
                    <TextField
                      autoFocus
                      fullWidth
                      label="Search products"
                      onChange={(event) => setProductPickerSearch(event.target.value)}
                      placeholder="Product, SKU, category, or origin"
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchRoundedIcon fontSize="small" />
                            </InputAdornment>
                          ),
                        },
                      }}
                      value={productPickerSearch}
                    />
                  </Box>
                  <Box
                    sx={{
                      borderTop: 1,
                      borderColor: 'divider',
                      height: { md: 'min(42dvh, 390px)', xs: 'min(44dvh, 340px)' },
                      minHeight: 220,
                      overflowY: 'auto',
                    }}
                  >
                    {filteredAvailableProducts.length ? (
                      filteredAvailableProducts.map((product) => {
                        const checked = form.productIds.includes(product.id);

                        return (
                          <Box
                            key={product.id}
                            onClick={() =>
                              setForm((current) => ({
                                ...current,
                                productIds: checked
                                  ? current.productIds.filter(
                                      (productId) => productId !== product.id,
                                    )
                                  : [...current.productIds, product.id],
                              }))
                            }
                            sx={{
                              alignItems: 'center',
                              cursor: 'pointer',
                              display: 'grid',
                              gap: 1.25,
                              gridTemplateColumns: 'auto 40px minmax(0, 1fr)',
                              px: 1.5,
                              py: 1.1,
                              '&:hover': {
                                bgcolor: 'action.hover',
                              },
                              '& + &': {
                                borderTop: 1,
                                borderColor: 'divider',
                              },
                            }}
                          >
                            <Checkbox checked={checked} size="small" />
                            <Avatar
                              alt={product.name}
                              src={product.imageUrl}
                              sx={{ borderRadius: 1, height: 34, width: 34 }}
                              variant="rounded"
                            />
                            <Box sx={{ minWidth: 0 }}>
                              <Typography noWrap sx={{ fontWeight: 800 }}>
                                {product.name}
                              </Typography>
                              <Typography color="text.secondary" noWrap variant="caption">
                                {product.sku}
                              </Typography>
                            </Box>
                          </Box>
                        );
                      })
                    ) : (
                      <Typography color="text.secondary" sx={{ px: 2, py: 3 }} variant="body2">
                        No available products found.
                      </Typography>
                    )}
                  </Box>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      alignItems: 'center',
                      borderTop: 1,
                      borderColor: 'divider',
                      flex: '0 0 auto',
                      justifyContent: 'space-between',
                      px: 1.5,
                      py: 1,
                    }}
                  >
                    <Typography color="text.secondary" variant="body2">
                      {form.productIds.length} selected
                    </Typography>
                    <AppButton
                      onClick={() => setIsProductPickerOpen(false)}
                      size="small"
                      variant="outlined"
                    >
                      Done
                    </AppButton>
                  </Stack>
                </Box>
              ) : null}
            </Box>
            <Grid container spacing={2} sx={{ flex: '0 0 auto' }}>
              <Grid size={{ sm: 6, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Sort order"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, sortOrder: Number(event.target.value) }))
                  }
                  type="number"
                  value={form.sortOrder}
                />
              </Grid>
              <Grid size={{ sm: 6, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Status"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      status: event.target.value as AssignmentForm['status'],
                    }))
                  }
                  select
                  value={form.status}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="hidden">Hidden</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions
          sx={{
            borderTop: 1,
            borderColor: 'divider',
            flex: '0 0 auto',
            px: 3,
            py: 2,
          }}
        >
          <AppButton
            color="inherit"
            onClick={() => {
              setIsProductPickerOpen(false);
              setProductPickerSearch('');
              setIsDialogOpen(false);
            }}
            variant="outlined"
          >
            Cancel
          </AppButton>
          <AppButton disabled={assignMutation.isPending} onClick={handleAssign}>
            Assign {form.productIds.length > 1 ? 'products' : 'product'}
          </AppButton>
        </DialogActions>
      </Dialog>

      <Dialog
        fullWidth
        maxWidth="xs"
        onClose={() => setDeleteTarget(null)}
        open={Boolean(deleteTarget)}
      >
        <DialogTitle>Remove Product From Section?</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            Remove {deleteTarget?.product?.name} from{' '}
            {deleteTarget ? sectionLabel(deleteTarget.sectionId) : ''}?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <AppButton color="inherit" onClick={() => setDeleteTarget(null)} variant="outlined">
            Cancel
          </AppButton>
          <AppButton
            color="error"
            disabled={deleteMutation.isPending}
            onClick={() => {
              if (!deleteTarget) {
                return;
              }

              deleteMutation.mutate(deleteTarget.id);
            }}
          >
            Remove
          </AppButton>
        </DialogActions>
      </Dialog>
    </PageSection>
  );
};
