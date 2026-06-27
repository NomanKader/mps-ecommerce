import { Router } from 'express';

import { authMiddleware } from '@middlewares/auth.middleware';
import { tenantMiddleware } from '@middlewares/tenant.middleware';
import { OrderController } from '@modules/orders/order.controller';
import { createOrderSchema, deliveryQuoteSchema } from '@modules/orders/order.validation';
import { validateMiddleware } from '@middlewares/validate.middleware';

const router = Router();
const controller = new OrderController();

router.get('/', tenantMiddleware, authMiddleware, controller.list);
router.post(
  '/delivery-quote',
  tenantMiddleware,
  authMiddleware,
  validateMiddleware(deliveryQuoteSchema),
  controller.deliveryQuote
);
router.post(
  '/',
  tenantMiddleware,
  authMiddleware,
  validateMiddleware(createOrderSchema),
  controller.create
);

export default router;
