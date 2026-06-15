import { AdminService } from '@modules/admin/admin.service';

const mockedProductModel = {
  create: jest.fn()
};

jest.mock('@core/database/tenant-database', () => ({
  getTenantModels: jest.fn(() => ({
    ProductModel: mockedProductModel
  }))
}));

describe('AdminService product management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates products with tenant-scoped subcategory details', async () => {
    const service = new AdminService();
    const payload = {
      name: 'Premium Green Apples',
      sku: 'APL-GRN-001',
      categoryName: 'Fruits',
      subcategory: '🍎 Apples & Pears',
      price: 8.5,
      currency: 'USD',
      stock: 120,
      rating: 4.8,
      status: 'active' as const
    };

    mockedProductModel.create.mockResolvedValue({
      toObject: () => ({
        _id: 'product-id',
        tenantId: 'av',
        ...payload
      })
    } as never);

    const result = await service.createProduct('av', payload);

    expect(mockedProductModel.create).toHaveBeenCalledWith({
      ...payload,
      tenantId: 'av'
    });
    expect(result).toMatchObject({
      tenantId: 'av',
      categoryName: 'Fruits',
      subcategory: '🍎 Apples & Pears'
    });
  });

  it('uploads product images to Drive and stores only metadata', async () => {
    const googleDriveService = {
      uploadProductImage: jest.fn().mockResolvedValue({
        imageName: 'av-APL-GRN-001-green-apples.jpg',
        imageMimeType: 'image/jpeg',
        imageSize: 1024,
        imageDriveFileId: 'drive-file-id'
      }),
      getProductImageUrl: jest.fn().mockResolvedValue('https://drive.google.com/uc?id=drive-file-id'),
      deleteProductImage: jest.fn()
    };
    const service = new AdminService(googleDriveService as never);
    const payload = {
      name: 'Premium Green Apples',
      sku: 'APL-GRN-001',
      categoryName: 'Fruits',
      subcategory: '🍎 Apples & Pears',
      price: 8.5,
      currency: 'USD',
      stock: 120,
      rating: 4.8,
      status: 'active' as const
    };
    const image = {
      buffer: Buffer.from('image-bytes'),
      originalname: 'green-apples.jpg',
      mimetype: 'image/jpeg',
      size: 1024
    } as Express.Multer.File;

    mockedProductModel.create.mockResolvedValue({
      toObject: () => ({
        _id: 'product-id',
        tenantId: 'av',
        ...payload,
        imageName: 'av-APL-GRN-001-green-apples.jpg',
        imageMimeType: 'image/jpeg',
        imageSize: 1024,
        imageDriveFileId: 'drive-file-id'
      })
    } as never);

    const result = await service.createProduct('av', payload, image);

    expect(googleDriveService.uploadProductImage).toHaveBeenCalledWith(image, 'av', 'APL-GRN-001');
    expect(mockedProductModel.create).toHaveBeenCalledWith({
      ...payload,
      tenantId: 'av',
      imageName: 'av-APL-GRN-001-green-apples.jpg',
      imageMimeType: 'image/jpeg',
      imageSize: 1024,
      imageDriveFileId: 'drive-file-id'
    });
    expect(mockedProductModel.create).not.toHaveBeenCalledWith(expect.objectContaining({ image: expect.anything() }));
    expect(result).toMatchObject({
      imageDriveFileId: 'drive-file-id',
      imageUrl: 'https://drive.google.com/uc?id=drive-file-id'
    });
  });
});
