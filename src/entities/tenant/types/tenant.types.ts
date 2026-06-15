export type TenantBranding = {
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
};

export type Tenant = {
  branding: TenantBranding;
  databaseName?: string;
  id: string;
  name: string;
  plan: 'starter' | 'growth' | 'enterprise';
  slug: string;
  status: 'active' | 'inactive' | 'trial';
  tenantId: string;
};
