import { apiClient } from '@shared/api/axios';
import { endpoints } from '@shared/api/endpoints';
import { tenantService } from '@services/tenant/tenant.service';
import type { Tenant } from '@entities/tenant/types/tenant.types';
import type { ApiResponse } from '../../../types/api';

type BackendTenant = Omit<Tenant, 'id' | 'tenantId'> & {
  _id: string;
  tenantId?: string;
};

type TenantPayload = Omit<Tenant, 'id' | 'databaseName' | 'tenantId'> & {
  databaseName?: string;
};

const systemAdminConfig = { headers: { 'x-skip-tenant-id': 'true' } };

const mapTenant = ({ _id, tenantId, ...tenant }: BackendTenant): Tenant => {
  const fixedTenantId = tenantId ?? _id;

  return {
    ...tenant,
    id: _id,
    tenantId: fixedTenantId,
  };
};

export const tenantApi = {
  activateTenant(tenant: Tenant, rememberMe = false) {
    tenantService.setTenant(tenant, rememberMe);
  },
  async createTenant(payload: TenantPayload) {
    const response = await apiClient.post<ApiResponse<BackendTenant>>(
      endpoints.tenants.create,
      payload,
      systemAdminConfig,
    );

    const tenant = mapTenant(response.data.data);
    tenantService.setTenant(tenant);

    return { ...response.data, data: tenant };
  },
  async deleteTenant(tenantId: string) {
    return (
      await apiClient.delete<ApiResponse<{ tenantId: string }>>(
        endpoints.tenants.details(tenantId),
        systemAdminConfig,
      )
    ).data;
  },
  async getTenant(tenantId: string, options: { signal?: globalThis.AbortSignal } = {}) {
    const response = await apiClient.get<ApiResponse<BackendTenant>>(
      endpoints.tenants.details(tenantId),
      {
        ...systemAdminConfig,
        signal: options.signal,
      },
    );

    return mapTenant(response.data.data);
  },
  async listTenants(options: { signal?: globalThis.AbortSignal } = {}) {
    const response = await apiClient.get<ApiResponse<BackendTenant[]>>(endpoints.tenants.list, {
      ...systemAdminConfig,
      signal: options.signal,
    });

    return response.data.data.map(mapTenant);
  },
  async updateTenant(tenantId: string, payload: Omit<Partial<TenantPayload>, 'slug'>) {
    const response = await apiClient.put<ApiResponse<BackendTenant>>(
      endpoints.tenants.details(tenantId),
      payload,
      systemAdminConfig,
    );

    return { ...response.data, data: mapTenant(response.data.data) };
  },
};
