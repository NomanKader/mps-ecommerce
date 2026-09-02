import { getTenantModels } from '@core/database/tenant-database';
import { HTTP_STATUS } from '@core/response/http-status';
import { MoPaymentsService, MoPaymentsStatus } from '@modules/payments/mopayments.service';
import { ApiError } from '@utils/ApiError';

type MoPaymentsCallbackPayload = {
  gateway_type?: string;
  merchant_ref_id?: string;
  payment_id?: string;
  status?: MoPaymentsStatus;
};

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
        paymentGatewayStatus: gatewayStatus.paymentStatus,
        paymentStatus,
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
