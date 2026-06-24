import type { CustomerAddress, CustomerAddressPayload } from '@entities/address/types/address.types';
import { apiClient } from '@shared/api/axios';
import { endpoints } from '@shared/api/endpoints';
import type { ApiResponse } from '../../../types/api';

type BackendAddress = Omit<CustomerAddress, 'id'> & {
  _id: string;
};

const mapAddress = ({ _id, ...address }: BackendAddress): CustomerAddress => ({
  ...address,
  id: _id,
});

export const addressApi = {
  async list(options: { signal?: globalThis.AbortSignal } = {}) {
    const response = await apiClient.get<ApiResponse<BackendAddress[]>>(endpoints.addresses.list, {
      signal: options.signal,
    });

    return response.data.data.map(mapAddress);
  },
  async create(payload: CustomerAddressPayload) {
    const response = await apiClient.post<ApiResponse<BackendAddress>>(
      endpoints.addresses.list,
      payload,
    );

    return mapAddress(response.data.data);
  },
  async update(id: string, payload: Partial<CustomerAddressPayload>) {
    const response = await apiClient.put<ApiResponse<BackendAddress>>(
      endpoints.addresses.item(id),
      payload,
    );

    return mapAddress(response.data.data);
  },
  async remove(id: string) {
    await apiClient.delete<ApiResponse<{ id: string }>>(endpoints.addresses.item(id));
  },
};
