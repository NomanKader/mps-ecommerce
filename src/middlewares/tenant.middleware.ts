import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';

import { env } from '@config/env';
import { registerTenantDatabaseAlias } from '@core/database/tenant-database';
import { HTTP_STATUS } from '@core/response/http-status';
import { TenantModel } from '@modules/tenants/tenant.model';
import { ApiError } from '@utils/ApiError';

const extractSubdomainTenant = (host?: string): string | undefined => {
  if (!host) {
    return undefined;
  }

  const parts = host.split('.');

  if (parts.length > 2) {
    return parts[0];
  }

  return undefined;
};

const resolveTenant = async (identifier: string) => {
  const value = identifier.trim();
  return TenantModel.findOne({
    isDeleted: { $ne: true },
    $or: [
      { tenantId: value },
      { slug: value.toLowerCase() },
      ...(Types.ObjectId.isValid(value) ? [{ _id: value }] : [])
    ]
  }).lean();
};

export const tenantMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const headerTenant = req.header(env.TENANT_HEADER_KEY);
  const tokenTenant = req.auth?.tenantId;
  const subdomainTenant = extractSubdomainTenant(req.hostname);
  const tenantIdentifier = headerTenant ?? tokenTenant ?? subdomainTenant;
  const tenantSource = headerTenant
    ? 'header'
    : tokenTenant
      ? 'token'
      : subdomainTenant
        ? 'subdomain'
        : 'unknown';

  if (!tenantIdentifier) {
    req.tenant = { tenantSource };
    next();
    return;
  }

  try {
    const tenant = await resolveTenant(tenantIdentifier);

    if (!tenant) {
      next(new ApiError(HTTP_STATUS.NOT_FOUND, 'Tenant not found'));
      return;
    }

    registerTenantDatabaseAlias(tenant.tenantId ?? String(tenant._id), tenant.slug);

    req.tenant = {
      tenantId: tenant.tenantId ?? String(tenant._id),
      tenantSlug: tenant.slug,
      databaseName: tenant.databaseName,
      tenantSource
    };

    next();
  } catch (error) {
    next(error);
  }
};
