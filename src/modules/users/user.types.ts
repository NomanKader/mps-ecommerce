import { Role } from '@common/enums/role.enum';

export interface User {
  _id: string;
  tenantId?: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  phoneVerifiedAt?: Date;
  password: string;
  role: Role;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type UserResponse = Omit<User, 'password'>;
