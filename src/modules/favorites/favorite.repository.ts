import { BaseRepository } from '@core/base/BaseRepository';
import { getTenantModels } from '@core/database/tenant-database';
import { Favorite } from '@modules/favorites/favorite.types';

export class FavoriteRepository extends BaseRepository<Favorite> {
  constructor(tenantId: string) {
    super(getTenantModels(tenantId).FavoriteModel);
  }

  async deleteOne(filter: Record<string, unknown>): Promise<void> {
    await this.model.deleteOne(filter).exec();
  }
}
