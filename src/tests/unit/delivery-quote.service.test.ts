import { OrderService } from '@modules/orders/order.service';
import { deliveryQuoteSchema } from '@modules/orders/order.validation';

const mockedDeliveryFeeModel = { findOne: jest.fn() };
jest.mock('@core/database/tenant-database', () => ({
  getTenantModels: jest.fn(() => ({ DeliveryFeeModel: mockedDeliveryFeeModel }))
}));

const configuration = {
  region: 'Yangon Region',
  township: 'Lanmadaw',
  fee: 4500,
  freeOver: 15000,
  eta: 'Same day'
};
const quote = { city: 'Yangon', region: 'Yangon', township: 'Lanmadaw', subtotalAmount: 12650 };
const mockedSort = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  mockedSort.mockReturnValue({ lean: jest.fn().mockResolvedValue(configuration) });
  mockedDeliveryFeeModel.findOne.mockReturnValue({ sort: mockedSort });
});

it.each(['Yangon', 'Yangon Region'])(
  'matches the configured region when checkout submits %s',
  async (region) => {
    const service = new OrderService();
    const payload = deliveryQuoteSchema.parse({ body: { ...quote, region } }).body;
    const result = await service.getDeliveryQuote('av', 'customer-1', payload);
    expect(mockedDeliveryFeeModel.findOne).toHaveBeenCalledWith({
      tenantId: 'av',
      region: { $in: ['Yangon', 'Yangon Region'] },
      township: 'Lanmadaw',
      status: 'active',
      isDeleted: { $ne: true }
    });
    expect(mockedSort).toHaveBeenCalledWith({ updatedAt: -1, _id: 1 });
    expect(result).toMatchObject({
      deliveryFee: 4500,
      totalAmount: 17150,
      freeDeliveryApplied: false,
      eta: 'Same day'
    });
  }
);

it.each([15000, 20000])(
  'applies the configured free-delivery threshold to a subtotal of %s',
  async (subtotalAmount) => {
    const result = await new OrderService().getDeliveryQuote('av', 'customer-1', {
      ...quote,
      subtotalAmount
    });
    expect(result).toMatchObject({
      deliveryFee: 0,
      totalAmount: subtotalAmount,
      freeDeliveryApplied: true
    });
  }
);

it('continues to reject a township without an active delivery configuration', async () => {
  mockedSort.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
  await expect(
    new OrderService().getDeliveryQuote('av', 'customer-1', quote)
  ).rejects.toMatchObject({
    statusCode: 400,
    message: 'Delivery is not configured for Lanmadaw, Yangon'
  });
});

it('does not allow delivery outside Yangon', async () => {
  await expect(
    new OrderService().getDeliveryQuote('av', 'customer-1', { ...quote, region: 'Mandalay Region' })
  ).rejects.toMatchObject({ statusCode: 400 });
  expect(mockedDeliveryFeeModel.findOne).not.toHaveBeenCalled();
});
