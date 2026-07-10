import { PersistentDialog as Dialog } from '@shared/components/ui/Dialog/AppDialog';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import {
  Alert,
  Avatar,
  Box,
  Chip,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { GridActionsCellItem, type GridColDef } from '@mui/x-data-grid';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import { categoryApi } from '@features/category/api/categoryApi';
import { merchandisingApi, type PageSegmentPayload } from '@features/home/api/merchandisingApi';
import type { StorefrontPageSegment } from '@features/home/types/home.types';
import { toApiError } from '@shared/api/apiError';
import { AppButton } from '@shared/components/ui/Button/AppButton';
import { AppDataTable } from '@shared/components/ui/DataTable/DataTable';
import { PageSection } from '@shared/components/ui/SectionTitle/PageSection';
import { validateImageFileSelection } from '@shared/utils/imageFileValidation';

type CarouselSlot = {
  image: File | null;
  imageFileName: string;
  imagePreviewUrl: string;
  removeImage?: boolean;
  text: string;
};

const createEmptyCarouselSlot = (): CarouselSlot => ({
  image: null,
  imageFileName: '',
  imagePreviewUrl: '',
  text: '',
});

const createEmptyCarouselSlots = (): CarouselSlot[] => [];

const segmentIconOptions = [
  { label: 'Shopping bag', value: '🛍️' },
  { label: 'Fresh produce', value: '🥬' },
  { label: 'Dairy', value: '🥛' },
  { label: 'Cookie', value: '🍪' },
  { label: 'Beauty', value: '💄' },
  { label: 'Gift', value: '🎁' },
  { label: 'Star', value: '⭐' },
  { label: 'Fire', value: '🔥' },
];

const defaultSegmentIcon = '🛍️';

const createEmptyForm = () => ({
  afterNewProductsCarousel: createEmptyCarouselSlots(),
  displaySlot: 'after-storefront-icons',
  haveYouSeenCards: createEmptyCarouselSlots(),
  icon: defaultSegmentIcon,
  image: null as File | null,
  imageFileName: '',
  imagePreviewUrl: '',
  primaryCategoryId: '',
  removeImage: false,
  sortOrder: 0,
  status: 'active',
  title: '',
  topCarousel: createEmptyCarouselSlots(),
});

type SegmentForm = ReturnType<typeof createEmptyForm>;
type CarouselKey = 'topCarousel' | 'afterNewProductsCarousel' | 'haveYouSeenCards';
type SegmentDisplaySlot = StorefrontPageSegment['displaySlot'];
type SegmentStatus = StorefrontPageSegment['status'];

const revokeImagePreview = (previewUrl: string) => {
  if (previewUrl.startsWith('blob:')) {
    URL.revokeObjectURL(previewUrl);
  }
};

const revokeCarouselPreviews = (slots: CarouselSlot[]) => {
  slots.forEach((slot) => revokeImagePreview(slot.imagePreviewUrl));
};

const getCarouselSlots = (form: SegmentForm, carouselKey: CarouselKey) => form[carouselKey] ?? [];

const displaySlotLabels: Record<SegmentDisplaySlot, string> = {
  'after-new-in-season': 'After New In Season',
  'after-storefront-icons': 'After storefront icons',
};

const createFormFromSegment = (segment: StorefrontPageSegment): SegmentForm => ({
  afterNewProductsCarousel: segment.afterNewProductsCarousel.map((slide) => ({
    image: null,
    imageFileName: '',
    imagePreviewUrl: slide.imageUrl ?? '',
    text: slide.text ?? '',
  })),
  displaySlot: segment.displaySlot,
  haveYouSeenCards: segment.haveYouSeenCards.map((slide) => ({
    image: null,
    imageFileName: '',
    imagePreviewUrl: slide.imageUrl ?? '',
    text: slide.text ?? '',
  })),
  icon: segment.icon ?? defaultSegmentIcon,
  image: null,
  imageFileName: '',
  imagePreviewUrl: segment.imageUrl ?? '',
  primaryCategoryId: segment.primaryCategoryId,
  removeImage: false,
  sortOrder: segment.sortOrder,
  status: segment.status,
  title: segment.title,
  topCarousel: segment.topCarousel.map((slide) => ({
    image: null,
    imageFileName: '',
    imagePreviewUrl: slide.imageUrl ?? '',
    text: slide.text ?? '',
  })),
});

const createPayloadFromForm = (form: SegmentForm): PageSegmentPayload => ({
  afterNewProductsCarousel: form.afterNewProductsCarousel.map((slide, index) => ({
    image: slide.image,
    removeImage: slide.removeImage,
    sortOrder: index,
    text: slide.text,
  })),
  displaySlot: form.displaySlot as SegmentDisplaySlot,
  haveYouSeenCards: form.haveYouSeenCards.map((slide, index) => ({
    image: slide.image,
    removeImage: slide.removeImage,
    sortOrder: index,
    text: slide.text,
  })),
  icon: form.icon,
  image: form.image,
  primaryCategoryId: form.primaryCategoryId,
  removeImage: form.removeImage,
  sortOrder: Number(form.sortOrder) || 0,
  status: form.status as SegmentStatus,
  title: form.title.trim(),
  topCarousel: form.topCarousel.map((slide, index) => ({
    image: slide.image,
    removeImage: slide.removeImage,
    sortOrder: index,
    text: slide.text,
  })),
});

type CarouselSlideFieldProps = {
  index: number;
  itemLabel?: string;
  onClearImage: () => void;
  onImageChange: (file: File) => void;
  onRemove: () => void;
  onTextChange: (text: string) => void;
  slide: CarouselSlot;
};

const CarouselSlideField = ({
  index,
  itemLabel = 'Slide',
  onClearImage,
  onImageChange,
  onRemove,
  onTextChange,
  slide,
}: CarouselSlideFieldProps) => (
  <Box
    sx={{
      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.035),
      border: 1,
      borderColor: 'divider',
      borderRadius: 1,
      display: 'grid',
      gap: 1.5,
      p: 1.5,
    }}
  >
    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
      <Typography sx={{ fontWeight: 800 }} variant="body2">
        {itemLabel} {index + 1}
      </Typography>
      <AppButton
        color="inherit"
        onClick={onRemove}
        size="small"
        startIcon={<DeleteOutlineRoundedIcon />}
        variant="text"
      >
        Remove
      </AppButton>
    </Stack>
    <Box
      component="label"
      sx={{
        alignItems: 'center',
        cursor: 'pointer',
        display: 'grid',
        gap: 1.5,
        gridTemplateColumns: { sm: '112px 1fr', xs: '1fr' },
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
          height: 88,
          justifyContent: 'center',
          overflow: 'hidden',
          width: { sm: 112, xs: '100%' },
        }}
      >
        {slide.imagePreviewUrl ? (
          <Box
            alt={`Carousel slide ${index + 1} preview`}
            component="img"
            src={slide.imagePreviewUrl}
            sx={{ height: '100%', objectFit: 'cover', width: '100%' }}
          />
        ) : (
          <ImageOutlinedIcon color="primary" sx={{ fontSize: 34 }} />
        )}
      </Box>
      <Stack spacing={1} sx={{ minWidth: 0 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <AppButton component="span" size="small" startIcon={<CloudUploadOutlinedIcon />}>
            Choose image
          </AppButton>
          {slide.imageFileName ? (
            <Chip label={slide.imageFileName} size="small" variant="outlined" />
          ) : null}
          {slide.imagePreviewUrl ? (
            <AppButton
              color="inherit"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onClearImage();
              }}
              size="small"
              variant="text"
            >
              Remove
            </AppButton>
          ) : null}
        </Stack>
        <Typography color="text.secondary" variant="caption">
          Upload {itemLabel.toLowerCase()} image {index + 1}.
        </Typography>
      </Stack>
      <input
        accept="image/*"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];

          if (file) {
            onImageChange(file);
          }

          event.target.value = '';
        }}
        type="file"
      />
    </Box>
    <TextField
      fullWidth
      label={`${itemLabel} ${index + 1} text`}
      onChange={(event) => onTextChange(event.target.value)}
      value={slide.text}
    />
  </Box>
);

export const PageSegmentsPage = () => {
  const queryClient = useQueryClient();
  const categoriesQuery = useQuery({
    queryFn: ({ signal }) => categoryApi.getCategories({ signal }),
    queryKey: ['categories'],
  });
  const pageSegmentsQuery = useQuery({
    queryFn: ({ signal }) => merchandisingApi.listAdminPageSegments({ status: 'all' }, { signal }),
    queryKey: ['admin', 'page-segments'],
  });
  const [deleteTarget, setDeleteTarget] = useState<StorefrontPageSegment | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SegmentForm>(() => createEmptyForm());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);
  const categoryLabelById = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories],
  );
  const formRef = useRef(form);

  const saveMutation = useMutation({
    mutationFn: (payload: PageSegmentPayload) =>
      editingId
        ? merchandisingApi.updatePageSegment(editingId, payload)
        : merchandisingApi.createPageSegment(payload),
    onError: (error) => toast.error(toApiError(error).message),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'page-segments'] });
      await queryClient.invalidateQueries({ queryKey: ['storefront', 'page-segments'] });
      setEditingId(null);
      setForm(createEmptyForm());
      setIsDialogOpen(false);
      toast.success(result.message);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: merchandisingApi.deletePageSegment,
    onError: (error) => toast.error(toApiError(error).message),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'page-segments'] });
      await queryClient.invalidateQueries({ queryKey: ['storefront', 'page-segments'] });
      setDeleteTarget(null);
      toast.success(result.message);
    },
  });

  const columns: GridColDef<StorefrontPageSegment>[] = [
    {
      field: 'title',
      flex: 1,
      headerName: 'Segment',
      minWidth: 280,
      renderCell: (params) => (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: 0 }}>
          <Avatar
            alt={params.row.title}
            src={params.row.imageUrl ?? undefined}
            sx={{ borderRadius: 1, height: 44, width: 56 }}
            variant="rounded"
          >
            <ImageOutlinedIcon fontSize="small" />
          </Avatar>
          <Stack sx={{ minWidth: 0 }}>
            <Typography noWrap sx={{ fontWeight: 800 }} variant="body2">
              {params.row.title}
            </Typography>
            <Typography color="text.secondary" noWrap variant="caption">
              {categoryLabelById.get(params.row.primaryCategoryId) ?? 'Unknown category'}
            </Typography>
          </Stack>
        </Stack>
      ),
    },
    {
      field: 'displaySlot',
      headerName: 'Position',
      renderCell: (params) => displaySlotLabels[params.row.displaySlot],
      width: 210,
    },
    { field: 'sortOrder', headerName: 'Order', type: 'number', width: 90 },
    {
      field: 'slides',
      headerName: 'Content',
      valueGetter: (_value, row) =>
        row.topCarousel.length + row.afterNewProductsCarousel.length + row.haveYouSeenCards.length,
      width: 110,
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
          icon={<EditRoundedIcon />}
          key="edit"
          label="Edit segment"
          onClick={() => openEditDialog(row)}
        />,
        <GridActionsCellItem
          icon={<DeleteOutlineRoundedIcon />}
          key="delete"
          label="Delete segment"
          onClick={() => setDeleteTarget(row)}
        />,
      ],
      type: 'actions',
      width: 96,
    },
  ];

  useEffect(() => {
    formRef.current = form;
  }, [form]);

  useEffect(
    () => () => {
      revokeImagePreview(formRef.current.imagePreviewUrl);
      revokeCarouselPreviews(getCarouselSlots(formRef.current, 'topCarousel'));
      revokeCarouselPreviews(getCarouselSlots(formRef.current, 'afterNewProductsCarousel'));
      revokeCarouselPreviews(getCarouselSlots(formRef.current, 'haveYouSeenCards'));
    },
    [],
  );

  const clearSegmentImage = () => {
    setForm((current) => {
      revokeImagePreview(current.imagePreviewUrl);

      return {
        ...current,
        image: null,
        imageFileName: '',
        imagePreviewUrl: '',
        removeImage: Boolean(current.imagePreviewUrl),
      };
    });
  };

  const clearCarouselImage = (carouselKey: CarouselKey, index: number) => {
    setForm((current) => ({
      ...current,
      [carouselKey]: getCarouselSlots(current, carouselKey).map((slot, slotIndex) => {
        if (slotIndex !== index) {
          return slot;
        }

        revokeImagePreview(slot.imagePreviewUrl);

        return {
          ...slot,
          image: null,
          imageFileName: '',
          imagePreviewUrl: '',
          removeImage: Boolean(slot.imagePreviewUrl),
        };
      }),
    }));
  };

  const setCarouselImage = (carouselKey: CarouselKey, index: number, file: File) => {
    if (!validateImageFileSelection(file, 'page segment slide image')) {
      return;
    }

    setForm((current) => ({
      ...current,
      [carouselKey]: getCarouselSlots(current, carouselKey).map((slot, slotIndex) => {
        if (slotIndex !== index) {
          return slot;
        }

        revokeImagePreview(slot.imagePreviewUrl);

        return {
          ...slot,
          image: file,
          imageFileName: file.name,
          imagePreviewUrl: URL.createObjectURL(file),
          removeImage: false,
        };
      }),
    }));
  };

  const addCarouselSlide = (carouselKey: CarouselKey) => {
    setForm((current) => ({
      ...current,
      [carouselKey]: [...getCarouselSlots(current, carouselKey), createEmptyCarouselSlot()],
    }));
  };

  const removeCarouselSlide = (carouselKey: CarouselKey, index: number) => {
    setForm((current) => {
      const slots = getCarouselSlots(current, carouselKey);
      const slot = slots[index];

      if (slot) {
        revokeImagePreview(slot.imagePreviewUrl);
      }

      return {
        ...current,
        [carouselKey]: slots.filter((_slot, slotIndex) => slotIndex !== index),
      };
    });
  };

  const setCarouselText = (carouselKey: CarouselKey, index: number, text: string) => {
    setForm((current) => ({
      ...current,
      [carouselKey]: getCarouselSlots(current, carouselKey).map((slot, slotIndex) =>
        slotIndex === index ? { ...slot, text } : slot,
      ),
    }));
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  const openDialog = () => {
    revokeImagePreview(form.imagePreviewUrl);
    revokeCarouselPreviews(getCarouselSlots(form, 'topCarousel'));
    revokeCarouselPreviews(getCarouselSlots(form, 'afterNewProductsCarousel'));
    revokeCarouselPreviews(getCarouselSlots(form, 'haveYouSeenCards'));
    setForm(createEmptyForm());
    setEditingId(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (segment: StorefrontPageSegment) => {
    revokeImagePreview(form.imagePreviewUrl);
    revokeCarouselPreviews(getCarouselSlots(form, 'topCarousel'));
    revokeCarouselPreviews(getCarouselSlots(form, 'afterNewProductsCarousel'));
    revokeCarouselPreviews(getCarouselSlots(form, 'haveYouSeenCards'));
    setForm(createFormFromSegment(segment));
    setEditingId(segment.id);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) {
      toast.error('Enter a segment title.');
      return;
    }

    if (!form.primaryCategoryId) {
      toast.error('Select a primary category.');
      return;
    }

    saveMutation.mutate(createPayloadFromForm(form));
  };

  return (
    <>
      <PageSection
        action={
          <AppButton onClick={openDialog} startIcon={<AddRoundedIcon />}>
            Add segment
          </AppButton>
        }
        description="Create and manage configurable homepage page segments with images, carousel slides, and poster cards."
        title="Page Segments"
      >
        <AppDataTable
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          loading={pageSegmentsQuery.isLoading}
          rowHeight={76}
          rows={pageSegmentsQuery.data ?? []}
        />
      </PageSection>

      <Dialog
        fullWidth
        maxWidth="lg"
        onClose={closeDialog}
        open={isDialogOpen}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 2,
              maxHeight: { md: '88vh', xs: '92vh' },
              width: { md: 'min(1120px, calc(100% - 48px))', xs: 'calc(100% - 24px)' },
            },
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, px: { sm: 4, xs: 2.5 }, pt: { sm: 3.25, xs: 2.5 } }}>
          <Typography component="div" sx={{ fontWeight: 900 }} variant="h5">
            {editingId ? 'Edit page segment' : 'Add page segment'}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75 }} variant="body2">
            Configure the segment details, hero image, and optional carousel content.
          </Typography>
        </DialogTitle>
        <DialogContent
          sx={{
            px: { sm: 4, xs: 2.5 },
            py: { sm: 2.5, xs: 2 },
            '&.MuiDialogContent-root': {
              borderTop: 0,
            },
          }}
        >
          <Stack spacing={3}>
            <Box
              sx={{
                alignItems: 'start',
                display: 'grid',
                gap: 2.5,
                gridTemplateColumns: { md: 'minmax(0, 1fr) 380px', xs: '1fr' },
              }}
            >
              <Stack spacing={2}>
                <TextField
                  autoFocus
                  fullWidth
                  label="Segment title"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, title: event.target.value }))
                  }
                  value={form.title}
                />
                <TextField
                  fullWidth
                  label="Primary category"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, primaryCategoryId: event.target.value }))
                  }
                  select
                  value={form.primaryCategoryId}
                >
                  {categoriesQuery.isLoading ? (
                    <MenuItem disabled value="">
                      Loading categories...
                    </MenuItem>
                  ) : null}
                  {!categoriesQuery.isLoading && categories.length === 0 ? (
                    <MenuItem disabled value="">
                      No primary categories
                    </MenuItem>
                  ) : null}
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </TextField>
                {categoriesQuery.isError ? (
                  <Alert severity="error">{toApiError(categoriesQuery.error).message}</Alert>
                ) : null}
                <TextField
                  fullWidth
                  label="Display position"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, displaySlot: event.target.value }))
                  }
                  select
                  value={form.displaySlot}
                >
                  <MenuItem value="after-storefront-icons">
                    After storefront icons - full image card design
                  </MenuItem>
                  <MenuItem value="after-new-in-season">
                    After New In Season - split image/text card design
                  </MenuItem>
                </TextField>
                <Box
                  sx={{
                    display: 'grid',
                    gap: 2,
                    gridTemplateColumns: { sm: '1fr 1fr', xs: '1fr' },
                  }}
                >
                  <TextField
                    fullWidth
                    label="Sort order"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        sortOrder: Number(event.target.value),
                      }))
                    }
                    type="number"
                    value={form.sortOrder}
                  />
                  <TextField
                    fullWidth
                    label="Status"
                    onChange={(event) =>
                      setForm((current) => ({ ...current, status: event.target.value }))
                    }
                    select
                    value={form.status}
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="hidden">Hidden</MenuItem>
                  </TextField>
                </Box>
                {form.displaySlot === 'after-new-in-season' ? (
                  <TextField
                    fullWidth
                    helperText="Used in the split image/text card design after New In Season."
                    label="Segment icon"
                    onChange={(event) =>
                      setForm((current) => ({ ...current, icon: event.target.value }))
                    }
                    select
                    value={form.icon}
                  >
                    {segmentIconOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
                          <Typography sx={{ fontSize: '1.25rem', lineHeight: 1 }}>
                            {option.value}
                          </Typography>
                          <Typography>{option.label}</Typography>
                        </Stack>
                      </MenuItem>
                    ))}
                  </TextField>
                ) : null}
              </Stack>
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
                  minHeight: '100%',
                  p: 2,
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
                    height: { md: 220, sm: 260, xs: 180 },
                    justifyContent: 'center',
                    overflow: 'hidden',
                    width: '100%',
                  }}
                >
                  {form.imagePreviewUrl ? (
                    <Box
                      alt={form.title || 'Segment image preview'}
                      component="img"
                      src={form.imagePreviewUrl}
                      sx={{ height: '100%', objectFit: 'cover', width: '100%' }}
                    />
                  ) : (
                    <ImageOutlinedIcon color="primary" sx={{ fontSize: 54 }} />
                  )}
                </Box>
                <Stack spacing={1.25} sx={{ minWidth: 0 }}>
                  <Box sx={{ fontWeight: 900 }}>Segment image</Box>
                  <Box sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                    Upload the image used by the selected page segment design.
                  </Box>
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
                          clearSegmentImage();
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
                    const file = event.target.files?.[0];

                    if (!file) {
                      return;
                    }

                    if (!validateImageFileSelection(file, 'page segment image')) {
                      event.target.value = '';
                      return;
                    }

                    setForm((current) => {
                      revokeImagePreview(current.imagePreviewUrl);

                      return {
                        ...current,
                        image: file,
                        imageFileName: file.name,
                        imagePreviewUrl: URL.createObjectURL(file),
                        removeImage: false,
                      };
                    });
                    event.target.value = '';
                  }}
                  type="file"
                />
              </Box>
            </Box>
            <Stack
              spacing={1.5}
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                p: { sm: 2.5, xs: 2 },
              }}
            >
              <Stack
                direction={{ sm: 'row', xs: 'column' }}
                spacing={1}
                sx={{
                  alignItems: { sm: 'center', xs: 'stretch' },
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 900 }}>Top page carousel</Typography>
                  <Typography color="text.secondary" variant="body2">
                    Add slides for the carousel at the top of the page.
                  </Typography>
                </Box>
                <AppButton
                  onClick={() => addCarouselSlide('topCarousel')}
                  size="small"
                  startIcon={<AddRoundedIcon />}
                  variant="outlined"
                >
                  Add slide
                </AppButton>
              </Stack>
              {getCarouselSlots(form, 'topCarousel').length === 0 ? (
                <Box
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    color: 'text.secondary',
                    p: 2,
                    textAlign: 'center',
                  }}
                >
                  No slides added yet.
                </Box>
              ) : null}
              {getCarouselSlots(form, 'topCarousel').map((slide, index) => (
                <CarouselSlideField
                  index={index}
                  key={`top-carousel-${index}`}
                  onClearImage={() => clearCarouselImage('topCarousel', index)}
                  onImageChange={(file) => setCarouselImage('topCarousel', index, file)}
                  onRemove={() => removeCarouselSlide('topCarousel', index)}
                  onTextChange={(text) => setCarouselText('topCarousel', index, text)}
                  slide={slide}
                />
              ))}
            </Stack>
            <Stack
              spacing={1.5}
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                p: { sm: 2.5, xs: 2 },
              }}
            >
              <Stack
                direction={{ sm: 'row', xs: 'column' }}
                spacing={1}
                sx={{
                  alignItems: { sm: 'center', xs: 'stretch' },
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 900 }}>After New Products carousel</Typography>
                  <Typography color="text.secondary" variant="body2">
                    Add slides for the carousel after the New Products section.
                  </Typography>
                </Box>
                <AppButton
                  onClick={() => addCarouselSlide('afterNewProductsCarousel')}
                  size="small"
                  startIcon={<AddRoundedIcon />}
                  variant="outlined"
                >
                  Add slide
                </AppButton>
              </Stack>
              {getCarouselSlots(form, 'afterNewProductsCarousel').length === 0 ? (
                <Box
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    color: 'text.secondary',
                    p: 2,
                    textAlign: 'center',
                  }}
                >
                  No slides added yet.
                </Box>
              ) : null}
              {getCarouselSlots(form, 'afterNewProductsCarousel').map((slide, index) => (
                <CarouselSlideField
                  index={index}
                  key={`after-new-products-carousel-${index}`}
                  onClearImage={() => clearCarouselImage('afterNewProductsCarousel', index)}
                  onImageChange={(file) =>
                    setCarouselImage('afterNewProductsCarousel', index, file)
                  }
                  onRemove={() => removeCarouselSlide('afterNewProductsCarousel', index)}
                  onTextChange={(text) => setCarouselText('afterNewProductsCarousel', index, text)}
                  slide={slide}
                />
              ))}
            </Stack>
            <Stack
              spacing={1.5}
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                p: { sm: 2.5, xs: 2 },
              }}
            >
              <Stack
                direction={{ sm: 'row', xs: 'column' }}
                spacing={1}
                sx={{
                  alignItems: { sm: 'center', xs: 'stretch' },
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 900 }}>Have You Seen cards</Typography>
                  <Typography color="text.secondary" variant="body2">
                    Add images and text for the poster cards in the Have You Seen section.
                  </Typography>
                </Box>
                <AppButton
                  onClick={() => addCarouselSlide('haveYouSeenCards')}
                  size="small"
                  startIcon={<AddRoundedIcon />}
                  variant="outlined"
                >
                  Add card
                </AppButton>
              </Stack>
              {getCarouselSlots(form, 'haveYouSeenCards').length === 0 ? (
                <Box
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    color: 'text.secondary',
                    p: 2,
                    textAlign: 'center',
                  }}
                >
                  No cards added yet.
                </Box>
              ) : null}
              {getCarouselSlots(form, 'haveYouSeenCards').map((card, index) => (
                <CarouselSlideField
                  index={index}
                  itemLabel="Card"
                  key={`have-you-seen-card-${index}`}
                  onClearImage={() => clearCarouselImage('haveYouSeenCards', index)}
                  onImageChange={(file) => setCarouselImage('haveYouSeenCards', index, file)}
                  onRemove={() => removeCarouselSlide('haveYouSeenCards', index)}
                  onTextChange={(text) => setCarouselText('haveYouSeenCards', index, text)}
                  slide={card}
                />
              ))}
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions
          sx={{
            borderTop: 1,
            borderColor: 'divider',
            gap: 1,
            px: { sm: 4, xs: 2.5 },
            py: 2,
          }}
        >
          <AppButton color="inherit" onClick={closeDialog} variant="outlined">
            Cancel
          </AppButton>
          <AppButton disabled={saveMutation.isPending} onClick={handleSave}>
            {editingId ? 'Save changes' : 'Save segment'}
          </AppButton>
        </DialogActions>
      </Dialog>
      <Dialog
        fullWidth
        maxWidth="xs"
        onClose={() => setDeleteTarget(null)}
        open={Boolean(deleteTarget)}
      >
        <DialogTitle>Delete page segment?</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">Delete {deleteTarget?.title}?</Typography>
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
    </>
  );
};
