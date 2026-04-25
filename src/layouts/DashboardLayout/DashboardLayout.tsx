import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { AppBar, Box, IconButton, Stack, Toolbar, Typography } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';

import { PageContainer } from '@shared/components/ui/PageContainer/PageContainer';
import { Sidebar } from '@widgets/Sidebar/Sidebar';
import { createRouteLabel } from '@shared/utils';

const sidebarWidth = 280;

export const DashboardLayout = () => {
  const location = useLocation();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, ml: { md: `${sidebarWidth}px`, xs: 0 } }}>
        <AppBar color="transparent" position="sticky">
          <Toolbar
            sx={{
              backdropFilter: 'blur(20px)',
              backgroundColor: 'rgba(244, 247, 245, 0.88)',
              borderBottom: '1px solid',
              borderColor: 'divider',
              justifyContent: 'space-between',
            }}
          >
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <IconButton sx={{ display: { md: 'none' } }}>
                <MenuRoundedIcon />
              </IconButton>
              <Box>
                <Typography variant="h6">{createRouteLabel(location.pathname)}</Typography>
                <Typography color="text.secondary" variant="body2">
                  Tenant operations, merchandising, and SaaS controls
                </Typography>
              </Box>
            </Stack>
          </Toolbar>
        </AppBar>
        <PageContainer>
          <Outlet />
        </PageContainer>
      </Box>
    </Box>
  );
};
