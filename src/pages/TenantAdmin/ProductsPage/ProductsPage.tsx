import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
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
import { alpha } from '@mui/material/styles';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

import { adminApi } from '@features/admin/api/adminApi';
import type {
  AdminCategory,
  AdminProduct,
  AdminProductBulkItem,
  AdminProductBulkPayload,
} from '@features/admin/types/admin.types';
import { useDebounce } from '@hooks/useDebounce';
import { toApiError } from '@shared/api/apiError';
import { AppButton } from '@shared/components/ui/Button/AppButton';
import { AppDataTable } from '@shared/components/ui/DataTable/DataTable';
import { PageSection } from '@shared/components/ui/SectionTitle/PageSection';
import { formatCurrency } from '@utils/formatCurrency';

type ProductForm = {
  categoryId: string;
  imageFile?: File;
  imageFileName: string;
  imagePreviewUrl: string;
  removeImage: boolean;
  inventory: string;
  name: string;
  price: string;
  sku: string;
  subcategory: string;
};

const emptyForm: ProductForm = {
  categoryId: '',
  imageFileName: '',
  imagePreviewUrl: '',
  removeImage: false,
  inventory: '25',
  name: '',
  price: '1000',
  sku: '',
  subcategory: '',
};

const toForm = (product: AdminProduct, categories: AdminCategory[]): ProductForm => ({
  categoryId:
    product.categoryId ??
    categories.find((category) => category.name === product.categoryName)?.id ??
    '',
  imageFileName: '',
  imagePreviewUrl: product.imageUrl ?? '',
  removeImage: false,
  inventory: String(product.stock),
  name: product.name,
  price: String(product.price),
  sku: product.sku,
  subcategory: product.subcategory ?? '',
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
const maxProductImageBytes = 5 * 1024 * 1024;
const requiredBulkColumns = ['SKU', 'Product name', 'Price', 'Stock'];
const optionalBulkColumns = [
  'Category',
  'Subcategory',
  'Rating',
  'Tags',
  'Description',
  'Currency',
  'Status',
  'Image URL',
];

const normalizeHeader = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

const splitCsvLine = (line: string) => {
  const values: string[] = [];
  let current = '';
  let isQuoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === '"' && nextCharacter === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (character === '"') {
      isQuoted = !isQuoted;
      continue;
    }

    if (character === ',' && !isQuoted) {
      values.push(current.trim());
      current = '';
      continue;
    }

    current += character;
  }

  values.push(current.trim());
  return values;
};

const parseTags = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map(String).map((tag) => tag.trim()).filter(Boolean);
  }

  if (typeof value !== 'string') {
    return [];
  }

  return value
    .split(/[|,]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
};

const readField = (row: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = row[key];

    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return value;
    }
  }

  return undefined;
};

const normalizeBulkRow = (row: Record<string, unknown>): AdminProductBulkItem => {
  const normalizedRow = Object.fromEntries(
    Object.entries(row).map(([key, value]) => [normalizeHeader(key), value]),
  );
  const price = Number(readField(normalizedRow, ['price', 'unitprice', 'saleprice']) ?? 0);
  const stock = Number(readField(normalizedRow, ['stock', 'inventory', 'quantity', 'qty']) ?? 0);
  const rating = Number(readField(normalizedRow, ['rating']) ?? 0);
  const status = String(readField(normalizedRow, ['status']) ?? 'active').toLowerCase();

  return {
    categoryId: String(readField(normalizedRow, ['categoryid']) ?? '') || undefined,
    categoryName:
      String(readField(normalizedRow, ['categoryname', 'category', 'department']) ?? '') ||
      undefined,
    currency: String(readField(normalizedRow, ['currency']) ?? 'MMK') || 'MMK',
    description: String(readField(normalizedRow, ['description', 'desc']) ?? ''),
    imageUrl:
      String(readField(normalizedRow, ['imageurl', 'imagelink', 'image', 'photo']) ?? '') ||
      undefined,
    name: String(readField(normalizedRow, ['name', 'productname', 'title']) ?? '').trim(),
    price: Number.isFinite(price) ? price : 0,
    rating: Number.isFinite(rating) ? rating : 0,
    sku: String(readField(normalizedRow, ['sku', 'itemcode', 'productcode']) ?? '').trim(),
    status: ['draft', 'active', 'archived'].includes(status)
      ? (status as AdminProductBulkItem['status'])
      : 'active',
    stock: Number.isFinite(stock) ? Math.trunc(stock) : 0,
    subcategory:
      String(readField(normalizedRow, ['subcategory', 'subCategory', 'subdepartment']) ?? '') ||
      undefined,
    tags: parseTags(readField(normalizedRow, ['tags', 'tag'])),
  };
};

const parseCsvProducts = (content: string): AdminProductBulkItem[] => {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const headers = splitCsvLine(lines[0] ?? '');

  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line);
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']));

    return normalizeBulkRow(row);
  });
};

const parseExcelProducts = async (file: File): Promise<AdminProductBulkItem[]> => {
  const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const firstSheet = firstSheetName ? workbook.Sheets[firstSheetName] : undefined;

  if (!firstSheet) {
    return [];
  }

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, {
    defval: '',
    raw: false,
  });

  return rows.map(normalizeBulkRow);
};

const parseBulkProductFile = async (file: File): Promise<AdminProductBulkItem[]> => {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    return parseExcelProducts(file);
  }

  if (fileName.endsWith('.csv')) {
    return parseCsvProducts(await file.text());
  }

  return [];
};

const columnText = (columns: string[]) => columns.join(', ');

const getStockChip = (stock: number) => {
  if (stock === 0) {
    return { color: 'error' as const, label: 'Out' };
  }

  if (stock <= 40) {
    return { color: 'warning' as const, label: 'Low' };
  }

  return { color: 'success' as const, label: 'In stock' };
};

const revokeImagePreview = (previewUrl: string) => {
  if (previewUrl.startsWith('blob:')) {
    URL.revokeObjectURL(previewUrl);
  }
};

export const ProductsPage = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [bulkImportMode, setBulkImportMode] = useState<AdminProductBulkPayload['mode']>('upsert');
  const [bulkProducts, setBulkProducts] = useState<AdminProductBulkItem[]>([]);
  const [bulkUploadError, setBulkUploadError] = useState('');
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
          categoryId: categoryFilter === 'all' ? undefined : categoryFilter,
          search: debouncedSearch,
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

  const resetBulkUpload = () => {
    setBulkProducts([]);
    setBulkUploadError('');
    setBulkUploadFileName('');
  };
  const categoryByIdMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );
  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === form.categoryId),
    [categories, form.categoryId],
  );
  const subcategoryOptions = useMemo(() => {
    const options = selectedCategory?.subcategories ?? [];

    return form.subcategory && !options.includes(form.subcategory)
      ? [form.subcategory, ...options]
      : options;
  }, [form.subcategory, selectedCategory?.subcategories]);

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const normalizedSearch = search.trim().toLowerCase();
        const matchesSearch = normalizedSearch
          ? [product.name, product.sku, product.description, product.subcategory, ...product.tags]
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
    {
      field: 'sku',
      headerName: 'SKU',
      renderCell: ({ value }) => (
        <Chip
          label={value}
          size="small"
          sx={{
            bgcolor: (theme) => alpha(theme.palette.text.primary, 0.06),
            fontWeight: 800,
            letterSpacing: 0,
          }}
        />
      ),
      width: 120,
    },
    {
      field: 'name',
      flex: 1,
      headerName: 'Product',
      minWidth: 250,
      renderCell: ({ row }) => (
        <Typography noWrap sx={{ fontWeight: 800 }} variant="body2">
          {row.name}
        </Typography>
      ),
    },
    {
      field: 'categoryId',
      headerName: 'Category',
      renderCell: ({ row }) => {
        const category = row.categoryId ? categoryByIdMap.get(row.categoryId) : undefined;
        const label = category?.name ?? 'Unassigned';
        const categoryColor = category?.color;

        return (
          <Chip
            label={label}
            size="small"
            sx={{
              bgcolor: categoryColor
                ? alpha(categoryColor, 0.14)
                : (theme) => alpha(theme.palette.text.primary, 0.06),
              borderColor: categoryColor
                ? alpha(categoryColor, 0.3)
                : (theme) => alpha(theme.palette.text.primary, 0.18),
              color: categoryColor ?? 'text.secondary',
              fontWeight: 800,
              '& .MuiChip-label': {
                px: 1.4,
              },
            }}
            variant="outlined"
          />
        );
      },
      width: 150,
    },
    {
      field: 'subcategory',
      headerName: 'Subcategory',
      renderCell: ({ row }) => (
        <Chip
          label={row.subcategory || 'Unassigned'}
          size="small"
          sx={{
            maxWidth: '100%',
            '& .MuiChip-label': {
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            },
          }}
          variant={row.subcategory ? 'outlined' : 'filled'}
        />
      ),
      width: 210,
    },
    {
      field: 'price',
      headerName: 'Price',
      renderCell: ({ value }) => (
        <Typography sx={{ fontWeight: 800 }} variant="body2">
          {formatCurrency(Number(value))}
        </Typography>
      ),
      width: 120,
    },
    {
      field: 'stock',
      headerName: 'Stock',
      renderCell: ({ value }) => {
        const stock = Number(value);
        const chip = getStockChip(stock);

        return (
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography sx={{ fontWeight: 800, minWidth: 28 }} variant="body2">
              {stock}
            </Typography>
            <Chip color={chip.color} label={chip.label} size="small" variant="outlined" />
          </Stack>
        );
      },
      width: 140,
    },
    {
      field: 'rating',
      headerName: 'Rating',
      renderCell: ({ value }) => (
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <StarRoundedIcon sx={{ color: '#f6a609', fontSize: 18 }} />
          <Typography sx={{ fontWeight: 800 }} variant="body2">
            {Number(value).toFixed(1)}
          </Typography>
        </Stack>
      ),
      width: 96,
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
            setForm(toForm(row, categories));
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
        price < 100 ||
        !Number.isInteger(stock) ||
        stock < 0
      ) {
        throw new Error('Enter a product name, SKU, price of at least 100 MMK, and valid stock.');
      }

      const existing = products.find((product) => product.id === editingId);
      const payload = {
        categoryId: form.categoryId || undefined,
        categoryName: category?.name,
        currency: existing?.currency ?? 'MMK',
        description: existing?.description ?? `${name} managed from the admin dashboard.`,
        image: form.imageFile,
        name,
        price,
        rating: existing?.rating ?? 0,
        sku,
        status: existing?.status ?? ('active' as const),
        stock,
        subcategory: form.subcategory || undefined,
        tags: existing?.tags ?? [],
        removeImage: form.removeImage || undefined,
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
  const bulkImportMutation = useMutation({
    mutationFn: adminApi.bulkImportProducts,
    onError: (error) => toast.error(toApiError(error).message),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      await queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      toast.success(
        `Imported ${result.data.created} new and ${result.data.updated} updated products.`,
      );
      resetBulkUpload();
      setIsBulkUploadDialogOpen(false);
    },
  });

  const handleConfirmDelete = () => {
    if (!deleteTarget) {
      return;
    }

    deleteMutation.mutate(deleteTarget.id);
  };

  const handleBulkFileChange = async (file: File | undefined) => {
    setBulkProducts([]);
    setBulkUploadError('');
    setBulkUploadFileName(file?.name ?? '');

    if (!file) {
      return;
    }

    try {
      const fileName = file.name.toLowerCase();

      if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls') && !fileName.endsWith('.csv')) {
        setBulkUploadError('Upload an Excel workbook (.xlsx or .xls) or a CSV file.');
        return;
      }

      const productsToImport = await parseBulkProductFile(file);
      const invalidRows = productsToImport
        .map((product, index) => ({ index: index + 1, product }))
        .filter(
          ({ product }) =>
            !product.name ||
            !product.sku ||
            !Number.isFinite(product.price) ||
            product.price < 100 ||
            !Number.isInteger(product.stock) ||
            product.stock < 0,
        );

      if (invalidRows.length > 0) {
        setBulkUploadError(
          `Rows ${invalidRows.map((row) => row.index).join(', ')} need SKU, Product name, Price, and Stock. Price must be at least 100 MMK and stock must be zero or higher.`,
        );
        return;
      }

      if (productsToImport.length === 0) {
        setBulkUploadError('No product rows were found. Use the first row for column headings.');
        return;
      }

      setBulkProducts(productsToImport);
    } catch {
      setBulkUploadError('Could not read this file. Upload an Excel or CSV file with a header row.');
    }
  };

  const handleBulkImport = () => {
    if (bulkProducts.length === 0) {
      setBulkUploadError('Choose a valid Excel or CSV product file first.');
      return;
    }

    bulkImportMutation.mutate({ mode: bulkImportMode, products: bulkProducts });
  };

  const handleProductImageChange = (file: File | undefined) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed.');
      return;
    }

    if (file.size > maxProductImageBytes) {
      toast.error('Image is too large. Please upload an image under 5MB.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setForm((current) => {
      revokeImagePreview(current.imagePreviewUrl);

      return {
        ...current,
        imageFile: file,
        imageFileName: file.name,
        imagePreviewUrl: previewUrl,
        removeImage: false,
      };
    });
  };

  const clearProductImage = () => {
    setForm((current) => {
      revokeImagePreview(current.imagePreviewUrl);

      return {
        ...current,
        imageFile: undefined,
        imageFileName: '',
        imagePreviewUrl: '',
        removeImage: editingId ? Boolean(current.imagePreviewUrl) : false,
      };
    });
  };

  return (
    <PageSection
      action={
        <Stack direction={{ sm: 'row', xs: 'column' }} spacing={1.25}>
          <AppButton
            onClick={() => {
              resetBulkUpload();
              setIsBulkUploadDialogOpen(true);
            }}
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
        columnHeaderHeight={60}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        rows={filteredProducts}
        rowHeight={60}
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
            <Alert severity="info">
              Upload an Excel or CSV file with one product per row. Existing SKUs are updated by
              default.
            </Alert>
            <AppButton
              onClick={() => {
                const link = document.createElement('a');
                link.href = '/samples/product-bulk-upload-sample.csv';
                link.download = 'product-bulk-upload-sample.csv';
                link.click();
              }}
              sx={{ alignSelf: 'flex-start' }}
              type="button"
              variant="outlined"
            >
              Download sample CSV
            </AppButton>
            <TextField
              label="Import mode"
              onChange={(event) =>
                setBulkImportMode(event.target.value as AdminProductBulkPayload['mode'])
              }
              select
              value={bulkImportMode}
            >
              <MenuItem value="upsert">Create new and update existing</MenuItem>
              <MenuItem value="create-only">Create new only</MenuItem>
            </TextField>
            <Box
              component="label"
              sx={{
                alignItems: 'center',
                bgcolor: bulkProducts.length > 0 ? 'success.lighter' : 'background.paper',
                border: 2,
                borderColor: bulkProducts.length > 0 ? 'success.main' : 'divider',
                borderRadius: 1,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.25,
                justifyContent: 'center',
                minHeight: 160,
                p: 3,
                textAlign: 'center',
                transition: 'border-color 160ms ease, background-color 160ms ease',
                '&:hover': {
                  borderColor: bulkProducts.length > 0 ? 'success.dark' : 'primary.main',
                },
              }}
            >
              <CloudUploadOutlinedIcon
                color={bulkProducts.length > 0 ? 'success' : 'primary'}
                fontSize="large"
              />
              <Typography sx={{ fontWeight: 800 }}>
                {bulkProducts.length > 0 ? 'File selected' : 'Choose Excel or CSV file'}
              </Typography>
              {bulkUploadFileName ? (
                <Chip
                  color={bulkProducts.length > 0 ? 'success' : 'primary'}
                  label={
                    bulkProducts.length > 0
                      ? `${bulkUploadFileName} - ${bulkProducts.length} rows ready`
                      : bulkUploadFileName
                  }
                  variant="outlined"
                />
              ) : (
                <Typography color="text.secondary" variant="body2">
                  Use the first row for column headings.
                </Typography>
              )}
              {bulkProducts.length > 0 ? (
                <AppButton
                  color="inherit"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    resetBulkUpload();
                  }}
                  size="small"
                  type="button"
                  variant="text"
                >
                  Choose another file
                </AppButton>
              ) : null}
              <input
                accept=".xlsx,.xls,.csv"
                hidden
                onChange={(event) => void handleBulkFileChange(event.target.files?.[0])}
                type="file"
              />
            </Box>
            <Stack spacing={1}>
              <Typography sx={{ fontWeight: 800 }} variant="body2">
                Required columns
              </Typography>
              <Typography color="text.secondary" variant="body2">
                {columnText(requiredBulkColumns)}
              </Typography>
              <Typography sx={{ fontWeight: 800, pt: 0.5 }} variant="body2">
                Optional columns
              </Typography>
              <Typography color="text.secondary" variant="body2">
                {columnText(optionalBulkColumns)}
              </Typography>
              <Typography color="text.secondary" variant="caption">
                For Tags, separate multiple values with commas or vertical bars, for example:
                organic, leafy.
              </Typography>
              <Typography color="text.secondary" variant="caption">
                Use Image URL for externally hosted product images.
              </Typography>
              <Typography color="text.secondary" variant="caption">
                Missing Category names are created automatically, and missing Subcategory names are
                added under that category.
              </Typography>
            </Stack>
            {bulkUploadError ? <Alert severity="error">{bulkUploadError}</Alert> : null}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <AppButton
            color="inherit"
            onClick={() => {
              resetBulkUpload();
              setIsBulkUploadDialogOpen(false);
            }}
            variant="outlined"
          >
            Cancel
          </AppButton>
          <AppButton
            disabled={bulkProducts.length === 0 || bulkImportMutation.isPending}
            onClick={handleBulkImport}
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
            <Box
              component="label"
              sx={{
                alignItems: 'center',
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.035),
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                cursor: 'pointer',
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { sm: '132px 1fr', xs: '1fr' },
                minHeight: 132,
                p: 1.5,
              }}
            >
              <Box
                sx={{
                  alignItems: 'center',
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  display: 'flex',
                  height: 112,
                  justifyContent: 'center',
                  overflow: 'hidden',
                  width: { sm: 132, xs: '100%' },
                }}
              >
                {form.imagePreviewUrl ? (
                  <Box
                    alt={form.name || 'Product image preview'}
                    component="img"
                    src={form.imagePreviewUrl}
                    sx={{ height: '100%', objectFit: 'cover', width: '100%' }}
                  />
                ) : (
                  <ImageOutlinedIcon color="primary" sx={{ fontSize: 42 }} />
                )}
              </Box>
              <Stack spacing={1} sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 800 }} variant="body1">
                  Product image
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Upload a clear product photo under 5MB so admins can identify this item quickly.
                </Typography>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                  <AppButton component="span" size="small" startIcon={<CloudUploadOutlinedIcon />}>
                    Choose image
                  </AppButton>
                  {form.imageFileName ? (
                    <Chip label={form.imageFileName} size="small" variant="outlined" />
                  ) : null}
                  {form.imagePreviewUrl ? (
                    <AppButton
                      color="inherit"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        clearProductImage();
                      }}
                      size="small"
                      variant="text"
                    >
                      Remove
                    </AppButton>
                  ) : null}
                </Stack>
              </Stack>
              <input
                accept="image/*"
                hidden
                onChange={(event) => {
                  handleProductImageChange(event.target.files?.[0]);
                  event.target.value = '';
                }}
                type="file"
              />
            </Box>
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
              onChange={(event) => {
                const nextCategoryId = event.target.value;
                const nextSubcategories =
                  categories.find((category) => category.id === nextCategoryId)?.subcategories ??
                  [];

                setForm((current) => ({
                  ...current,
                  categoryId: nextCategoryId,
                  subcategory: nextSubcategories.includes(current.subcategory)
                    ? current.subcategory
                    : '',
                }));
              }}
              select
              value={form.categoryId}
            >
              <MenuItem value="">Unassigned</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              disabled={!form.categoryId || subcategoryOptions.length === 0}
              helperText={
                form.categoryId
                  ? subcategoryOptions.length > 0
                    ? 'Select a subcategory for this product.'
                    : 'This category has no subcategories.'
                  : 'Select a category before choosing a subcategory.'
              }
              label="Subcategory"
              onChange={(event) =>
                setForm((current) => ({ ...current, subcategory: event.target.value }))
              }
              select
              value={form.subcategory}
            >
              <MenuItem value="">No subcategory</MenuItem>
              {subcategoryOptions.map((subcategory) => (
                <MenuItem key={subcategory} value={subcategory}>
                  {subcategory}
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
                  slotProps={{ htmlInput: { min: 100, step: 100 } }}
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
              {detailProduct.imageUrl ? (
                <Box
                  alt={detailProduct.name}
                  component="img"
                  src={detailProduct.imageUrl}
                  sx={{
                    aspectRatio: '16 / 9',
                    borderRadius: 1,
                    objectFit: 'cover',
                    width: '100%',
                  }}
                />
              ) : null}
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
              {detailProduct.subcategory ? (
                <Chip
                  label={detailProduct.subcategory}
                  size="small"
                  sx={{ alignSelf: 'flex-start' }}
                  variant="outlined"
                />
              ) : null}
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
