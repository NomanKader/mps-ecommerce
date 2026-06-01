import { BaseService } from '@core/base/BaseService';
import { UserRepository } from '@modules/users/user.repository';
import { User, UserResponse } from '@modules/users/user.types';

export class UserService extends BaseService {
  constructor(private readonly userRepository = new UserRepository()) {
    super();
  }

  async listUsers(tenantId?: string): Promise<UserResponse[]> {
    const users = await this.userRepository.find(tenantId ? { tenantId } : {});
    return users.map(({ password: _password, ...user }) => user);
  }

  async createUser(payload: Partial<User>): Promise<User> {
    return this.userRepository.create(payload);
  }
}
