import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, Stack, TextField } from '@mui/material';
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
  categoryId: 'cat-1',
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

export const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);

  const categoryById = useMemo(
    () => new Map(mockCategories.map((category) => [category.id, category.name])),
    [],
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
          onClick={() => {
            setProducts((current) => current.filter((product) => product.id !== row.id));
            if (editingId === row.id) {
              setEditingId(null);
              setForm(emptyForm);
              setIsProductDialogOpen(false);
            }
          }}
        />,
      ],
      type: 'actions',
      width: 100,
    },
  ];

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
      }
      description="Create, edit, and remove demo catalog items for the tenant storefront."
      title="Products"
    >
      <AppDataTable
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        rows={products}
      />

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
    </PageSection>
  );
};
