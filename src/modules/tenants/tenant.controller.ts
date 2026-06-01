import { Request, Response } from 'express';

import { BaseController } from '@core/base/BaseController';
import { TenantService } from '@modules/tenants/tenant.service';
import { asyncHandler } from '@utils/asyncHandler';

export class TenantController extends BaseController {
  constructor(private readonly tenantService = new TenantService()) {
    super();
  }

  list = asyncHandler(async (_req: Request, res: Response) => {
    const tenants = await this.tenantService.listTenants();
    this.ok(res, tenants, 'Tenants fetched');
  });
}
