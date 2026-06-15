import { Role } from '@common/enums/role.enum';

export interface AuthContext {
  userId: string;
  tenantId?: string;
  role: Role;
}

export interface TenantContext {
  tenantId?: string;
  tenantSlug?: string;
  databaseName?: string;
  tenantSource?: 'header' | 'subdomain' | 'token' | 'unknown';
}
