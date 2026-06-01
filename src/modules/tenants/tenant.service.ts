import { BaseService } from '@core/base/BaseService';
import { TenantRepository } from '@modules/tenants/tenant.repository';
import { Tenant } from '@modules/tenants/tenant.types';

export class TenantService extends BaseService {
  constructor(private readonly tenantRepository = new TenantRepository()) {
    super();
  }

  async listTenants(): Promise<Tenant[]> {
    return this.tenantRepository.find();
  }
}
