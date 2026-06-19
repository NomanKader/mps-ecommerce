import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import { Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { useSelector } from 'react-redux';

import { PageSection } from '@shared/components/ui/SectionTitle/PageSection';
import type { RootState } from '@store/index';

export const AccountPage = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const tenant = useSelector((state: RootState) => state.tenant.activeTenant);

  return (
    <PageSection
      description="Account foundation prepared for profile management, saved addresses, preferences, and customer security controls."
      title="Account"
    >
      <Card sx={{ borderRadius: 1 }}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6">
              {user ? `${user.firstName} ${user.lastName}` : 'Guest User'}
            </Typography>
            <Typography color="text.secondary">
              {user?.email ?? 'Sign in to load account data.'}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Chip icon={<ShieldOutlinedIcon />} label={`Role: ${user?.role ?? 'customer'}`} />
              <Chip label={`Tenant: ${tenant?.name ?? 'N/A'}`} />
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </PageSection>
  );
};
