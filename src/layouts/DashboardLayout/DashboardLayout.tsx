import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { AppBar, Avatar, Box, Button, IconButton, Stack, Toolbar, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

import { PageContainer } from '@shared/components/ui/PageContainer/PageContainer';
import { Sidebar } from '@widgets/Sidebar/Sidebar';
import { createRouteLabel } from '@shared/utils';
import { authService } from '@services/auth/auth.service';
import { routePaths } from '@routes/routePaths';
import type { RootState } from '@store/index';
import { useAppDispatch } from '@store/hooks';
import { clearSession } from '@store/slices/auth.slice';
import logoImage from '@assets/images/kibs_flag_logo_en.png';

export const DashboardLayout = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = () => {
    authService.signOut();
    dispatch(clearSession());
    void navigate(routePaths.auth.login);
  };

  return (
    <Box sx={{ bgcolor: 'background.default', display: 'flex', minHeight: '100vh', overflowX: 'hidden' }}>
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <Box
        sx={{
          flexGrow: 1,
          minWidth: 0,
          width: { xs: '100%' },
        }}
      >
        <AppBar color="transparent" position="sticky">
          <Toolbar
            sx={{
              backdropFilter: 'blur(20px)',
              backgroundColor: 'rgba(244, 247, 245, 0.88)',
              borderBottom: '1px solid',
              borderColor: 'divider',
              gap: 2,
              justifyContent: 'space-between',
              minHeight: { md: 72, xs: 64 },
              px: { lg: 4, sm: 3, xs: 2 },
            }}
          >
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <IconButton onClick={() => setMobileOpen(true)} sx={{ display: { md: 'none' } }}>
                <MenuRoundedIcon />
              </IconButton>
              <Box
                alt="MPS Commerce"
                component="img"
                src={logoImage}
                sx={{ display: { md: 'none', xs: 'block' }, height: 32, maxWidth: 116, objectFit: 'contain' }}
              />
              <Box sx={{ display: { sm: 'block', xs: 'none' }, minWidth: 0 }}>
                <Typography noWrap variant="h6">
                  {createRouteLabel(location.pathname)}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Tenant operations, merchandising, and SaaS controls
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={{ sm: 1.5, xs: 1 }} sx={{ alignItems: 'center', minWidth: 0 }}>
              <Avatar sx={{ bgcolor: 'primary.main', height: 36, width: 36 }}>
                {user?.firstName?.[0] ?? 'A'}
              </Avatar>
              <Box sx={{ display: { sm: 'block', xs: 'none' } }}>
                <Typography variant="body2">
                  {user ? `${user.firstName} ${user.lastName}` : 'Admin'}
                </Typography>
                <Typography color="text.secondary" variant="caption">
                  Demo tenant admin
                </Typography>
              </Box>
              <Button
                color="inherit"
                onClick={handleSignOut}
                startIcon={<LogoutRoundedIcon />}
                sx={{ borderRadius: 999, minWidth: { xs: 40, sm: 96 }, px: { xs: 1, sm: 2 }, textTransform: 'none' }}
              >
                <Box component="span" sx={{ display: { sm: 'inline', xs: 'none' } }}>
                  Sign out
                </Box>
              </Button>
            </Stack>
          </Toolbar>
        </AppBar>
        <PageContainer
          maxWidth={false}
          sx={{
            px: { lg: 4, sm: 3, xs: 2 },
            py: { md: 4, xs: 2.5 },
          }}
        >
          <Outlet />
        </PageContainer>
      </Box>
    </Box>
  );
};
