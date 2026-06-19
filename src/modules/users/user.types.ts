import { Role } from '@common/enums/role.enum';

export type DashboardRole =
  | 'store_owner'
  | 'operations_manager'
  | 'catalog_manager'
  | 'order_fulfillment'
  | 'customer_support'
  | 'marketing_manager'
  | 'delivery_manager'
  | 'finance_viewer';

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
  dashboardRole?: DashboardRole;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type UserResponse = Omit<User, 'password'>;
