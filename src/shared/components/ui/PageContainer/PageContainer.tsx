import { Container, type ContainerProps } from '@mui/material';
import type { ReactNode } from 'react';

type PageContainerProps = ContainerProps & {
  children: ReactNode;
};

export const PageContainer = ({ children, maxWidth = 'xl', ...props }: PageContainerProps) => (
  <Container maxWidth={maxWidth} sx={{ py: { md: 5, xs: 3 } }} {...props}>
    {children}
  </Container>
);
