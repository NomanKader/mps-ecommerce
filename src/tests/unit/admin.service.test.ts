import { AdminService } from '@modules/admin/admin.service';

const mockedCategoryModel = {
  create: jest.fn(),
  find: jest.fn(),
  findOneAndUpdate: jest.fn(),
  updateOne: jest.fn()
};

const mockedOrderModel = {
  findOneAndUpdate: jest.fn()
};

jest.mock('@core/database/tenant-database', () => ({
  getTenantModels: jest.fn(() => ({
    CategoryModel: mockedCategoryModel,
    OrderModel: mockedOrderModel
  }))
}));

describe('AdminService management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates tenant-scoped categories without changing icon or subcategory emoji strings', async () => {
    const service = new AdminService();
    const payload = {
      name: 'Fruits',
      slug: 'fruits',
      icon: '🍎',
      color: '#2db34b',
      itemCount: 0,
      subcategories: ['🍎 Apples & Pears', '🍊 Citrus', '🫐 Berries']
    };

    mockedCategoryModel.create.mockResolvedValue({
      toObject: () => ({
        _id: 'category-id',
        tenantId: 'av',
        ...payload
      })
    } as never);

    const result = await service.createCategory('av', payload);

    expect(mockedCategoryModel.create).toHaveBeenCalledWith({
      ...payload,
      tenantId: 'av'
    });
    expect(result).toMatchObject({
      tenantId: 'av',
      icon: '🍎',
      subcategories: ['🍎 Apples & Pears', '🍊 Citrus', '🫐 Berries']
    });
  });

  it('requires a tenant id for category creation', async () => {
    const service = new AdminService();

    await expect(service.createCategory(undefined, { name: 'Fruits', slug: 'fruits' })).rejects.toMatchObject({
      statusCode: 400,
      message: 'x-tenant-id header is required'
    });
    expect(mockedCategoryModel.create).not.toHaveBeenCalled();
  });

  it('returns a conflict when a category slug already exists for the tenant', async () => {
    const service = new AdminService();

    mockedCategoryModel.create.mockRejectedValue({ code: 11000 });

    await expect(service.createCategory('av', { name: 'Fruits', slug: 'fruits' })).rejects.toMatchObject({
      statusCode: 409,
      message: 'Category slug already exists for tenant'
    });
  });

  it('updates an order to any valid status, including a previous workflow status', async () => {
    const service = new AdminService();

    mockedOrderModel.findOneAndUpdate.mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        _id: 'order-id',
        createdAt: '2026-07-01T00:00:00.000Z',
        currency: 'MMK',
        customerName: 'May Hnin',
        itemCount: 2,
        orderNumber: 'DEMO-1002',
        placedAt: '2026-07-01T00:00:00.000Z',
        status: 'processing',
        tenantId: 'av',
        totalAmount: 13800
      })
    });

    const result = await service.updateOrderStatus('av', 'order-id', 'processing');

    expect(mockedOrderModel.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'order-id', tenantId: 'av' },
      { status: 'processing' },
      { new: true }
    );
    expect(result).toMatchObject({
      _id: 'order-id',
      status: 'processing'
    });
  });
});
