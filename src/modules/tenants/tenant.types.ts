export interface TenantSettings {
  locale?: string;
  currency?: string;
  timezone?: string;
}

export interface TenantBranding {
  logoUrl?: string;
  primaryColor?: string;
}

export interface Tenant {
  _id: string;
  tenantId: string;
  name: string;
  slug: string;
  databaseName: string;
  status: 'active' | 'inactive' | 'trial';
  subscriptionPlan?: string;
  settings?: TenantSettings;
  branding?: TenantBranding;
  featureFlags?: string[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
