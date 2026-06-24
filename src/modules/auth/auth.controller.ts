import { Request, Response } from 'express';

import { BaseController } from '@core/base/BaseController';
import { HTTP_STATUS } from '@core/response/http-status';
import { AuthService } from '@modules/auth/auth.service';
import { asyncHandler } from '@utils/asyncHandler';

export class AuthController extends BaseController {
  constructor(private readonly authService = new AuthService()) {
    super();
  }

  requestOtp = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.authService.requestOtp({
      ...req.body,
      tenantId: req.tenant?.tenantId
    });
    this.ok(res, result, 'Verification OTP created');
  });

  register = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.authService.register({
      ...req.body,
      tenantId: req.tenant?.tenantId
    });
    this.ok(res, result, 'User registered', HTTP_STATUS.CREATED);
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.authService.login({
      ...req.body,
      tenantId: req.tenant?.tenantId
    });
    this.ok(res, result, 'User authenticated');
  });

  me = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.authService.me(req.auth?.userId, req.auth?.tenantId);
    this.ok(res, user, 'Current user fetched');
  });

  updateMe = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.authService.updateMe(req.auth?.userId, req.auth?.tenantId, req.body);
    this.ok(res, user, 'Profile updated');
  });

  changePassword = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.authService.changePassword(req.auth?.userId, req.auth?.tenantId, req.body);
    this.ok(res, result, 'Password updated');
  });

  deleteMe = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.authService.deleteMe(req.auth?.userId, req.auth?.tenantId, req.body);
    this.ok(res, result, 'Account deleted');
  });

  logout = asyncHandler(async (_req: Request, res: Response) => {
    this.ok(res, { loggedOut: true }, 'User signed out');
  });
}
