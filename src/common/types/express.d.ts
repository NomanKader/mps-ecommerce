import { AuthContext, TenantContext } from '@common/interfaces/request-context.interface';

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
      tenant?: TenantContext;
    }
  }
}

export {};
