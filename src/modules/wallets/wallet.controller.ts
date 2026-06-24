import { Request, Response } from 'express';

import { BaseController } from '@core/base/BaseController';
import { HTTP_STATUS } from '@core/response/http-status';
import { WalletService } from '@modules/wallets/wallet.service';
import { asyncHandler } from '@utils/asyncHandler';

export class WalletController extends BaseController {
  constructor(private readonly walletService = new WalletService()) {
    super();
  }

  getCustomerWallet = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.walletService.getCustomerWallet(req.tenant?.tenantId, req.auth?.userId),
      'Wallet loaded'
    );
  });

  createTopUpRequest = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.walletService.createTopUpRequest(req.tenant?.tenantId, req.auth?.userId, req.body, req.file),
      'Wallet top-up request submitted',
      HTTP_STATUS.CREATED
    );
  });

  listAdminTopUps = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.walletService.listAdminTopUps(req.tenant?.tenantId, req.query),
      'Wallet top-up requests loaded'
    );
  });

  approveTopUp = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.walletService.approveTopUp(req.tenant?.tenantId, req.auth?.userId, String(req.params.id), req.body),
      'Wallet top-up approved'
    );
  });

  rejectTopUp = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.walletService.rejectTopUp(req.tenant?.tenantId, req.auth?.userId, String(req.params.id), req.body),
      'Wallet top-up rejected'
    );
  });
}
