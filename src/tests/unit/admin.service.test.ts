import { CategoryModel } from '@modules/categories/category.model';
import { AdminService } from '@modules/admin/admin.service';

jest.mock('@modules/categories/category.model', () => ({
  CategoryModel: {
    create: jest.fn(),
    find: jest.fn(),
    findOneAndUpdate: jest.fn(),
    updateOne: jest.fn()
  }
}));

const mockedCategoryModel = CategoryModel as jest.Mocked<typeof CategoryModel>;

describe('AdminService category management', () => {
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
});
