import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
  Box,
  Alert,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { GridActionsCellItem, type GridColDef } from '@mui/x-data-grid';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import { adminApi } from '@features/admin/api/adminApi';
import type { AdminProduct } from '@features/admin/types/admin.types';
import { useDebounce } from '@hooks/useDebounce';
import { toApiError } from '@shared/api/apiError';
import { AppButton } from '@shared/components/ui/Button/AppButton';
import { AppDataTable } from '@shared/components/ui/DataTable/DataTable';
import { PageSection } from '@shared/components/ui/SectionTitle/PageSection';
import { formatCurrency } from '@utils/formatCurrency';

type ProductForm = {
  categoryId: string;
  inventory: string;
  name: string;
  price: string;
  sku: string;
};

const emptyForm: ProductForm = {
  categoryId: 'fruits',
  inventory: '25',
  name: '',
  price: '9.99',
  sku: '',
};

const toForm = (product: AdminProduct): ProductForm => ({
  categoryId: product.categoryId ?? '',
  inventory: String(product.stock),
  name: product.name,
  price: String(product.price),
  sku: product.sku,
});

const stockFilterOptions = [
  { label: 'All stock', value: 'all' },
  { label: 'In stock', value: 'in-stock' },
  { label: 'Low stock', value: 'low-stock' },
  { label: 'Out of stock', value: 'out-of-stock' },
] as const;

const ratingFilterOptions = [
  { label: 'All ratings', value: 'all' },
  { label: '4.8 and above', value: '4.8' },
  { label: '4.5 and above', value: '4.5' },
  { label: 'Below 4.5', value: 'below-4.5' },
] as const;

type StockFilter = (typeof stockFilterOptions)[number]['value'];
type RatingFilter = (typeof ratingFilterOptions)[number]['value'];

export const ProductsPage = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [bulkUploadFileName, setBulkUploadFileName] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null);
  const [detailProduct, setDetailProduct] = useState<AdminProduct | null>(null);
  const [isBulkUploadDialogOpen, setIsBulkUploadDialogOpen] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all');
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const debouncedSearch = useDebounce(search);
  const categoriesQuery = useQuery({
    queryFn: ({ signal }) => adminApi.listCategories({}, { signal }),
    queryKey: ['admin', 'categories', 'options'],
  });
  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);
  const productsQuery = useQuery({
    queryFn: ({ signal }) =>
      adminApi.listProducts(
        {
          category:
            categoryFilter === 'all'
              ? undefined
              : categories.find((category) => category.id === categoryFilter)?.name,
          rating: ratingFilter === 'all' || ratingFilter === 'below-4.5' ? undefined : ratingFilter,
          search: debouncedSearch,
          stock: stockFilter === 'low-stock' ? 'low' : undefined,
        },
        { signal },
      ),
    queryKey: ['admin', 'products', debouncedSearch, categoryFilter, stockFilter, ratingFilter],
  });
  const products = useMemo(() => productsQuery.data ?? [], [productsQuery.data]);

  const categoryById = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories],
  );

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const normalizedSearch = search.trim().toLowerCase();
        const matchesSearch = normalizedSearch
          ? [product.name, product.sku, product.description, ...product.tags]
              .join(' ')
              .toLowerCase()
              .includes(normalizedSearch)
          : true;
        const matchesCategory = categoryFilter === 'all' || product.categoryId === categoryFilter;
        const matchesStock =
          stockFilter === 'all' ||
          (stockFilter === 'in-stock' && product.stock > 20) ||
          (stockFilter === 'low-stock' && product.stock > 0 && product.stock <= 40) ||
          (stockFilter === 'out-of-stock' && product.stock === 0);
        const matchesRating =
          ratingFilter === 'all' ||
          (ratingFilter === '4.8' && product.rating >= 4.8) ||
          (ratingFilter === '4.5' && product.rating >= 4.5) ||
          (ratingFilter === 'below-4.5' && product.rating < 4.5);

        return matchesSearch && matchesCategory && matchesStock && matchesRating;
      }),
    [categoryFilter, products, ratingFilter, search, stockFilter],
  );

  const columns: GridColDef<AdminProduct>[] = [
    { field: 'sku', headerName: 'SKU', width: 140 },
    { field: 'name', flex: 1, headerName: 'Product', minWidth: 220 },
    {
      field: 'categoryId',
      headerName: 'Category',
      valueGetter: (value: string) => categoryById.get(value) ?? 'Unassigned',
      width: 160,
    },
    {
      field: 'price',
      headerName: 'Price',
      valueFormatter: (value: number) => formatCurrency(value),
      width: 120,
    },
    { field: 'stock', headerName: 'Stock', type: 'number', width: 100 },
    {
      field: 'rating',
      headerName: 'Rating',
      width: 100,
    },
    {
      field: 'actions',
      getActions: ({ row }) => [
        <GridActionsCellItem
          icon={<VisibilityOutlinedIcon />}
          key="view"
          label="View details"
          onClick={() => setDetailProduct(row)}
        />,
        <GridActionsCellItem
          icon={<EditRoundedIcon />}
          key="edit"
          label="Edit"
          onClick={() => {
            setEditingId(row.id);
            setForm(toForm(row));
            setIsProductDialogOpen(true);
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
      width: 132,
    },
  ];

  const saveMutation = useMutation({
    mutationFn: async () => {
      const category = categories.find((item) => item.id === form.categoryId);
      const name = form.name.trim();
      const sku = form.sku.trim();
      const price = Number(form.price);
      const stock = Number(form.inventory);

      if (
        !name ||
        !sku ||
        !Number.isFinite(price) ||
        price < 0 ||
        !Number.isInteger(stock) ||
        stock < 0
      ) {
        throw new Error('Enter a product name, SKU, and valid non-negative price and stock.');
      }

      const existing = products.find((product) => product.id === editingId);
      const payload = {
        categoryId: form.categoryId || undefined,
        categoryName: category?.name,
        currency: existing?.currency ?? 'USD',
        description: existing?.description ?? `${name} managed from the admin dashboard.`,
        name,
        price,
        rating: existing?.rating ?? 0,
        sku,
        status: existing?.status ?? ('active' as const),
        stock,
        tags: existing?.tags ?? [],
      };

      return editingId
        ? adminApi.updateProduct(editingId, payload)
        : adminApi.createProduct(payload);
    },
    onError: (error) => toast.error(toApiError(error).message),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast.success(result.message);
      setEditingId(null);
      setForm(emptyForm);
      setIsProductDialogOpen(false);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteProduct,
    onError: (error) => toast.error(toApiError(error).message),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast.success(result.message);
      setDeleteTarget(null);
    },
  });

  const handleConfirmDelete = () => {
    if (!deleteTarget) {
      return;
    }

    deleteMutation.mutate(deleteTarget.id);
  };

  return (
    <PageSection
      action={
        <Stack direction={{ sm: 'row', xs: 'column' }} spacing={1.25}>
          <AppButton disabled startIcon={<CloudUploadOutlinedIcon />} variant="outlined">
            Bulk upload
          </AppButton>
          <AppButton
            onClick={() => {
              setEditingId(null);
              setForm(emptyForm);
              setIsProductDialogOpen(true);
            }}
            startIcon={<AddRoundedIcon />}
          >
            New product
          </AppButton>
        </Stack>
      }
      description="Create, edit, and remove catalog items for the tenant storefront."
      title="Products"
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
          label="Search products"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Name, SKU, description, or tag"
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
          label="Category"
          onChange={(event) => setCategoryFilter(event.target.value)}
          select
          sx={{ minWidth: { lg: 180 } }}
          value={categoryFilter}
        >
          <MenuItem value="all">All categories</MenuItem>
          {categories.map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {category.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Stock"
          onChange={(event) => setStockFilter(event.target.value as StockFilter)}
          select
          sx={{ minWidth: { lg: 150 } }}
          value={stockFilter}
        >
          {stockFilterOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Rating"
          onChange={(event) => setRatingFilter(event.target.value as RatingFilter)}
          select
          sx={{ minWidth: { lg: 170 } }}
          value={ratingFilter}
        >
          {ratingFilterOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <Stack sx={{ ml: { lg: 'auto' } }}>
          <Typography color="text.secondary" variant="body2">
            Showing {filteredProducts.length} of {products.length}
          </Typography>
        </Stack>
      </Stack>

      {productsQuery.isError ? (
        <Alert severity="error">{toApiError(productsQuery.error).message}</Alert>
      ) : null}
      <AppDataTable
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        rows={filteredProducts}
        loading={productsQuery.isLoading}
      />

      <Dialog
        fullWidth
        maxWidth="sm"
        onClose={() => setIsBulkUploadDialogOpen(false)}
        open={isBulkUploadDialogOpen}
      >
        <DialogTitle>Bulk Upload Products</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <Box
              component="label"
              sx={{
                alignItems: 'center',
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                justifyContent: 'center',
                minHeight: 160,
                p: 3,
                textAlign: 'center',
              }}
            >
              <CloudUploadOutlinedIcon color="primary" fontSize="large" />
              <Typography sx={{ fontWeight: 700 }}>Choose Excel or CSV file</Typography>
              <Typography color="text.secondary" variant="body2">
                Accepted columns: SKU, Product name, Category, Price, Stock, Rating.
              </Typography>
              <input
                accept=".xlsx,.xls,.csv"
                hidden
                onChange={(event) => setBulkUploadFileName(event.target.files?.[0]?.name ?? '')}
                type="file"
              />
            </Box>
            {bulkUploadFileName ? (
              <Chip
                color="primary"
                label={bulkUploadFileName}
                sx={{ alignSelf: 'flex-start' }}
                variant="outlined"
              />
            ) : null}
            <Typography color="text.secondary" variant="body2">
              This screen prepares the upload workflow. Connect the selected file to the product
              import API when the backend endpoint is available.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <AppButton
            color="inherit"
            onClick={() => setIsBulkUploadDialogOpen(false)}
            variant="outlined"
          >
            Cancel
          </AppButton>
          <AppButton
            disabled={!bulkUploadFileName}
            onClick={() => setIsBulkUploadDialogOpen(false)}
          >
            Upload products
          </AppButton>
        </DialogActions>
      </Dialog>

      <Dialog
        fullWidth
        maxWidth="sm"
        onClose={() => setIsProductDialogOpen(false)}
        open={isProductDialogOpen}
      >
        <DialogTitle>{editingId ? 'Edit Product' : 'Create Product'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.25} sx={{ pt: 1 }}>
            <TextField
              autoFocus
              label="Product name"
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              value={form.name}
            />
            <TextField
              label="SKU"
              onChange={(event) => setForm((current) => ({ ...current, sku: event.target.value }))}
              value={form.sku}
            />
            <TextField
              label="Category"
              onChange={(event) =>
                setForm((current) => ({ ...current, categoryId: event.target.value }))
              }
              select
              value={form.categoryId}
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>
            <Grid container spacing={2}>
              <Grid size={{ sm: 6, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Price"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, price: event.target.value }))
                  }
                  type="number"
                  value={form.price}
                />
              </Grid>
              <Grid size={{ sm: 6, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Stock"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, inventory: event.target.value }))
                  }
                  type="number"
                  value={form.inventory}
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <AppButton
            color="inherit"
            onClick={() => setIsProductDialogOpen(false)}
            variant="outlined"
          >
            Cancel
          </AppButton>
          <AppButton disabled={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
            {editingId ? 'Save changes' : 'Add product'}
          </AppButton>
        </DialogActions>
      </Dialog>

      <Dialog
        fullWidth
        maxWidth="sm"
        onClose={() => setDetailProduct(null)}
        open={Boolean(detailProduct)}
      >
        <DialogTitle>Product Details</DialogTitle>
        <DialogContent>
          {detailProduct ? (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Stack
                direction="row"
                sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
              >
                <Stack spacing={0.5}>
                  <Typography variant="h6">{detailProduct.name}</Typography>
                  <Typography color="text.secondary" variant="body2">
                    {detailProduct.sku}
                  </Typography>
                </Stack>
                <Chip
                  label={
                    (detailProduct.categoryId && categoryById.get(detailProduct.categoryId)) ??
                    'Unassigned'
                  }
                />
              </Stack>
              <Typography color="text.secondary">{detailProduct.description}</Typography>
              <Divider />
              <Grid container spacing={2}>
                <Grid size={{ sm: 6, xs: 12 }}>
                  <Typography color="text.secondary" variant="caption">
                    Price
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>
                    {formatCurrency(detailProduct.price)}
                  </Typography>
                </Grid>
                <Grid size={{ sm: 6, xs: 12 }}>
                  <Typography color="text.secondary" variant="caption">
                    Stock
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>{detailProduct.stock}</Typography>
                </Grid>
                <Grid size={{ sm: 6, xs: 12 }}>
                  <Typography color="text.secondary" variant="caption">
                    Rating
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>{detailProduct.rating}</Typography>
                </Grid>
                <Grid size={{ sm: 6, xs: 12 }}>
                  <Typography color="text.secondary" variant="caption">
                    Slug
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>{detailProduct.status}</Typography>
                </Grid>
              </Grid>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                {detailProduct.tags.map((tag) => (
                  <Chip key={tag} label={tag} size="small" variant="outlined" />
                ))}
              </Stack>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <AppButton onClick={() => setDetailProduct(null)}>Close</AppButton>
        </DialogActions>
      </Dialog>

      <Dialog
        fullWidth
        maxWidth="xs"
        onClose={() => setDeleteTarget(null)}
        open={Boolean(deleteTarget)}
      >
        <DialogTitle>Delete Product?</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            Are you sure you want to delete {deleteTarget?.name}? This action removes it from the
            current product list.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <AppButton color="inherit" onClick={() => setDeleteTarget(null)} variant="outlined">
            Cancel
          </AppButton>
          <AppButton
            color="error"
            disabled={deleteMutation.isPending}
            onClick={handleConfirmDelete}
          >
            Delete
          </AppButton>
        </DialogActions>
      </Dialog>
    </PageSection>
  );
};
