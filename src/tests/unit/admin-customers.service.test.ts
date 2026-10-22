import { AdminService } from '@modules/admin/admin.service';

const mockedOrderModel = { find: jest.fn() };
const mockedCustomerModel = { find: jest.fn() };
jest.mock('@core/database/tenant-database', () => ({
  getTenantModels: jest.fn(() => ({
    OrderModel: mockedOrderModel,
    AdminCustomerModel: mockedCustomerModel
  }))
}));

it('keeps deleted customers out even when historical orders reference them', async () => {
  const now = new Date();
  mockedOrderModel.find.mockReturnValue({
    lean: jest.fn().mockResolvedValue([
      {
        tenantId: 'av',
        customerEmail: 'removed@example.com',
        customerName: 'Removed Customer',
        totalAmount: 1000,
        status: 'pending',
        createdAt: now
      },
      {
        tenantId: 'av',
        customerEmail: 'real@example.com',
        customerName: 'Real Customer',
        totalAmount: 2500,
        status: 'fulfilled',
        createdAt: now
      }
    ])
  });
  mockedCustomerModel.find.mockReturnValue({
    sort: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue([
        { email: 'Removed@Example.com', isDeleted: true },
        {
          _id: 'manual-1',
          email: 'shop@example.com',
          name: 'Shop Customer',
          isDeleted: false,
          orders: 0,
          totalSpend: 0,
          lastOrderAt: now,
          segment: 'New'
        }
      ])
    })
  });
  const service = new AdminService({} as never);
  const customers = await service.listCustomers('av');
  expect(customers.map((customer) => customer.email).sort()).toEqual([
    'real@example.com',
    'shop@example.com'
  ]);
  expect(customers.find((customer) => customer.email === 'real@example.com')).toMatchObject({
    orders: 1,
    totalSpend: 2500
  });
  expect(mockedCustomerModel.find).toHaveBeenCalledWith({ tenantId: 'av' });
  expect(mockedOrderModel.find).toHaveBeenCalledWith({ tenantId: 'av' });
});
