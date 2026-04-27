import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
  Box,
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
import { useMemo, useState } from 'react';

import type { Product } from '@entities/product/types/product.types';
import { AppButton } from '@shared/components/ui/Button/AppButton';
import { AppDataTable } from '@shared/components/ui/DataTable/DataTable';
import { PageSection } from '@shared/components/ui/SectionTitle/PageSection';
import { mockCategories, mockProducts } from '@shared/lib/mockData';
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

const toForm = (product: Product): ProductForm => ({
  categoryId: product.categoryId,
  inventory: String(product.inventory),
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
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [bulkUploadFileName, setBulkUploadFileName] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [isBulkUploadDialogOpen, setIsBulkUploadDialogOpen] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all');
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');

  const categoryById = useMemo(
    () => new Map(mockCategories.map((category) => [category.id, category.name])),
    [],
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
          (stockFilter === 'in-stock' && product.inventory > 20) ||
          (stockFilter === 'low-stock' && product.inventory > 0 && product.inventory <= 20) ||
          (stockFilter === 'out-of-stock' && product.inventory === 0);
        const matchesRating =
          ratingFilter === 'all' ||
          (ratingFilter === '4.8' && product.rating >= 4.8) ||
          (ratingFilter === '4.5' && product.rating >= 4.5) ||
          (ratingFilter === 'below-4.5' && product.rating < 4.5);

        return matchesSearch && matchesCategory && matchesStock && matchesRating;
      }),
    [categoryFilter, products, ratingFilter, search, stockFilter],
  );

  const columns: GridColDef<Product>[] = [
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
    { field: 'inventory', headerName: 'Stock', type: 'number', width: 100 },
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

  const handleConfirmDelete = () => {
    if (!deleteTarget) {
      return;
    }

    setProducts((current) => current.filter((product) => product.id !== deleteTarget.id));
    if (editingId === deleteTarget.id) {
      setEditingId(null);
      setForm(emptyForm);
      setIsProductDialogOpen(false);
    }
    setDeleteTarget(null);
  };

  const handleSubmit = () => {
    const name = form.name.trim();
    const sku = form.sku.trim();

    if (!name || !sku) {
      return;
    }

    const productPayload: Product = {
      categoryId: form.categoryId,
      currency: 'USD',
      description: `${name} managed from the demo admin dashboard.`,
      id: editingId ?? `prd-${Date.now()}`,
      imageUrl: '',
      inventory: Number(form.inventory) || 0,
      name,
      price: Number(form.price) || 0,
      rating: editingId ? products.find((product) => product.id === editingId)?.rating ?? 4.5 : 4.5,
      sku,
      slug: name.toLowerCase().replaceAll(' ', '-'),
      tags: ['admin-managed'],
      tenantId: 'tenant-demo',
    };

    setProducts((current) =>
      editingId
        ? current.map((product) => (product.id === editingId ? productPayload : product))
        : [productPayload, ...current],
    );
    setEditingId(null);
    setForm(emptyForm);
    setIsProductDialogOpen(false);
  };

  return (
    <PageSection
      action={
        <Stack direction={{ sm: 'row', xs: 'column' }} spacing={1.25}>
          <AppButton
            onClick={() => setIsBulkUploadDialogOpen(true)}
            startIcon={<CloudUploadOutlinedIcon />}
            variant="outlined"
          >
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
      description="Create, edit, and remove demo catalog items for the tenant storefront."
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
          {mockCategories.map((category) => (
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

      <AppDataTable
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        rows={filteredProducts}
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
              <Chip color="primary" label={bulkUploadFileName} sx={{ alignSelf: 'flex-start' }} variant="outlined" />
            ) : null}
            <Typography color="text.secondary" variant="body2">
              This screen prepares the upload workflow. Connect the selected file to the product import API when the
              backend endpoint is available.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <AppButton color="inherit" onClick={() => setIsBulkUploadDialogOpen(false)} variant="outlined">
            Cancel
          </AppButton>
          <AppButton disabled={!bulkUploadFileName} onClick={() => setIsBulkUploadDialogOpen(false)}>
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
              onChange={(event) => setForm((current) => ({ ...current, categoryId: event.target.value }))}
              select
              value={form.categoryId}
            >
              {mockCategories.map((category) => (
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
                  onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                  type="number"
                  value={form.price}
                />
              </Grid>
              <Grid size={{ sm: 6, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Stock"
                  onChange={(event) => setForm((current) => ({ ...current, inventory: event.target.value }))}
                  type="number"
                  value={form.inventory}
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <AppButton color="inherit" onClick={() => setIsProductDialogOpen(false)} variant="outlined">
            Cancel
          </AppButton>
          <AppButton onClick={handleSubmit}>{editingId ? 'Save changes' : 'Add product'}</AppButton>
        </DialogActions>
      </Dialog>

      <Dialog fullWidth maxWidth="sm" onClose={() => setDetailProduct(null)} open={Boolean(detailProduct)}>
        <DialogTitle>Product Details</DialogTitle>
        <DialogContent>
          {detailProduct ? (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Stack spacing={0.5}>
                  <Typography variant="h6">{detailProduct.name}</Typography>
                  <Typography color="text.secondary" variant="body2">
                    {detailProduct.sku}
                  </Typography>
                </Stack>
                <Chip label={categoryById.get(detailProduct.categoryId) ?? 'Unassigned'} />
              </Stack>
              <Typography color="text.secondary">{detailProduct.description}</Typography>
              <Divider />
              <Grid container spacing={2}>
                <Grid size={{ sm: 6, xs: 12 }}>
                  <Typography color="text.secondary" variant="caption">
                    Price
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>{formatCurrency(detailProduct.price)}</Typography>
                </Grid>
                <Grid size={{ sm: 6, xs: 12 }}>
                  <Typography color="text.secondary" variant="caption">
                    Stock
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>{detailProduct.inventory}</Typography>
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
                  <Typography sx={{ fontWeight: 700 }}>{detailProduct.slug}</Typography>
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

      <Dialog fullWidth maxWidth="xs" onClose={() => setDeleteTarget(null)} open={Boolean(deleteTarget)}>
        <DialogTitle>Delete Product?</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            Are you sure you want to delete {deleteTarget?.name}? This action removes it from the current product list.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <AppButton color="inherit" onClick={() => setDeleteTarget(null)} variant="outlined">
            Cancel
          </AppButton>
          <AppButton color="error" onClick={handleConfirmDelete}>
            Delete
          </AppButton>
        </DialogActions>
      </Dialog>
    </PageSection>
  );
};
