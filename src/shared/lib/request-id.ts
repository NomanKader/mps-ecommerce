import { randomUUID } from 'crypto';

export const createRequestId = (): string => randomUUID();
