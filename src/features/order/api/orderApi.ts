import { endpoints } from '@shared/api/endpoints';
import { mockOrders } from '@shared/lib/mockData';

import type { Order } from '@entities/order/types/order.types';

export const orderApi = {
  async getOrders(): Promise<Order[]> {
    void endpoints.orders.list;

    return Promise.resolve(mockOrders);
  },
};
