import { Router } from 'express';

import { validateMiddleware } from '@middlewares/validate.middleware';
import { tenantMiddleware } from '@middlewares/tenant.middleware';
import { AdminController } from '@modules/admin/admin.controller';
import {
  categoryBodySchema,
  deliveryFeeBodySchema,
  idParamSchema,
  orderQuerySchema,
  orderStatusSchema,
  productBodySchema,
  promotionBodySchema
} from '@modules/admin/admin.validation';

const router = Router();
const controller = new AdminController();

router.use(tenantMiddleware);

router.get('/dashboard', controller.dashboard);

router.get('/products', controller.listProducts);
router.post('/products', validateMiddleware(productBodySchema), controller.createProduct);
router.put('/products/:id', validateMiddleware(productBodySchema), controller.updateProduct);
router.delete('/products/:id', validateMiddleware(idParamSchema), controller.deleteProduct);

router.get('/categories', controller.listCategories);
router.post('/categories', validateMiddleware(categoryBodySchema), controller.createCategory);
router.put('/categories/:id', validateMiddleware(categoryBodySchema), controller.updateCategory);
router.delete('/categories/:id', validateMiddleware(idParamSchema), controller.deleteCategory);

router.get('/orders', validateMiddleware(orderQuerySchema), controller.listOrders);
router.get('/orders/stats', controller.orderStats);
router.patch('/orders/:id/status', validateMiddleware(orderStatusSchema), controller.updateOrderStatus);

router.get('/customers', controller.listCustomers);

router.get('/promotions', controller.listPromotions);
router.post('/promotions', validateMiddleware(promotionBodySchema), controller.createPromotion);
router.put('/promotions/:id', validateMiddleware(promotionBodySchema), controller.updatePromotion);
router.delete('/promotions/:id', validateMiddleware(idParamSchema), controller.deletePromotion);

router.get('/delivery-fees', controller.listDeliveryFees);
router.post('/delivery-fees', validateMiddleware(deliveryFeeBodySchema), controller.createDeliveryFee);
router.put('/delivery-fees/:id', validateMiddleware(deliveryFeeBodySchema), controller.updateDeliveryFee);
router.delete('/delivery-fees/:id', validateMiddleware(idParamSchema), controller.deleteDeliveryFee);

export default router;
