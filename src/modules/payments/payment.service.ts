import { getTenantModels } from '@core/database/tenant-database';
import { HTTP_STATUS } from '@core/response/http-status';
import { logger } from '@config/logger';
import { Order } from '@modules/orders/order.types';
import { MoPaymentsCallbackPayload, MoPaymentsService } from '@modules/payments/mopayments.service';
import { WalletTopUpRequest } from '@modules/wallets/wallet.types';
import { EmailService } from '@shared/services/email.service';
import { ApiError } from '@utils/ApiError';

const paymentStatusByGatewayStatus = {
  EXPIRED: 'expired',
  FAIL: 'failed',
  PROCESSING: 'pending',
  SUCCESS: 'paid',
  TIMEOUT: 'timeout'
} as const;

export class PaymentService {
  constructor(
    private readonly moPaymentsService = new MoPaymentsService(),
    private readonly emailService = new EmailService()
  ) {}

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
    const order = await OrderModel.findOne({ tenantId, orderNumber }).lean<Order>();

    if (!order) {
      return this.handleWalletTopUpCallback(tenantId, payload, orderNumber);
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
        status: paymentStatus === 'paid' && order.status === 'pending' ? 'processing' : order.status
      }
    );

    if (order.paymentStatus !== paymentStatus && paymentStatus !== 'pending') {
      await this.notifyCustomerOrderPaymentStatus(order, paymentStatus).catch((error: unknown) => {
        logger.error('Failed to send customer payment status email', {
          error,
          orderNumber
        });
      });
    }

    return {
      gatewayType: gatewayStatus.gatewayType ?? payload.gateway_type,
      orderNumber,
      paymentStatus,
      status: gatewayStatus.paymentStatus,
      transactionAmount: gatewayStatus.transactionAmount
    };
  }

  private async handleWalletTopUpCallback(
    tenantId: string,
    payload: MoPaymentsCallbackPayload,
    merchantReferenceId: string
  ) {
    const { CustomerWalletModel, WalletTopUpRequestModel } = getTenantModels(tenantId);
    const request = await WalletTopUpRequestModel.findOne({
      tenantId,
      paymentMerchantReferenceId: merchantReferenceId
    }).lean<WalletTopUpRequest>();

    if (!request) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Wallet top-up not found for MoPayments callback');
    }

    if (!request.paymentToken) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Wallet top-up does not have a MoPayments token');
    }

    const gatewayStatus = await this.moPaymentsService.checkPaymentStatus(
      request.paymentToken,
      merchantReferenceId
    );
    const paymentStatus = paymentStatusByGatewayStatus[gatewayStatus.paymentStatus] ?? 'pending';

    if (paymentStatus === 'paid' && request.status !== 'approved') {
      const wallet = await CustomerWalletModel.findOneAndUpdate(
        { tenantId, userId: request.userId },
        {
          $setOnInsert: {
            balance: 0,
            reservedBalance: 0,
            tenantId,
            transactions: [],
            userId: request.userId
          }
        },
        { new: true, upsert: true }
      );

      await CustomerWalletModel.updateOne(
        { _id: wallet._id },
        {
          $inc: { balance: request.amount },
          $push: {
            transactions: {
              amount: request.amount,
              createdAt: new Date(),
              description: `Online wallet top-up ${merchantReferenceId}`,
              direction: 'credit',
              kind: 'top-up',
              referenceId: merchantReferenceId
            }
          }
        }
      );
    }

    await WalletTopUpRequestModel.updateOne(
      { _id: request._id, tenantId },
      {
        approvedAmount: paymentStatus === 'paid' ? request.amount : request.approvedAmount,
        paymentGateway: 'mopayments',
        paymentGatewayReferenceId: payload.payment_id,
        paymentGatewayStatus: gatewayStatus.paymentStatus,
        paymentSettlementAmount: payload.settlement_amount
          ? Number(payload.settlement_amount)
          : undefined,
        paymentTransactionAmount: payload.transaction_amount
          ? Number(payload.transaction_amount)
          : gatewayStatus.transactionAmount,
        reviewedAt: paymentStatus === 'paid' ? new Date() : request.reviewedAt,
        status:
          paymentStatus === 'paid'
            ? 'approved'
            : paymentStatus === 'failed' || paymentStatus === 'expired' || paymentStatus === 'timeout'
              ? 'rejected'
              : request.status
      }
    );

    if (request.status === 'pending' && paymentStatus !== 'pending') {
      await this.notifyCustomerWalletTopUpStatus(request, paymentStatus).catch((error: unknown) => {
        logger.error('Failed to send customer wallet top-up email', {
          error,
          walletTopUpId: String(request._id)
        });
      });
    }

    return {
      gatewayType: gatewayStatus.gatewayType ?? payload.gateway_type,
      paymentStatus,
      status: gatewayStatus.paymentStatus,
      transactionAmount: gatewayStatus.transactionAmount,
      walletTopUpId: String(request._id)
    };
  }

  private async notifyCustomerOrderPaymentStatus(
    order: Order,
    paymentStatus: 'paid' | 'failed' | 'expired' | 'timeout'
  ) {
    if (!order.customerEmail) return;

    const isPaid = paymentStatus === 'paid';
    const statusText = isPaid
      ? 'Your online payment was successful.'
      : `Your online payment status is ${paymentStatus}.`;
    const nextStep = isPaid
      ? 'We are preparing your order now.'
      : 'Please place the order again or contact support if money was deducted.';
    const text = [
      `Order ${order.orderNumber}`,
      statusText,
      nextStep,
      '',
      `Total: ${this.formatAmount(order.totalAmount)}`
    ].join('\n');
    const html = `
      <h2>Order ${this.escapeHtml(order.orderNumber)}</h2>
      <p>${this.escapeHtml(statusText)}</p>
      <p>${this.escapeHtml(nextStep)}</p>
      <p><strong>Total:</strong> ${this.formatAmount(order.totalAmount)}</p>
    `;

    await this.emailService.sendMail({
      html,
      subject: isPaid
        ? `Payment received for order ${order.orderNumber}`
        : `Payment ${paymentStatus} for order ${order.orderNumber}`,
      text,
      to: order.customerEmail
    });
  }

  private async notifyCustomerWalletTopUpStatus(
    request: WalletTopUpRequest,
    paymentStatus: 'paid' | 'failed' | 'expired' | 'timeout'
  ) {
    if (!request.customerEmail) return;

    const isPaid = paymentStatus === 'paid';
    const statusText = isPaid
      ? 'Your wallet top-up was successful.'
      : `Your wallet top-up payment status is ${paymentStatus}.`;
    const text = [
      statusText,
      `Amount: ${this.formatAmount(request.amount)}`,
      isPaid ? 'Your wallet balance has been updated.' : 'Your wallet balance was not changed.'
    ].join('\n');
    const html = `
      <h2>Wallet top-up ${isPaid ? 'successful' : paymentStatus}</h2>
      <p>${this.escapeHtml(statusText)}</p>
      <p><strong>Amount:</strong> ${this.formatAmount(request.amount)}</p>
      <p>${isPaid ? 'Your wallet balance has been updated.' : 'Your wallet balance was not changed.'}</p>
    `;

    await this.emailService.sendMail({
      html,
      subject: isPaid ? 'Wallet top-up successful' : `Wallet top-up ${paymentStatus}`,
      text,
      to: request.customerEmail
    });
  }

  private formatAmount(amount: number) {
    return `${Math.round(amount).toLocaleString('en-US')} MMK`;
  }

  private escapeHtml(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
