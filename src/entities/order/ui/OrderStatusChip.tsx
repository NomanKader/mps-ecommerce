import { Chip } from '@mui/material';

import type { Order } from '@entities/order/types/order.types';

const statusColorMap: Record<
  Order['status'],
  'default' | 'error' | 'info' | 'success' | 'warning'
> = {
  cancelled: 'error',
  delivered: 'success',
  fulfilled: 'success',
  pending: 'warning',
  processing: 'info',
  shipped: 'default',
};

export const OrderStatusChip = ({ status }: { status: Order['status'] }) => (
  <Chip
    color={statusColorMap[status]}
    label={status}
    size="small"
    sx={{ textTransform: 'capitalize' }}
  />
);
