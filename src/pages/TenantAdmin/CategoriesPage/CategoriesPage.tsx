import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import {
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';

import type { Category } from '@entities/category/types/category.types';
import { AppButton } from '@shared/components/ui/Button/AppButton';
import { PageSection } from '@shared/components/ui/SectionTitle/PageSection';
import { mockCategories } from '@shared/lib/mockData';

export const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [name, setName] = useState('');

  const saveCategory = () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    if (editingId) {
      setCategories((current) =>
        current.map((category) =>
          category.id === editingId
            ? { ...category, name: trimmedName, slug: trimmedName.toLowerCase().replaceAll(' ', '-') }
            : category,
        ),
      );
    } else {
      setCategories((current) => [
        {
          id: `cat-${Date.now()}`,
          itemCount: 0,
          name: trimmedName,
          slug: trimmedName.toLowerCase().replaceAll(' ', '-'),
        },
        ...current,
      ]);
    }

    setEditingId(null);
    setName('');
    setIsCategoryDialogOpen(false);
  };

  return (
    <PageSection
      action={
        <AppButton
          onClick={() => {
            setEditingId(null);
            setName('');
            setIsCategoryDialogOpen(true);
          }}
          startIcon={<AddRoundedIcon />}
        >
          New category
        </AppButton>
      }
      description="Manage storefront categories and demo assortment counts."
      title="Categories"
    >
      <Grid container spacing={2}>
        {categories.map((category) => (
          <Grid key={category.id} size={{ lg: 4, md: 6, xs: 12 }}>
            <Card sx={{ borderRadius: 1, height: '100%' }}>
              <CardContent>
                <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <Stack spacing={0.5}>
                    <Typography variant="h6">{category.name}</Typography>
                    <Typography color="text.secondary" variant="body2">
                      {category.itemCount} items
                    </Typography>
                    <Typography color="text.secondary" variant="caption">
                      /{category.slug}
                    </Typography>
                  </Stack>
                  <Stack direction="row">
                    <IconButton
                      aria-label={`Edit ${category.name}`}
                      onClick={() => {
                        setEditingId(category.id);
                        setName(category.name);
                        setIsCategoryDialogOpen(true);
                      }}
                    >
                      <EditRoundedIcon />
                    </IconButton>
                    <IconButton
                      aria-label={`Delete ${category.name}`}
                      onClick={() => setCategories((current) => current.filter((item) => item.id !== category.id))}
                    >
                      <DeleteOutlineRoundedIcon />
                    </IconButton>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        fullWidth
        maxWidth="xs"
        onClose={() => setIsCategoryDialogOpen(false)}
        open={isCategoryDialogOpen}
      >
        <DialogTitle>{editingId ? 'Edit Category' : 'Create Category'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Category name"
            onChange={(event) => setName(event.target.value)}
            sx={{ mt: 1 }}
            value={name}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <AppButton color="inherit" onClick={() => setIsCategoryDialogOpen(false)} variant="outlined">
            Cancel
          </AppButton>
          <AppButton onClick={saveCategory}>{editingId ? 'Save category' : 'Add category'}</AppButton>
        </DialogActions>
      </Dialog>
    </PageSection>
  );
};
