import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import { Card, CardContent, FormControlLabel, Grid, Stack, Switch, TextField, Typography } from '@mui/material';
import { useState } from 'react';

import { AppButton } from '@shared/components/ui/Button/AppButton';
import { PageSection } from '@shared/components/ui/SectionTitle/PageSection';
import { mockTenant } from '@shared/lib/mockData';

export const SettingsPage = () => {
  const [settings, setSettings] = useState({
    deliveryEnabled: true,
    freeDeliveryThreshold: '50',
    lowStockThreshold: '20',
    primaryColor: mockTenant.branding.primaryColor,
    storeName: mockTenant.name,
  });
  const [savedAt, setSavedAt] = useState<string | null>(null);

  return (
    <PageSection
      action={
        <AppButton onClick={() => setSavedAt(new Date().toLocaleTimeString())} startIcon={<SaveRoundedIcon />}>
          Save settings
        </AppButton>
      }
      description="Update local tenant branding, fulfillment rules, and operational defaults."
      title="Settings"
    >
      <Grid container spacing={3}>
        <Grid size={{ md: 6, xs: 12 }}>
          <Card sx={{ borderRadius: 1 }}>
            <CardContent>
              <Typography variant="h6">Branding</Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                <TextField
                  label="Store name"
                  onChange={(event) => setSettings((current) => ({ ...current, storeName: event.target.value }))}
                  value={settings.storeName}
                />
                <TextField
                  label="Primary color"
                  onChange={(event) => setSettings((current) => ({ ...current, primaryColor: event.target.value }))}
                  type="color"
                  value={settings.primaryColor}
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ md: 6, xs: 12 }}>
          <Card sx={{ borderRadius: 1 }}>
            <CardContent>
              <Typography variant="h6">Operations</Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.deliveryEnabled}
                      onChange={(event) =>
                        setSettings((current) => ({ ...current, deliveryEnabled: event.target.checked }))
                      }
                    />
                  }
                  label="Accept delivery orders"
                />
                <TextField
                  label="Free delivery threshold"
                  onChange={(event) =>
                    setSettings((current) => ({ ...current, freeDeliveryThreshold: event.target.value }))
                  }
                  type="number"
                  value={settings.freeDeliveryThreshold}
                />
                <TextField
                  label="Low stock alert threshold"
                  onChange={(event) =>
                    setSettings((current) => ({ ...current, lowStockThreshold: event.target.value }))
                  }
                  type="number"
                  value={settings.lowStockThreshold}
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Card sx={{ borderRadius: 1 }}>
            <CardContent>
              <Typography variant="h6">Demo Account</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }} variant="body2">
                Admin login is available with admin@demo.com and password123. Changes on this dashboard are
                stored in page state for safe demo testing.
              </Typography>
              {savedAt ? (
                <Typography color="success.main" sx={{ mt: 2 }} variant="body2">
                  Settings saved in this browser session at {savedAt}.
                </Typography>
              ) : null}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </PageSection>
  );
};
