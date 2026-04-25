import { Card, CardContent, Typography } from '@mui/material';

import { PageSection } from '@shared/components/ui/SectionTitle/PageSection';

export const CustomersPage = () => (
  <PageSection
    description="Prepared for CRM-style customer segmentation, loyalty, support notes, and lifecycle automation."
    title="Customers"
  >
    <Card sx={{ borderRadius: 4 }}>
      <CardContent>
        <Typography color="text.secondary">
          Customer management module placeholder ready for future APIs and entity expansion.
        </Typography>
      </CardContent>
    </Card>
  </PageSection>
);
