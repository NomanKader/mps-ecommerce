import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';

import { PageContainer } from '@shared/components/ui/PageContainer/PageContainer';
import { storefrontShellSx } from '@shared/styles/storefront';
import { Footer } from '@widgets/Footer/Footer';
import { Header } from '@widgets/Header/Header';

export const MainLayout = () => (
  <Box sx={{ ...storefrontShellSx, minHeight: '100vh', pb: { md: 0, xs: 16 } }}>
    <Header />
    <PageContainer sx={{ py: { md: 4, xs: 2.5 } }}>
      <Outlet />
    </PageContainer>
    <Footer />
  </Box>
);
