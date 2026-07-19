import { Box } from '@mui/material';
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { PageContainer } from '@shared/components/ui/PageContainer/PageContainer';
import { storefrontShellSx } from '@shared/styles/storefront';
import { Footer } from '@widgets/Footer/Footer';
import { Header } from '@widgets/Header/Header';

const lastStorefrontPathKey = 'avs:last-storefront-path';

export const MainLayout = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/auth')) {
      return;
    }

    sessionStorage.setItem(
      lastStorefrontPathKey,
      `${location.pathname}${location.search}${location.hash}`,
    );
  }, [location.hash, location.pathname, location.search]);

  return (
    <Box sx={{ ...storefrontShellSx, minHeight: '100vh', pb: { md: 0, xs: 16 } }}>
      <Header />
      <PageContainer sx={{ py: { md: 4, xs: 2.5 } }}>
        <Outlet />
      </PageContainer>
      <Footer />
    </Box>
  );
};
