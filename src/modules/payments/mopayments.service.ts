import crypto from 'crypto';

import { env } from '@config/env';
import { HTTP_STATUS } from '@core/response/http-status';
import { ApiError } from '@utils/ApiError';

export type MoPaymentsPaymentItem = {
  name: string;
  price: number;
  quantity: number;
  total: number;
};

export type MoPaymentsTokenRequest = {
  merchantId: string;
  merchantReferenceId: string;
  subTotal: number;
  total: number;
  discountAmount: number;
  taxAmount: number;
  frontendUrl: string;
  backendUrl: string;
  paymentItems: MoPaymentsPaymentItem[];
  preferredGateways?: string[];
};

export type MoPaymentsTokenResponse = {
  expireAt: number;
  paymentUrl: string;
  token: string;
};

export type MoPaymentsStatus = 'SUCCESS' | 'FAIL' | 'PROCESSING' | 'EXPIRED' | 'TIMEOUT';

export type MoPaymentsStatusResponse = {
  gatewayType?: string;
  merchantReferenceId: string;
  paymentStatus: MoPaymentsStatus;
  token: string;
  transactionAmount?: number;
};

const requestApiBaseUrls = {
  live: 'https://live.mopayments.com.mm/request_api',
  sandbox: 'https://sandbox.mopayments.com.mm/request_api'
} as const;

const paymentApiBaseUrls = {
  live: 'https://live.mopayments.com.mm/payment_api',
  sandbox: 'https://sandbox.mopayments.com.mm/payment_api'
} as const;

const paymentPageBaseUrls = {
  live: 'https://live-payment.mopayments.com.mm/go',
  sandbox: 'https://sandbox-payment.mopayments.com.mm/go'
} as const;

const normalizeAmount = (amount: number): string => {
  if (!Number.isFinite(amount)) return '0';
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(2).replace(/\.?0+$/, '');
};

const sortAndJoin = (values: string[]): string => [...values].sort().join('');

const configuredPreferredGateways = (): string[] | undefined => {
  const gateways = env.MOPAYMENTS_PREFERRED_GATEWAYS?.split(',')
    .map((gateway) => gateway.trim())
    .filter(Boolean);

  return gateways?.length ? gateways : undefined;
};

const stringifyTokenRequest = (
  merchantId: string,
  payload: MoPaymentsTokenRequest,
  signature: string
): string => {
  const merchantIdValue = /^\d+$/.test(merchantId) ? `__MOPAYMENTS_MERCHANT_ID__` : merchantId;
  const json = JSON.stringify({
    merchant_id: merchantIdValue,
    merchant_reference_id: payload.merchantReferenceId,
    sub_total: payload.subTotal,
    total: payload.total,
    discount_amount: payload.discountAmount,
    tax_amount: payload.taxAmount,
    merchant_backend_url: payload.backendUrl,
    merchant_frontend_url: payload.frontendUrl,
    preferred_gateways: payload.preferredGateways,
    payment_items: payload.paymentItems,
    signature
  });

  return /^\d+$/.test(merchantId)
    ? json.replace('"__MOPAYMENTS_MERCHANT_ID__"', merchantId)
    : json;
};

export class MoPaymentsService {
  isConfigured(): boolean {
    return Boolean(env.MOPAYMENTS_MERCHANT_ID && env.MOPAYMENTS_SECRET_KEY);
  }

  getMerchantId(): string {
    if (!env.MOPAYMENTS_MERCHANT_ID) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'MoPayments merchant id is not configured');
    }

    return env.MOPAYMENTS_MERCHANT_ID;
  }

  getPreferredGateways(): string[] | undefined {
    return configuredPreferredGateways();
  }

  getPaymentUrl(token: string): string {
    return `${paymentPageBaseUrls[env.MOPAYMENTS_ENVIRONMENT]}/${encodeURIComponent(token)}/make_payment`;
  }

  createSignature(request: MoPaymentsTokenRequest, secretKey = env.MOPAYMENTS_SECRET_KEY): string {
    if (!secretKey) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'MoPayments secret key is not configured');
    }

    const verifyingText = this.createVerifyingText(request);
    const keyHash = crypto.createHash('sha256').update(secretKey).digest();
    const hmacKey = keyHash.subarray(16, 32);

    return crypto.createHmac('sha256', hmacKey).update(verifyingText, 'utf8').digest('hex');
  }

  createVerifyingText(request: MoPaymentsTokenRequest): string {
    const params = [
      request.merchantId,
      request.merchantReferenceId,
      normalizeAmount(request.subTotal),
      normalizeAmount(request.total),
      normalizeAmount(request.discountAmount),
      normalizeAmount(request.taxAmount),
      request.frontendUrl,
      request.backendUrl
    ];

    for (const item of request.paymentItems) {
      params.push(
        sortAndJoin([
          item.name,
          normalizeAmount(item.price),
          String(item.quantity),
          normalizeAmount(item.total)
        ])
      );
    }

    if (request.preferredGateways?.length) {
      params.push(request.preferredGateways.join(''));
    }

    return sortAndJoin(params);
  }

  async requestPaymentToken(request: Omit<MoPaymentsTokenRequest, 'merchantId'>): Promise<MoPaymentsTokenResponse> {
    const merchantId = this.getMerchantId();
    const payload: MoPaymentsTokenRequest = { ...request, merchantId };
    const signature = this.createSignature(payload);
    const response = await fetch(`${requestApiBaseUrls[env.MOPAYMENTS_ENVIRONMENT]}/request_payment_token`, {
      body: stringifyTokenRequest(merchantId, payload, signature),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST'
    });

    if (!response.ok) {
      const body = await response.text();
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        `MoPayments token request failed (${response.status}): ${body || response.statusText}`
      );
    }

    const data = (await response.json()) as { expire_at?: number; token?: string };

    if (!data.token || !data.expire_at) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'MoPayments token response is invalid');
    }

    return {
      expireAt: data.expire_at,
      paymentUrl: this.getPaymentUrl(data.token),
      token: data.token
    };
  }

  async checkPaymentStatus(token: string, merchantReferenceId: string): Promise<MoPaymentsStatusResponse> {
    const response = await fetch(`${paymentApiBaseUrls[env.MOPAYMENTS_ENVIRONMENT]}/check_payment_status`, {
      body: JSON.stringify({
        token,
        merchant_reference_id: merchantReferenceId
      }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST'
    });

    if (!response.ok) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, `MoPayments status check failed (${response.status})`);
    }

    const result = (await response.json()) as {
      data?: {
        gateway_type?: string;
        merchant_reference_id?: string;
        payment_status?: MoPaymentsStatus;
        token?: string;
        transaction_amount?: number;
      };
    };

    if (!result.data?.payment_status || !result.data.token || !result.data.merchant_reference_id) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'MoPayments status response is invalid');
    }

    return {
      gatewayType: result.data.gateway_type,
      merchantReferenceId: result.data.merchant_reference_id,
      paymentStatus: result.data.payment_status,
      token: result.data.token,
      transactionAmount: result.data.transaction_amount
    };
  }
}
