import { BaseRepository } from '@core/base/BaseRepository';
import { TenantModel } from '@modules/tenants/tenant.model';
import { Tenant } from '@modules/tenants/tenant.types';

export class TenantRepository extends BaseRepository<Tenant> {
  constructor() {
    super(TenantModel);
  }
}
