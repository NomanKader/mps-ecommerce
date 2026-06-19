import { Request, Response } from 'express';

import { BaseController } from '@core/base/BaseController';
import { FavoriteService } from '@modules/favorites/favorite.service';
import { asyncHandler } from '@utils/asyncHandler';

export class FavoriteController extends BaseController {
  constructor(private readonly favoriteService = new FavoriteService()) {
    super();
  }

  list = asyncHandler(async (req: Request, res: Response) => {
    const favorites = await this.favoriteService.listFavorites(req.tenant?.tenantId, req.auth?.userId);
    this.ok(res, favorites, 'Favorites fetched');
  });

  toggle = asyncHandler(async (req: Request, res: Response) => {
    const favorites = await this.favoriteService.toggleFavorite(
      req.tenant?.tenantId,
      req.auth?.userId,
      String(req.params.productId)
    );
    this.ok(res, favorites, favorites.isFavorite ? 'Product added to favorites' : 'Product removed from favorites');
  });
}
