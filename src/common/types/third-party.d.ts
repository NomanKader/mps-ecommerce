declare module 'xss-clean' {
  import { RequestHandler } from 'express';

  const xssClean: () => RequestHandler;
  export default xssClean;
}

declare module 'xss-clean/lib/xss' {
  export function clean(data?: unknown): unknown;
}
