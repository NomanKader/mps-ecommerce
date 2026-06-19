import { Request, Response } from 'express';

import { BaseController } from '@core/base/BaseController';
import { HTTP_STATUS } from '@core/response/http-status';
import { UserService } from '@modules/users/user.service';
import { asyncHandler } from '@utils/asyncHandler';

export class UserController extends BaseController {
  constructor(private readonly userService = new UserService()) {
    super();
  }

  list = asyncHandler(async (req: Request, res: Response) => {
    const users = await this.userService.listUsers(req.tenant?.tenantId);
    this.ok(res, users, 'Users fetched');
  });

  listTenantDashboardUsers = asyncHandler(async (req: Request, res: Response) => {
    const users = await this.userService.listTenantDashboardUsers(req.tenant?.tenantId);
    this.ok(res, users, 'Dashboard users fetched');
  });

  createTenantDashboardUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.userService.createTenantDashboardUser(req.tenant?.tenantId, req.body);
    this.ok(res, user, 'Dashboard user created', HTTP_STATUS.CREATED);
  });

  updateTenantDashboardUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.userService.updateTenantDashboardUser(
      req.tenant?.tenantId,
      String(req.params.id),
      req.auth?.userId,
      req.body
    );
    this.ok(res, user, 'Dashboard user updated');
  });

  deleteTenantDashboardUser = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.userService.deleteTenantDashboardUser(
      req.tenant?.tenantId,
      String(req.params.id),
      req.auth?.userId
    );
    this.ok(res, result, 'Dashboard user deleted');
  });

  createSystemUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.userService.createSystemUser(req.body);
    this.ok(res, user, 'System user created', HTTP_STATUS.CREATED);
  });
}
