import { Request, Response } from 'express';

import { BaseController } from '@core/base/BaseController';
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
    const redirect = String(req.query.redirect ?? '');

    if (req.body?.merchant_ref_id) {
      await this.paymentService.handleMoPaymentsCallback(tenantId, req.body);
    }

    const redirectUrl = new URL(redirect || '/account/orderhistory', 'http://localhost');
    if (orderNumber) redirectUrl.searchParams.set('orderNumber', orderNumber);
    redirectUrl.searchParams.set('paymentGateway', 'mopayments');

    res.redirect(303, redirect ? redirectUrl.toString() : `${redirectUrl.pathname}${redirectUrl.search}`);
  });
}
