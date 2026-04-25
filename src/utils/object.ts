export const omitEmptyValues = <T extends Record<string, unknown>>(payload: T) =>
  Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== '' && value !== null && value !== undefined),
  ) as Partial<T>;
