import { Router } from 'express';

import adminRoutes from '@modules/admin/admin.routes';
import authRoutes from '@modules/auth/auth.routes';
import cartRoutes from '@modules/carts/cart.routes';
import categoryRoutes from '@modules/categories/category.routes';
import orderRoutes from '@modules/orders/order.routes';
import productRoutes from '@modules/products/product.routes';
import tenantRoutes from '@modules/tenants/tenant.routes';
import userRoutes from '@modules/users/user.routes';
import { ApiResponse } from '@utils/ApiResponse';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json(
    ApiResponse.success(
      {
        status: 'ok',
        timestamp: new Date().toISOString()
      },
      'Service is healthy'
    )
  );
});

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/users', userRoutes);
router.use('/tenants', tenantRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/carts', cartRoutes);
router.use('/orders', orderRoutes);

export default router;
