import { Request, Response } from 'express';

import { BaseController } from '@core/base/BaseController';
import { env } from '@config/env';
import { logger } from '@config/logger';
import { PaymentService } from '@modules/payments/payment.service';
import { asyncHandler } from '@utils/asyncHandler';

export class PaymentController extends BaseController {
  constructor(private readonly paymentService = new PaymentService()) {
    super();
  }

  moPaymentsCallback = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.paymentService.handleMoPaymentsCallback(
      String(req.query.tenantId ?? ''),
      req.body
    );
    this.ok(res, result, 'MoPayments callback processed');
  });

  moPaymentsReturn = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = String(req.query.tenantId ?? '');
    const orderNumber = String(req.query.orderNumber ?? req.body?.merchant_ref_id ?? '');
    const walletTopUpId = String(req.query.walletTopUpId ?? '');
    // Never accept an arbitrary redirect destination from a gateway query string.
    const redirectUrl = new URL('/payment/mopayments/return', env.PUBLIC_APP_BASE_URL || 'https://avsstoreonline.com');
    let paymentStatus = 'unverified';
    let resolvedWalletTopUpId = walletTopUpId;
    try {
      if (req.body?.merchant_ref_id) {
        const result = await this.paymentService.handleMoPaymentsCallback(tenantId, req.body);
        paymentStatus = result.paymentStatus;
        if ('walletTopUpId' in result && result.walletTopUpId) {
          resolvedWalletTopUpId = result.walletTopUpId;
        }
      }
    } catch {
      logger.warn('Online payment return could not be verified', { orderNumber });
    }
    if (orderNumber) redirectUrl.searchParams.set('orderNumber', orderNumber);
    if (resolvedWalletTopUpId) redirectUrl.searchParams.set('walletTopUpId', resolvedWalletTopUpId);
    redirectUrl.searchParams.set('paymentGateway', 'mopayments');
    redirectUrl.searchParams.set('paymentStatus', paymentStatus);
    res.redirect(303, redirectUrl.toString());
  });
}
