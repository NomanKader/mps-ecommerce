import { Box, Typography } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';
import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

import logoImage from '@assets/images/logo.png';
import { storefrontColors } from '@app/providers/theme/tokens';
import { categoryApi } from '@features/category/api/categoryApi';
import { merchandisingApi } from '@features/home/api/merchandisingApi';
import { productApi } from '@features/product/api/productApi';

type BackendLoadingGateProps = {
  children: ReactNode;
};

const pulse = keyframes`
  0%, 100% {
    transform: scale(0.92);
    opacity: 0.62;
  }
  50% {
    transform: scale(1.08);
    opacity: 1;
  }
`;

const orbit = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

let startupPreloadPromise: Promise<void> | null = null;

const preloadStartupData = (queryClient: QueryClient) => {
  startupPreloadPromise ??= Promise.allSettled([
    queryClient.prefetchQuery({
      queryFn: ({ signal }) => merchandisingApi.getHeaderSettings({ signal }),
      queryKey: ['storefront', 'header-settings'],
    }),
    queryClient.prefetchQuery({
      queryFn: ({ signal }) => merchandisingApi.listStorefrontCategories({ signal }),
      queryKey: ['storefront', 'categories'],
    }),
    queryClient.prefetchQuery({
      queryFn: ({ signal }) => merchandisingApi.listStorefrontCarousel('hero', { signal }),
      queryKey: ['storefront', 'carousel', 'hero'],
    }),
    queryClient.prefetchQuery({
      queryFn: ({ signal }) => merchandisingApi.listStorefrontCarousel('showcase', { signal }),
      queryKey: ['storefront', 'carousel', 'showcase'],
    }),
    queryClient.prefetchQuery({
      queryFn: ({ signal }) => merchandisingApi.listStorefrontSecondaryCategories({ signal }),
      queryKey: ['storefront', 'secondary-categories'],
    }),
    queryClient.prefetchQuery({
      queryFn: ({ signal }) => merchandisingApi.listStorefrontIcons('merchandising', { signal }),
      queryKey: ['storefront', 'icons', 'merchandising'],
    }),
    queryClient.prefetchQuery({
      queryFn: ({ signal }) => merchandisingApi.listStorefrontProductSections({ signal }),
      queryKey: ['storefront', 'product-sections'],
    }),
    queryClient.prefetchQuery({
      queryFn: ({ signal }) => productApi.getProducts({ signal }),
      queryKey: ['products'],
    }),
    queryClient.prefetchQuery({
      queryFn: ({ signal }) => categoryApi.getCategories({ signal }),
      queryKey: ['categories'],
    }),
  ]).then(() => undefined);

  return startupPreloadPromise;
};

export const BackendLoadingGate = ({ children }: BackendLoadingGateProps) => {
  const queryClient = useQueryClient();
  const [isStartupLoading, setIsStartupLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    preloadStartupData(queryClient).finally(() => {
      if (isActive) {
        setIsStartupLoading(false);
      }
    });

    return () => {
      isActive = false;
    };
  }, [queryClient]);

  return (
    <>
      {children}
      {isStartupLoading ? (
        <Box
          aria-busy="true"
          aria-live="polite"
          role="status"
          sx={{
            alignItems: 'center',
            backgroundColor: storefrontColors.surface,
            display: 'flex',
            inset: 0,
            justifyContent: 'center',
            position: 'fixed',
            zIndex: 9999,
          }}
        >
          <Box
            sx={{
              alignItems: 'center',
              display: 'grid',
              gap: 2,
              justifyItems: 'center',
            }}
          >
            <Box
              sx={{
                alignItems: 'center',
                display: 'grid',
                height: 112,
                justifyItems: 'center',
                position: 'relative',
                width: 112,
              }}
            >
              <Box
                sx={{
                  animation: `${orbit} 1.05s linear infinite`,
                  border: `4px solid ${alpha(storefrontColors.navy, 0.12)}`,
                  borderRadius: '50%',
                  borderTopColor: storefrontColors.accent,
                  inset: 0,
                  position: 'absolute',
                }}
              />
              <Box
                component="img"
                src={logoImage}
                sx={{
                  animation: `${pulse} 1.15s ease-in-out infinite`,
                  height: 66,
                  objectFit: 'contain',
                  width: 66,
                }}
              />
            </Box>
            <Typography
              sx={{
                color: storefrontColors.navy,
                fontSize: '0.95rem',
                fontWeight: 800,
              }}
            >
              Loading
            </Typography>
          </Box>
        </Box>
      ) : null}
    </>
  );
};
