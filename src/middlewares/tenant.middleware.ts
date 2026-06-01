import { NextFunction, Request, Response } from 'express';

import { env } from '@config/env';

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

export const tenantMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  const headerTenant = req.header(env.TENANT_HEADER_KEY);
  const tokenTenant = req.auth?.tenantId;
  const subdomainTenant = extractSubdomainTenant(req.hostname);

  req.tenant = {
    tenantId: headerTenant ?? tokenTenant ?? subdomainTenant,
    tenantSource: headerTenant ? 'header' : tokenTenant ? 'token' : subdomainTenant ? 'subdomain' : 'unknown'
  };

  next();
};
