import { BaseRepository } from '@core/base/BaseRepository';
import { getTenantModels } from '@core/database/tenant-database';
import { SystemUserModel } from '@modules/users/user.model';
import { User } from '@modules/users/user.types';

export class UserRepository extends BaseRepository<User> {
  constructor(tenantId?: string) {
    super(tenantId ? getTenantModels(tenantId).UserModel : SystemUserModel);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ email });
  }

  async findManyByEmail(email: string): Promise<User[]> {
    return this.find({ email });
  }

  async findTenantDashboardUsers(tenantId: string): Promise<User[]> {
    return this.model
      .find({
        tenantId,
        isDeleted: { $ne: true },
        role: 'staff'
      })
      .sort({ createdAt: -1 })
      .lean<User[]>()
      .exec();
  }

  async updateById(id: string, payload: Record<string, unknown>): Promise<User | null> {
    return this.model
      .findOneAndUpdate({ _id: id, isDeleted: { $ne: true } }, payload, { new: true })
      .lean<User | null>()
      .exec();
  }
}
