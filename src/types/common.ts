export type Nullable<T> = T | null;

export type PaginatedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};

export type Role = 'super_admin' | 'tenant_admin' | 'staff' | 'customer';
