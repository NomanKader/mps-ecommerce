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
});
