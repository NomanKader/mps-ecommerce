import type { MyanmarLocationOption } from '@entities/location/types/location.types';
import { apiClient } from '@shared/api/axios';
import { endpoints } from '@shared/api/endpoints';
import type { ApiResponse } from '../../../types/api';

type RawMyanmarCityOption = string | {
  name?: string;
  townships?: string[];
};

type RawMyanmarLocationOption = {
  cities?: RawMyanmarCityOption[];
  region: string;
  townships?: string[];
};

const normalizeMyanmarLocation = (location: RawMyanmarLocationOption): MyanmarLocationOption => {
  const townships = Array.isArray(location.townships) ? location.townships.filter(Boolean) : [];
  const cities = Array.isArray(location.cities)
    ? location.cities
      .map((city) => {
        if (typeof city === 'string') {
          return { name: city, townships };
        }

        return {
          name: city.name ?? '',
          townships: Array.isArray(city.townships) && city.townships.length ? city.townships.filter(Boolean) : townships,
        };
      })
      .filter((city) => city.name)
    : [];

  return {
    cities,
    region: location.region,
    townships,
  };
};

const isYangonLocation = (location: MyanmarLocationOption) =>
  location.region === 'Yangon' || location.region === 'Yangon Region';

const normalizeServiceLocation = (location: MyanmarLocationOption): MyanmarLocationOption => ({
  ...location,
  region: location.region === 'Yangon Region' ? 'Yangon' : location.region,
});

export const locationApi = {
  async listMyanmarLocations(options: { signal?: globalThis.AbortSignal } = {}) {
    const response = await apiClient.get<ApiResponse<RawMyanmarLocationOption[]>>(
      endpoints.locations.myanmar,
      { signal: options.signal },
    );

    return response.data.data
      .map(normalizeMyanmarLocation)
      .filter(isYangonLocation)
      .map(normalizeServiceLocation);
  },
};
