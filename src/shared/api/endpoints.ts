export const endpoints = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    me: '/auth/me',
    requestOtp: '/auth/otp/request',
    register: '/auth/register',
  },
  admin: {
    categories: '/admin/categories',
    category: (id: string) => `/admin/categories/${id}`,
    customers: '/admin/customers',
    deliveryFee: (id: string) => `/admin/delivery-fees/${id}`,
    deliveryFees: '/admin/delivery-fees',
    orderStats: '/admin/orders/stats',
    orderStatus: (id: string) => `/admin/orders/${id}/status`,
    orders: '/admin/orders',
    product: (id: string) => `/admin/products/${id}`,
    products: '/admin/products',
    promotion: (id: string) => `/admin/promotions/${id}`,
    promotions: '/admin/promotions',
  },
  categories: {
    list: '/categories',
  },
  orders: {
    list: '/orders',
  },
  products: {
    details: (productId: string) => `/products/${productId}`,
    list: '/products',
  },
};
