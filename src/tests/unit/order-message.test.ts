import { createOrderSchema } from '@modules/orders/order.validation';

const orderBody = {
  customerName: 'Test Customer',
  city: 'Yangon',
  deliveryAddress: 'Test address',
  itemCount: 1,
  items: [{ productId: 'product-1', quantity: 1 }],
  paymentMethod: 'cash_on_delivery',
  subtotalAmount: 4200
};

describe('Order item messages', () => {
  it('accepts orders without messages for existing clients', () => {
    const parsed = createOrderSchema.parse({ body: orderBody });
    expect(parsed.body.items[0]).toEqual({ productId: 'product-1', quantity: 1 });
  });

  it('preserves a gift message on its product when validating checkout', () => {
    const parsed = createOrderSchema.parse({ body: {
      ...orderBody,
      items: [
        { productId: 'product-1', quantity: 1, message: '  Happy birthday!\nFrom your family  ' },
        { productId: 'product-2', quantity: 2 }
      ]
    } });
    expect(parsed.body.items[0]?.message).toBe('Happy birthday!\nFrom your family');
    expect(parsed.body.items[1]?.message).toBeUndefined();
  });

  it('rejects messages longer than the editor limit', () => {
    expect(() => createOrderSchema.parse({ body: {
      ...orderBody,
      items: [{ productId: 'product-1', quantity: 1, message: 'a'.repeat(501) }]
    } })).toThrow();
  });
});
