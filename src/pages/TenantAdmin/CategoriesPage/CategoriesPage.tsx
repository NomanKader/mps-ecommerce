import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, Grid, Typography } from '@mui/material';

import { categoryApi } from '@features/category/api/categoryApi';
import { PageSection } from '@shared/components/ui/SectionTitle/PageSection';

export const CategoriesPage = () => {
  const { data = [] } = useQuery({
    queryFn: categoryApi.getCategories,
    queryKey: ['categories'],
  });

  return (
    <PageSection
      description="Prepared for category hierarchy management, merchandising rules, and tenant-specific assortment."
      title="Categories"
    >
      <Grid container spacing={3}>
        {data.map((category) => (
          <Grid key={category.id} size={{ md: 4, xs: 12 }}>
            <Card sx={{ borderRadius: 4 }}>
              <CardContent>
                <Typography variant="h6">{category.name}</Typography>
                <Typography color="text.secondary" variant="body2">
                  {category.itemCount} items
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </PageSection>
  );
};
