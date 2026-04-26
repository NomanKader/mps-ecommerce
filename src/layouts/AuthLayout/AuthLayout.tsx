import { Box } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

import { HomePage } from '@pages/HomePage/HomePage';
import { routePaths } from '@routes/routePaths';
import { PageContainer } from '@shared/components/ui/PageContainer/PageContainer';
import { storefrontShellSx } from '@shared/styles/storefront';
import { AuthDrawer } from '@widgets/AuthDrawer/AuthDrawer';
import { Footer } from '@widgets/Footer/Footer';
import { Header } from '@widgets/Header/Header';

export const AuthLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialMode = location.pathname === routePaths.auth.register ? 'register' : 'login';

  return (
    <Box sx={{ ...storefrontShellSx, minHeight: '100vh' }}>
      <Header />
      <PageContainer sx={{ py: { md: 4, xs: 2.5 } }}>
        <HomePage />
      </PageContainer>
      <Footer />
      <AuthDrawer
        initialMode={initialMode}
        onClose={() => {
          void navigate(routePaths.home);
        }}
        open
      />
    </Box>
  );
};
