import { Router } from 'express';

import adminRoutes from '@modules/admin/admin.routes';
import authRoutes from '@modules/auth/auth.routes';
import cartRoutes from '@modules/carts/cart.routes';
import categoryRoutes from '@modules/categories/category.routes';
import favoriteRoutes from '@modules/favorites/favorite.routes';
import orderRoutes from '@modules/orders/order.routes';
import productRoutes from '@modules/products/product.routes';
import storefrontRoutes from '@modules/storefront/storefront.routes';
import tenantRoutes from '@modules/tenants/tenant.routes';
import userRoutes from '@modules/users/user.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    data: {
      status: 'ok'
    }
  });
});

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/users', userRoutes);
router.use('/tenants', tenantRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/carts', cartRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/orders', orderRoutes);
router.use('/storefront', storefrontRoutes);

export default router;
