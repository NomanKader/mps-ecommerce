import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { AppBar, Avatar, Box, Button, IconButton, Stack, Toolbar, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';

import { PageContainer } from '@shared/components/ui/PageContainer/PageContainer';
import { Sidebar } from '@widgets/Sidebar/Sidebar';
import { createRouteLabel } from '@shared/utils';
import { useSignOut } from '@features/auth/hooks/useSignOut';
import type { RootState } from '@store/index';
import logoImage from '@assets/images/logo.png';
import { AdminProfileDialog } from './AdminProfileDialog';

export const DashboardLayout = () => {
  const signOut = useSignOut();
  const location = useLocation();
  const user = useSelector((state: RootState) => state.auth.user);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const userInitial = user?.firstName?.charAt(0).toUpperCase() ?? 'A';
  const userName = user ? `${user.firstName} ${user.lastName}` : 'Admin';
  const appLogoUrl = user?.logoUrl || logoImage;

  return (
    <Box
      className="admin-liquid-glass"
      sx={{
        background:
          'linear-gradient(135deg, rgba(255, 255, 255, 0.78) 0%, rgba(255, 248, 236, 0.84) 42%, rgba(255, 237, 229, 0.78) 100%)',
        bgcolor: 'background.default',
        display: 'flex',
        minHeight: '100vh',
        overflowX: 'hidden',
        position: 'relative',
        '&::before': {
          background:
            'linear-gradient(120deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.18) 32%, rgba(198,37,31,0.08) 100%)',
          content: '""',
          inset: 0,
          pointerEvents: 'none',
          position: 'fixed',
        },
      }}
    >
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <Box
        sx={{
          flexGrow: 1,
          maxWidth: { md: 'calc(100% - 280px)', xs: '100%' },
          minWidth: 0,
          overflowX: 'hidden',
          width: { md: 'calc(100% - 280px)', xs: '100%' },
        }}
      >
        <AppBar
          color="transparent"
          elevation={0}
          position="fixed"
          sx={{
            left: { md: 280, xs: 0 },
            top: 0,
            width: { md: 'calc(100% - 280px)', xs: '100%' },
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
        >
          <Toolbar
            sx={{
              backdropFilter: 'blur(24px) saturate(145%)',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.72), rgba(255,247,239,0.46))',
              borderBottom: '1px solid rgba(255, 255, 255, 0.62)',
              boxShadow: '0 18px 42px rgba(88, 38, 25, 0.08)',
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
                alt="AV's Store"
                component="img"
                src={appLogoUrl}
                sx={{
                  display: { md: 'none', xs: 'block' },
                  height: 44,
                  maxWidth: 76,
                  objectFit: 'contain',
                }}
              />
              <Box sx={{ display: { sm: 'block', xs: 'none' }, minWidth: 0 }}>
                <Typography noWrap variant="h6">
                  {createRouteLabel(location.pathname)}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Tenant operations and merchandising
                </Typography>
              </Box>
            </Stack>
            <Stack
              direction="row"
              spacing={{ sm: 1.5, xs: 1 }}
              sx={{ alignItems: 'center', minWidth: 0 }}
            >
              <Button
                color="inherit"
                onClick={() => setIsUserManagementOpen(true)}
                sx={{
                  borderRadius: 1,
                  gap: 1.25,
                  justifyContent: 'flex-start',
                  minWidth: 0,
                  p: 0.75,
                  textTransform: 'none',
                }}
              >
                <Avatar sx={{ bgcolor: 'primary.main', height: 36, width: 36 }}>
                  {userInitial}
                </Avatar>
                <Box sx={{ display: { sm: 'block', xs: 'none' }, textAlign: 'left' }}>
                  <Typography variant="body2">{userName}</Typography>
                  <Typography color="text.secondary" variant="caption">
                    Tenant admin
                  </Typography>
                </Box>
              </Button>
              <Button
                color="inherit"
                onClick={() => void signOut()}
                startIcon={<LogoutRoundedIcon />}
                sx={{
                  borderRadius: 999,
                  minWidth: { xs: 40, sm: 96 },
                  px: { xs: 1, sm: 2 },
                  textTransform: 'none',
                }}
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
            maxWidth: '100%',
            minWidth: 0,
            overflowX: 'hidden',
            pt: { md: 13, xs: 10.5 },
            px: { lg: 4, sm: 3, xs: 2 },
            pb: { md: 4, xs: 2.5 },
            scrollMarginTop: { md: 88, xs: 72 },
          }}
        >
          <Outlet />
        </PageContainer>
      </Box>
      <AdminProfileDialog
        onClose={() => setIsUserManagementOpen(false)}
        open={isUserManagementOpen}
      />
    </Box>
  );
};
