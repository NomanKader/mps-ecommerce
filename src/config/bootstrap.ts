import {
  initializeTenantDatabase,
  registerTenantDatabaseAlias
} from '@core/database/tenant-database';
import { TenantModel } from '@modules/tenants/tenant.model';
import { logger } from '@config/logger';

export const preloadApplicationData = async (): Promise<void> => {
  const tenants = await TenantModel.find({ isDeleted: { $ne: true } }).lean();

  if (!tenants.length) {
    logger.info('No active tenants found during startup preload');
    return;
  }

  await Promise.all(
    tenants.map(async (tenant) => {
      const tenantId = tenant.tenantId ?? String(tenant._id);
      registerTenantDatabaseAlias(tenantId, tenant.slug);
      await initializeTenantDatabase(tenant.slug);
    })
  );

  logger.info(`Preloaded ${tenants.length} tenant database${tenants.length === 1 ? '' : 's'}`);
};
