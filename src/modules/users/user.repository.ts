import { BaseRepository } from '@core/base/BaseRepository';
import { UserModel } from '@modules/users/user.model';
import { User } from '@modules/users/user.types';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(UserModel);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ email });
  }

  async findManyByEmail(email: string): Promise<User[]> {
    return this.find({ email });
  }
}
