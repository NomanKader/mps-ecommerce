import { describe, expect, it } from 'vitest';

import { paymentMethodLabel } from './paymentMethodLabel';

describe('paymentMethodLabel', () => {
  it.each([
    [{ paymentMethod: 'mopayments' }, 'Online Payment'],
    [{ paymentGateway: 'mopayments' }, 'Online Payment'],
    [{ paymentMethod: 'wallet' }, 'Wallet'],
    [{ paymentMethod: 'cash_on_delivery' }, 'Cash on delivery'],
    [{}, 'Payment method unavailable'],
    [{ paymentMethod: 'unknown' }, 'Payment method unavailable'],
  ])('labels %j as %s', (order, expected) => {
    expect(paymentMethodLabel(order)).toBe(expected);
  });
});
