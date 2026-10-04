import { useQuery } from '@tanstack/react-query';

import { locationApi } from '@features/locations/api/locationApi';
import { yangonLocationFallback } from '@features/locations/data/myanmarLocations';

export const useMyanmarLocations = () =>
  useQuery({
    queryFn: ({ signal }) => locationApi.listMyanmarLocations({ signal }),
    queryKey: ['locations', 'myanmar'],
    placeholderData: yangonLocationFallback,
  });
