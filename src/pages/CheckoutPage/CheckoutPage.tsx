import { Stack } from '@mui/material';

import { PageSection } from '@shared/components/ui/SectionTitle/PageSection';
import { CheckoutSections } from '@widgets/CheckoutSections/CheckoutSections';

export const CheckoutPage = () => (
  <Stack spacing={4}>
    <PageSection
      description="Prepared for payment providers, shipping calculations, address validation, and order placement workflows."
      title="Checkout"
    >
      <CheckoutSections />
    </PageSection>
  </Stack>
);
