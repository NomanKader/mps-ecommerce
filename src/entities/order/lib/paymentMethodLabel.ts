import type { Order } from '../types/order.types';

export function paymentMethodLabel(order: Pick<Order, 'paymentMethod' | 'paymentGateway'>): string {
  if (order.paymentMethod === 'mopayments' || order.paymentGateway === 'mopayments') {
    return 'Online Payment';
  }
  if (order.paymentMethod === 'wallet') return 'Wallet';
  if (order.paymentMethod === 'cash_on_delivery') return 'Cash on delivery';
  return 'Payment method unavailable';
}
