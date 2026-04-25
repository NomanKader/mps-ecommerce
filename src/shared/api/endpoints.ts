export const endpoints = {
  auth: {
    login: '/auth/login',
    profile: '/auth/profile',
    register: '/auth/register',
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
