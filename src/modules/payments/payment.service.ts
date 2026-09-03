import { getTenantModels } from '@core/database/tenant-database';
import { HTTP_STATUS } from '@core/response/http-status';
import { MoPaymentsCallbackPayload, MoPaymentsService } from '@modules/payments/mopayments.service';
import { ApiError } from '@utils/ApiError';

const paymentStatusByGatewayStatus = {
  EXPIRED: 'expired',
  FAIL: 'failed',
  PROCESSING: 'pending',
  SUCCESS: 'paid',
  TIMEOUT: 'timeout'
} as const;

export class PaymentService {
  constructor(private readonly moPaymentsService = new MoPaymentsService()) {}

  async handleMoPaymentsCallback(tenantId: string | undefined, payload: MoPaymentsCallbackPayload) {
    if (!tenantId) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'tenantId is required for MoPayments callback');
    }

    const orderNumber = payload.merchant_ref_id;
    if (!orderNumber) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'merchant_ref_id is required');
    }

    if (!this.moPaymentsService.verifyCallbackSignature(payload)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'MoPayments callback signature is invalid');
    }

    const { OrderModel } = getTenantModels(tenantId);
    const order = await OrderModel.findOne({ tenantId, orderNumber }).lean();

    if (!order) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Order not found for MoPayments callback');
    }

    if (!order.paymentToken) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Order does not have a MoPayments token');
    }

    const gatewayStatus = await this.moPaymentsService.checkPaymentStatus(
      order.paymentToken,
      orderNumber
    );
    const paymentStatus = paymentStatusByGatewayStatus[gatewayStatus.paymentStatus] ?? 'pending';

    await OrderModel.updateOne(
      { tenantId, orderNumber },
      {
        paymentGateway: 'mopayments',
        paymentGatewayReferenceId: payload.payment_id,
        paymentGatewayStatus: gatewayStatus.paymentStatus,
        paymentStatus,
        paymentSettlementAmount: payload.settlement_amount
          ? Number(payload.settlement_amount)
          : undefined,
        paymentTransactionAmount: payload.transaction_amount
          ? Number(payload.transaction_amount)
          : gatewayStatus.transactionAmount,
        status: paymentStatus === 'paid' ? 'processing' : order.status
      }
    );

    return {
      gatewayType: gatewayStatus.gatewayType ?? payload.gateway_type,
      orderNumber,
      paymentStatus,
      status: gatewayStatus.paymentStatus,
      transactionAmount: gatewayStatus.transactionAmount
    };
  }
}
