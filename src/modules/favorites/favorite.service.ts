import { BaseService } from '@core/base/BaseService';
import { getTenantModels } from '@core/database/tenant-database';
import { HTTP_STATUS } from '@core/response/http-status';
import { FavoriteRepository } from '@modules/favorites/favorite.repository';
import { FavoriteListResponse, FavoriteToggleResponse } from '@modules/favorites/favorite.types';
import { ApiError } from '@utils/ApiError';

export class FavoriteService extends BaseService {
  constructor() {
    super();
  }

  async listFavorites(tenantId?: string, userId?: string): Promise<FavoriteListResponse> {
    if (!tenantId || !userId) {
      return { productIds: [] };
    }

    const favorites = await new FavoriteRepository(tenantId).find({ tenantId, userId });

    return {
      productIds: favorites.map((favorite) => favorite.productId)
    };
  }

  async toggleFavorite(
    tenantId: string | undefined,
    userId: string | undefined,
    productId: string
  ): Promise<FavoriteToggleResponse> {
    if (!tenantId || !userId) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Authentication is required');
    }

    const { ProductModel } = getTenantModels(tenantId);
    const product = await ProductModel.findOne({
      _id: productId,
      tenantId,
      isDeleted: { $ne: true },
      status: 'active'
    })
      .select('_id')
      .lean()
      .exec();

    if (!product) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Product not found');
    }

    const repository = new FavoriteRepository(tenantId);
    const filter = { tenantId, userId, productId };
    const existingFavorite = await repository.findOne(filter);
    let isFavorite = true;

    if (existingFavorite) {
      await repository.deleteOne(filter);
      isFavorite = false;
    } else {
      await repository.create(filter);
    }

    const { productIds } = await this.listFavorites(tenantId, userId);

    return {
      isFavorite,
      productId,
      productIds
    };
  }
}
