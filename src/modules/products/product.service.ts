import { BaseService } from '@core/base/BaseService';
import { getTenantModels } from '@core/database/tenant-database';
import { Product } from '@modules/products/product.types';
import { S3Service } from '@shared/services/s3.service';

export class ProductService extends BaseService {
  constructor(private readonly imageStorageService = new S3Service()) {
    super();
  }

  async listProducts(tenantId?: string): Promise<Product[]> {
    if (!tenantId) return [];
    const { ProductModel } = getTenantModels(tenantId);
    const products = await ProductModel.find({
      tenantId,
      isDeleted: { $ne: true },
      status: 'active'
    })
      .sort({ createdAt: -1 })
      .lean<Product[]>()
      .exec();

    return Promise.all(products.map((product) => this.withProductImageUrl(product)));
  }

  async getProductById(tenantId: string | undefined, productId: string): Promise<Product | null> {
    if (!tenantId) return null;
    const { ProductModel } = getTenantModels(tenantId);
    const product = await ProductModel.findOne({
      _id: productId,
      tenantId,
      isDeleted: { $ne: true },
      status: 'active'
    })
      .lean<Product | null>()
      .exec();

    return product ? this.withProductImageUrl(product) : null;
  }

  private async withProductImageUrl(product: Product): Promise<Product> {
    const imageUrl = await this.imageStorageService.getProductImageUrl(
      product.imageDriveFileId,
      product.imageName
    );

    return { ...product, imageUrl };
  }
}
