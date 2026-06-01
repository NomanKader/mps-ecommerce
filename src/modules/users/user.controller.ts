import { Request, Response } from 'express';

import { BaseController } from '@core/base/BaseController';
import { HTTP_STATUS } from '@core/response/http-status';
import { UserService } from '@modules/users/user.service';
import { asyncHandler } from '@utils/asyncHandler';
import { hashPassword } from '@utils/password';

export class UserController extends BaseController {
  constructor(private readonly userService = new UserService()) {
    super();
  }

  list = asyncHandler(async (req: Request, res: Response) => {
    const users = await this.userService.listUsers(req.tenant?.tenantId);
    this.ok(res, users, 'Users fetched');
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.userService.createUser({
      ...req.body,
      password: await hashPassword(req.body.password)
    });

    const { password: _password, ...safeUser } = user;
    this.ok(res, safeUser, 'User created', HTTP_STATUS.CREATED);
  });
}
