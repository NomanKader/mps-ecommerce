import { vi } from 'vitest';

import { adminApi } from '@features/admin/api/adminApi';
import { apiClient } from '@shared/api/axios';
import { endpoints } from '@shared/api/endpoints';

vi.mock('@shared/api/axios', () => ({
  apiClient: {
    delete: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

describe('adminApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists products with compact query params and maps Mongo ids', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        data: [
          {
            _id: 'product-1',
            currency: 'USD',
            description: '',
            name: 'Apples',
            price: 4,
            rating: 5,
            sku: 'APL',
            status: 'active',
            stock: 3,
            tags: [],
          },
        ],
        message: 'Products fetched',
        success: true,
      },
    });

    const products = await adminApi.listProducts({
      categoryId: 'category-1',
      search: '',
    });

    expect(apiClient.get).toHaveBeenCalledWith(endpoints.admin.products, {
      params: { categoryId: 'category-1' },
      signal: undefined,
    });
    expect(products[0]?.id).toBe('product-1');
  });

  it('updates an order status through the status endpoint', async () => {
    vi.mocked(apiClient.patch).mockResolvedValue({
      data: { data: {}, message: 'Order status updated', success: true },
    });

    await adminApi.updateOrderStatus('order-1', 'shipped');

    expect(apiClient.patch).toHaveBeenCalledWith(endpoints.admin.orderStatus('order-1'), {
      status: 'shipped',
    });
  });

  it('sends delivery fee payloads using backend field names', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        data: {
          _id: 'fee-1',
          eta: 'Same day',
          fee: 2.5,
          freeOver: 50,
          region: 'Yangon',
          status: 'active',
          township: 'Kamayut',
        },
        message: 'Delivery fee created',
        success: true,
      },
    });
    const payload = {
      eta: 'Same day',
      fee: 2.5,
      freeOver: 50,
      region: 'Yangon',
      status: 'active' as const,
      township: 'Kamayut',
    };

    await adminApi.createDeliveryFee(payload);

    expect(apiClient.post).toHaveBeenCalledWith(endpoints.admin.deliveryFees, payload);
  });
});
