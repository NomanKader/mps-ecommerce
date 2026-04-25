import { Card, CardContent, Typography } from '@mui/material';

import { PageSection } from '@shared/components/ui/SectionTitle/PageSection';

export const PromotionsPage = () => (
  <PageSection
    description="Prepared for coupon engines, campaign scheduling, bundle offers, and tenant-specific promotion strategies."
    title="Promotions"
  >
    <Card sx={{ borderRadius: 4 }}>
      <CardContent>
        <Typography color="text.secondary">
          Promotions foundation is reserved for future pricing and campaign features.
        </Typography>
      </CardContent>
    </Card>
  </PageSection>
);
