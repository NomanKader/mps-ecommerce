import { BaseRepository } from '@core/base/BaseRepository';
import { TenantModel } from '@modules/tenants/tenant.model';
import { Tenant } from '@modules/tenants/tenant.types';

export class TenantRepository extends BaseRepository<Tenant> {
  constructor() {
    super(TenantModel);
  }

  async update(filter: Record<string, unknown>, payload: Partial<Tenant>): Promise<Tenant | null> {
    return this.model.findOneAndUpdate(filter, payload, { new: true }).lean<Tenant | null>().exec();
  }
}
