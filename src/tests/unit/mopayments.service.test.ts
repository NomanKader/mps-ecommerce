import crypto from 'crypto';

import { MoPaymentsService } from '@modules/payments/mopayments.service';

const request = {
  backendUrl: 'https://api.example.com/api/v1/payments/mopayments/callback?tenantId=av',
  discountAmount: 0,
  frontendUrl: 'https://api.example.com/api/v1/payments/mopayments/return?tenantId=av',
  merchantId: '209974718943031296',
  merchantReferenceId: 'ORD-TEST-001',
  paymentItems: [
    {
      name: 'External SSD 256GB',
      price: 100,
      quantity: 1,
      total: 100
    }
  ],
  preferredGateways: ['MPU'],
  subTotal: 100,
  taxAmount: 0,
  total: 100
};

describe('MoPaymentsService', () => {
  it('creates the verifying text using the documented nested sort order', () => {
    const service = new MoPaymentsService();
    const itemText = ['External SSD 256GB', '100', '1', '100'].sort().join('');
    const expected = [
      request.merchantId,
      request.merchantReferenceId,
      '100',
      '100',
      '0',
      '0',
      request.frontendUrl,
      request.backendUrl,
      itemText,
      'MPU'
    ]
      .sort()
      .join('');

    expect(service.createVerifyingText(request)).toBe(expected);
  });

  it('creates a lowercase hmac sha256 signature from bytes 16..31 of sha256(secret)', () => {
    const service = new MoPaymentsService();
    const secret = 'shared-secret';
    const keyHash = crypto.createHash('sha256').update(secret).digest();
    const expected = crypto
      .createHmac('sha256', keyHash.subarray(16, 32))
      .update(service.createVerifyingText(request), 'utf8')
      .digest('hex');

    expect(service.createSignature(request, secret)).toBe(expected);
  });

  it('builds the sandbox payment page url', () => {
    const service = new MoPaymentsService();

    expect(service.getPaymentUrl('token-123')).toBe(
      'https://sandbox-payment.mopayments.com.mm/go/token-123/make_payment'
    );
  });

  it('creates SUCCESS callback verifying text from required and settlement fields only', () => {
    const service = new MoPaymentsService();
    const callback = {
      gateway_service_fee: '400.0000',
      gateway_type: 'KBZPAY',
      merchant_ref_id:
        '552cb4c1-8eea-4e97-a6f9-12d8e44ad66d-366db2d6-cf26-4e9c-b188-650413529955',
      payment_date: '1788336630852',
      payment_id: '882998092382707712',
      platform_service_fee: '0.0000',
      settlement_amount: '3600.0000',
      signature: 'ignored-in-verifying-text',
      status: 'SUCCESS' as const,
      transaction_amount: '4000.0000'
    };
    const expected = [
      callback.payment_id,
      callback.merchant_ref_id,
      callback.status,
      callback.gateway_type,
      callback.settlement_amount,
      callback.gateway_service_fee,
      callback.platform_service_fee,
      callback.transaction_amount,
      callback.payment_date
    ]
      .sort()
      .join('');

    expect(service.createCallbackVerifyingText(callback)).toBe(expected);
  });

  it('creates FAIL callback verifying text without optional settlement fields', () => {
    const service = new MoPaymentsService();
    const callback = {
      gateway_type: 'KBZPAY',
      merchant_ref_id:
        '552cb4c1-8eea-4e97-a6f9-12d8e44ad66d-366db2d6-cf26-4e9c-b188-650413529955',
      payment_id: '882998092382707712',
      signature: 'ignored-in-verifying-text',
      status: 'FAIL' as const
    };
    const expected = [
      callback.payment_id,
      callback.merchant_ref_id,
      callback.status,
      callback.gateway_type
    ]
      .sort()
      .join('');

    expect(service.createCallbackVerifyingText(callback)).toBe(expected);
  });

  it('verifies callback signatures with the same hmac sha256 method', () => {
    const service = new MoPaymentsService();
    const secret = 'shared-secret';
    const callback = {
      gateway_type: 'KBZPAY',
      merchant_ref_id: 'ORD-TEST-001',
      payment_id: '882998092382707712',
      status: 'FAIL' as const
    };
    const signature = service.createCallbackSignature(callback, secret);

    expect(service.verifyCallbackSignature({ ...callback, signature }, secret)).toBe(true);
    expect(
      service.verifyCallbackSignature(
        { ...callback, signature: '0000000000000000000000000000000000000000000000000000000000000000' },
        secret
      )
    ).toBe(false);
  });
});
