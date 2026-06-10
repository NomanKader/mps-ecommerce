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

  createSystemUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.userService.createSystemUser(req.body);
    this.ok(res, user, 'System user created', HTTP_STATUS.CREATED);
  });
}
