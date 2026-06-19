import { useQuery } from '@tanstack/react-query';

import { productApi } from '@features/product/api/productApi';

export const useProducts = () =>
  useQuery({
    queryFn: ({ signal }) => productApi.getProducts({ signal }),
    queryKey: ['products'],
  });
