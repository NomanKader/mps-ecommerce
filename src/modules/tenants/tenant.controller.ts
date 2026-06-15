import { Request, Response } from 'express';

import { BaseController } from '@core/base/BaseController';
import { TenantService } from '@modules/tenants/tenant.service';
import { UserService } from '@modules/users/user.service';
import { asyncHandler } from '@utils/asyncHandler';
import { HTTP_STATUS } from '@core/response/http-status';

const routeTenantId = (req: Request): string => String(req.params.tenantId);

export class TenantController extends BaseController {
  constructor(
    private readonly tenantService = new TenantService(),
    private readonly userService = new UserService()
  ) {
    super();
  }

  list = asyncHandler(async (_req: Request, res: Response) => {
    const tenants = await this.tenantService.listTenants();
    this.ok(res, tenants, 'Tenants fetched');
  });

  get = asyncHandler(async (req: Request, res: Response) => {
    const tenant = await this.tenantService.getTenant(routeTenantId(req));
    this.ok(res, tenant, 'Tenant fetched');
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const tenant = await this.tenantService.createTenant(req.body);
    this.ok(res, tenant, 'Tenant created', HTTP_STATUS.CREATED);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const tenant = await this.tenantService.updateTenant(routeTenantId(req), req.body);
    this.ok(res, tenant, 'Tenant updated');
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const tenant = await this.tenantService.deleteTenant(routeTenantId(req));
    this.ok(res, tenant, 'Tenant deleted');
  });

  createAdmin = asyncHandler(async (req: Request, res: Response) => {
    const admin = await this.userService.createTenantAdmin(req.body, req.params.tenantId as string | undefined);
    this.ok(res, admin, 'Tenant admin created', HTTP_STATUS.CREATED);
  });
}
