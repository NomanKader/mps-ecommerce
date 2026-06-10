import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import {
  Alert,
  Box,
  Chip,
  Dialog,
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
import { alpha } from '@mui/material/styles';
import { GridActionsCellItem, type GridColDef } from '@mui/x-data-grid';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import { storefrontColors, storefrontGradients } from '@app/providers/theme/tokens';
import { defaultCarouselSlides, storefrontCategories } from '@features/home/data/homePage.data';
import { merchandisingApi, type CarouselPayload } from '@features/home/api/merchandisingApi';
import type {
  StorefrontCarouselPlacement,
  StorefrontCarouselSlide,
} from '@features/home/types/home.types';
import { toApiError } from '@shared/api/apiError';
import { AppButton } from '@shared/components/ui/Button/AppButton';
import { AppDataTable } from '@shared/components/ui/DataTable/DataTable';
import { PageSection } from '@shared/components/ui/SectionTitle/PageSection';

type CarouselForm = Omit<StorefrontCarouselSlide, 'id' | 'imageUrl'> & {
  imageFile?: File;
  imageFileName: string;
  imagePreviewUrl: string;
};

const today = new Date().toISOString().slice(0, 10);

const emptyForm: CarouselForm = {
  cta: 'Shop now',
  description: '',
  eyebrow: 'Weekly edit',
  headline: 'Fresh',
  imageFileName: '',
  imagePreviewUrl: '',
  metric: 'New',
  partner: 'Storefront edit',
  placement: 'hero',
  sortOrder: 1,
  startsAt: today,
  status: 'draft',
  targetCategoryId: 'all',
  targetSearch: '',
  title: '',
};

const maxCarouselImageBytes = 5 * 1024 * 1024;

const placementLabels: Record<StorefrontCarouselPlacement, string> = {
  hero: 'Hero carousel',
  showcase: 'Showcase carousel',
};

const categoryOptions = [
  { id: 'all', label: 'All categories' },
  ...storefrontCategories.map((category) => ({ id: category.id, label: category.label })),
];

const revokeImagePreview = (previewUrl: string) => {
  if (previewUrl.startsWith('blob:')) {
    URL.revokeObjectURL(previewUrl);
  }
};

const createCarouselPayload = (form: CarouselForm, removeImage = false): CarouselPayload => ({
  cta: form.cta.trim(),
  description: form.description.trim(),
  eyebrow: form.eyebrow.trim(),
  headline: form.headline.trim(),
  image: form.imageFile,
  metric: form.metric.trim(),
  partner: form.partner.trim(),
  placement: form.placement,
  removeImage,
  sortOrder: Number(form.sortOrder) || 1,
  startsAt: form.startsAt,
  status: form.status,
  targetCategoryId: form.targetCategoryId,
  targetSearch: form.targetSearch?.trim() || undefined,
  title: form.title.trim(),
});

const getStatusColor = (status: StorefrontCarouselSlide['status']) => {
  if (status === 'active') {
    return 'success';
  }

  if (status === 'scheduled') {
    return 'info';
  }

  return 'default';
};

const CarouselPreview = ({ slide }: { slide: StorefrontCarouselSlide }) => (
  <Box
    sx={{
      background:
        slide.placement === 'hero' ? storefrontGradients.hero : storefrontGradients.softHero,
      border: 1,
      borderColor: 'divider',
      borderRadius: 1,
      color: slide.placement === 'hero' ? '#ffffff' : storefrontColors.navy,
      overflow: 'hidden',
      p: { md: 3, xs: 2 },
    }}
  >
    <Grid container spacing={2.5} sx={{ alignItems: 'center' }}>
      <Grid size={{ md: 7, xs: 12 }}>
        <Stack spacing={1.3}>
          <Typography
            sx={{
              bgcolor:
                slide.placement === 'hero'
                  ? alpha('#ffffff', 0.16)
                  : alpha(storefrontColors.navy, 0.08),
              borderRadius: 999,
              color: slide.placement === 'hero' ? alpha('#ffffff', 0.86) : storefrontColors.navy,
              display: 'inline-flex',
              fontSize: '0.85rem',
              fontWeight: 800,
              px: 1.6,
              py: 0.65,
              width: 'fit-content',
            }}
          >
            {slide.eyebrow || 'Eyebrow'}
          </Typography>
          <Typography
            sx={{
              fontSize: { md: '2.45rem', xs: '1.7rem' },
              fontWeight: 900,
              lineHeight: 1,
              overflowWrap: 'anywhere',
            }}
          >
            {slide.title || 'Carousel title'}
          </Typography>
          <Typography
            sx={{
              color: slide.placement === 'hero' ? alpha('#ffffff', 0.84) : 'text.secondary',
              fontSize: '1rem',
              lineHeight: 1.45,
            }}
          >
            {slide.description || 'Slide description appears here.'}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Chip
              label={slide.cta || 'Call to action'}
              sx={{
                bgcolor: slide.placement === 'hero' ? '#ffffff' : storefrontColors.navy,
                color: slide.placement === 'hero' ? storefrontColors.navy : '#ffffff',
                fontWeight: 900,
              }}
            />
            <Typography
              sx={{
                color: slide.placement === 'hero' ? alpha('#ffffff', 0.74) : 'text.secondary',
                fontWeight: 700,
              }}
              variant="body2"
            >
              {slide.partner || 'Supporting copy'}
            </Typography>
          </Stack>
        </Stack>
      </Grid>
      <Grid size={{ md: 5, xs: 12 }}>
        <Box
          alt={slide.title}
          component="img"
          src={slide.imageUrl || defaultCarouselSlides[0]?.imageUrl}
          sx={{
            aspectRatio: '16 / 10',
            borderRadius: 1,
            display: 'block',
            objectFit: 'cover',
            width: '100%',
          }}
        />
      </Grid>
    </Grid>
  </Box>
);

export const CarouselPage = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StorefrontCarouselSlide | null>(null);
  const [form, setForm] = useState<CarouselForm>(emptyForm);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [placementFilter, setPlacementFilter] = useState<'all' | StorefrontCarouselPlacement>(
    'all',
  );
  const carouselQuery = useQuery({
    queryFn: ({ signal }) => merchandisingApi.listAdminCarousel({}, { signal }),
    queryKey: ['admin', 'carousel'],
  });
  const slides = carouselQuery.data ?? [];
  const [previewSlide, setPreviewSlide] = useState<StorefrontCarouselSlide | null>(
    defaultCarouselSlides[0] ?? null,
  );

  const filteredSlides = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return slides
      .filter((slide) => placementFilter === 'all' || slide.placement === placementFilter)
      .filter((slide) => {
        if (!normalizedSearch) {
          return true;
        }

        return [
          slide.title,
          slide.description,
          slide.eyebrow,
          slide.cta,
          slide.partner,
          slide.targetCategoryId,
          slide.targetSearch ?? '',
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch);
      })
      .sort(
        (first, second) =>
          first.placement.localeCompare(second.placement) || first.sortOrder - second.sortOrder,
      );
  }, [placementFilter, search, slides]);

  const columns: GridColDef<StorefrontCarouselSlide>[] = [
    {
      field: 'title',
      flex: 1,
      headerName: 'Slide',
      minWidth: 240,
      renderCell: (params) => (
        <Stack spacing={0.25} sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 800 }} variant="body2">
            {params.row.title}
          </Typography>
          <Typography color="text.secondary" noWrap variant="caption">
            {params.row.eyebrow} / {params.row.cta}
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'placement',
      headerName: 'Placement',
      renderCell: (params) => placementLabels[params.row.placement],
      width: 150,
    },
    { field: 'sortOrder', headerName: 'Order', type: 'number', width: 90 },
    {
      field: 'targetCategoryId',
      headerName: 'Target',
      width: 150,
      valueGetter: (_value, row) => row.targetSearch || row.targetCategoryId,
    },
    {
      field: 'startsAt',
      headerName: 'Starts',
      width: 130,
    },
    {
      field: 'status',
      headerName: 'Status',
      renderCell: (params) => (
        <Chip color={getStatusColor(params.row.status)} label={params.row.status} size="small" />
      ),
      width: 120,
    },
    {
      field: 'actions',
      getActions: ({ row }) => [
        <GridActionsCellItem
          icon={<VisibilityRoundedIcon />}
          key="preview"
          label="Preview"
          onClick={() => setPreviewSlide(row)}
        />,
        <GridActionsCellItem
          icon={<EditRoundedIcon />}
          key="edit"
          label="Edit"
          onClick={() => {
            setEditingId(row.id);
            setForm({
              cta: row.cta,
              description: row.description,
              eyebrow: row.eyebrow,
              headline: row.headline,
              imageFileName: '',
              imagePreviewUrl: row.imageUrl,
              metric: row.metric,
              partner: row.partner,
              placement: row.placement,
              sortOrder: row.sortOrder,
              startsAt: row.startsAt,
              status: row.status,
              targetCategoryId: row.targetCategoryId,
              targetSearch: row.targetSearch ?? '',
              title: row.title,
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
      width: 120,
    },
  ];

  const createMutation = useMutation({
    mutationFn: merchandisingApi.createCarouselSlide,
    onError: (error) => toast.error(toApiError(error).message),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'carousel'] });
      await queryClient.invalidateQueries({ queryKey: ['storefront', 'carousel'] });
      setPreviewSlide(result.data);
      setEditingId(null);
      setForm(emptyForm);
      setIsDialogOpen(false);
      toast.success(result.message);
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CarouselPayload }) =>
      merchandisingApi.updateCarouselSlide(id, payload),
    onError: (error) => toast.error(toApiError(error).message),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'carousel'] });
      await queryClient.invalidateQueries({ queryKey: ['storefront', 'carousel'] });
      setPreviewSlide(result.data);
      setEditingId(null);
      setForm(emptyForm);
      setIsDialogOpen(false);
      toast.success(result.message);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: merchandisingApi.deleteCarouselSlide,
    onError: (error) => toast.error(toApiError(error).message),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'carousel'] });
      await queryClient.invalidateQueries({ queryKey: ['storefront', 'carousel'] });
      setDeleteTarget(null);
      setPreviewSlide(null);
      toast.success(result.message);
    },
  });

  const handleCarouselImageChange = (file: File | undefined) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed.');
      return;
    }

    if (file.size > maxCarouselImageBytes) {
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
      };
    });
  };

  const clearCarouselImage = () => {
    setForm((current) => {
      revokeImagePreview(current.imagePreviewUrl);

      return {
        ...current,
        imageFile: undefined,
        imageFileName: '',
        imagePreviewUrl: '',
      };
    });
  };

  const handleSave = () => {
    const payload = createCarouselPayload(form, editingId ? !form.imagePreviewUrl : false);

    if (
      !payload.title ||
      !payload.description ||
      (!form.imagePreviewUrl && !payload.image) ||
      !payload.cta
    ) {
      toast.error('Complete the title, description, image, and CTA fields.');
      return;
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, payload });
      return;
    }

    createMutation.mutate(payload);
  };

  return (
    <PageSection
      action={
        <Stack direction={{ sm: 'row', xs: 'column' }} spacing={1.25}>
          <AppButton
            onClick={() => {
              setForm({ ...emptyForm, sortOrder: slides.length + 1 });
              setEditingId(null);
              setIsDialogOpen(true);
            }}
            startIcon={<AddRoundedIcon />}
          >
            Add slide
          </AppButton>
        </Stack>
      }
      description="Control homepage hero and showcase carousel slides for the current storefront session."
      title="Carousel"
    >
      <Stack spacing={2.5}>
        <Box>
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
              label="Search slides"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Title, CTA, target, or copy"
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
              label="Placement"
              onChange={(event) =>
                setPlacementFilter(event.target.value as 'all' | StorefrontCarouselPlacement)
              }
              select
              sx={{ minWidth: { lg: 220 } }}
              value={placementFilter}
            >
              <MenuItem value="all">All placements</MenuItem>
              <MenuItem value="hero">Hero carousel</MenuItem>
              <MenuItem value="showcase">Showcase carousel</MenuItem>
            </TextField>
            <Typography color="text.secondary" sx={{ ml: { lg: 'auto' } }} variant="body2">
              Showing {filteredSlides.length}
            </Typography>
          </Stack>

          <AppDataTable
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 },
              },
            }}
            loading={carouselQuery.isLoading}
            rows={filteredSlides}
          />
        </Box>
        <Box>
          <Stack spacing={2}>
            <Alert severity="info">
              Carousel edits are saved to the tenant backend and are visible on the storefront
              homepage after saving.
            </Alert>
            {previewSlide ? (
              <CarouselPreview slide={previewSlide} />
            ) : (
              <Alert severity="warning">Create a slide to preview carousel content.</Alert>
            )}
          </Stack>
        </Box>
      </Stack>

      <Dialog fullWidth maxWidth="md" onClose={() => setIsDialogOpen(false)} open={isDialogOpen}>
        <DialogTitle>{editingId ? 'Edit Carousel Slide' : 'Create Carousel Slide'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.25} sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid size={{ sm: 6, xs: 12 }}>
                <TextField
                  autoFocus
                  fullWidth
                  label="Title"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, title: event.target.value }))
                  }
                  value={form.title}
                />
              </Grid>
              <Grid size={{ sm: 6, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Eyebrow"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, eyebrow: event.target.value }))
                  }
                  value={form.eyebrow}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  minRows={3}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, description: event.target.value }))
                  }
                  value={form.description}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
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
                    gridTemplateColumns: { sm: '180px 1fr', xs: '1fr' },
                    minHeight: 150,
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
                      height: 126,
                      justifyContent: 'center',
                      overflow: 'hidden',
                      width: { sm: 180, xs: '100%' },
                    }}
                  >
                    {form.imagePreviewUrl ? (
                      <Box
                        alt={form.title || 'Carousel image preview'}
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
                      Carousel image
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      Upload a wide storefront image under 5MB for the homepage carousel.
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ alignItems: 'center', flexWrap: 'wrap' }}
                    >
                      <AppButton
                        component="span"
                        size="small"
                        startIcon={<CloudUploadOutlinedIcon />}
                      >
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
                            clearCarouselImage();
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
                      handleCarouselImageChange(event.target.files?.[0]);
                      event.target.value = '';
                    }}
                    type="file"
                  />
                </Box>
              </Grid>
              <Grid size={{ sm: 4, xs: 12 }}>
                <TextField
                  fullWidth
                  label="CTA"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, cta: event.target.value }))
                  }
                  value={form.cta}
                />
              </Grid>
              <Grid size={{ sm: 4, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Placement"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      placement: event.target.value as StorefrontCarouselPlacement,
                    }))
                  }
                  select
                  value={form.placement}
                >
                  <MenuItem value="hero">Hero carousel</MenuItem>
                  <MenuItem value="showcase">Showcase carousel</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ sm: 4, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Status"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      status: event.target.value as StorefrontCarouselSlide['status'],
                    }))
                  }
                  select
                  value={form.status}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ sm: 4, xs: 12 }}>
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
              <Grid size={{ sm: 4, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Start date"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, startsAt: event.target.value }))
                  }
                  slotProps={{ inputLabel: { shrink: true } }}
                  type="date"
                  value={form.startsAt}
                />
              </Grid>
              <Grid size={{ sm: 4, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Target category"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, targetCategoryId: event.target.value }))
                  }
                  select
                  value={form.targetCategoryId}
                >
                  {categoryOptions.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ sm: 4, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Target search"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, targetSearch: event.target.value }))
                  }
                  value={form.targetSearch}
                />
              </Grid>
              <Grid size={{ sm: 4, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Mobile metric"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, metric: event.target.value }))
                  }
                  value={form.metric}
                />
              </Grid>
              <Grid size={{ sm: 4, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Mobile headline"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, headline: event.target.value }))
                  }
                  value={form.headline}
                />
              </Grid>
              <Grid size={{ sm: 4, xs: 12 }}>
                <TextField
                  fullWidth
                  label="Support text"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, partner: event.target.value }))
                  }
                  value={form.partner}
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <AppButton color="inherit" onClick={() => setIsDialogOpen(false)} variant="outlined">
            Cancel
          </AppButton>
          <AppButton
            disabled={createMutation.isPending || updateMutation.isPending}
            onClick={handleSave}
          >
            {editingId ? 'Save slide' : 'Add slide'}
          </AppButton>
        </DialogActions>
      </Dialog>

      <Dialog
        fullWidth
        maxWidth="xs"
        onClose={() => setDeleteTarget(null)}
        open={Boolean(deleteTarget)}
      >
        <DialogTitle>Delete Carousel Slide?</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">Delete {deleteTarget?.title}?</Typography>
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
