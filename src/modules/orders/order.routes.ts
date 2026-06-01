import { Router } from 'express';

import { authMiddleware } from '@middlewares/auth.middleware';
import { tenantMiddleware } from '@middlewares/tenant.middleware';
import { OrderController } from '@modules/orders/order.controller';

const router = Router();
const controller = new OrderController();

router.get('/', tenantMiddleware, authMiddleware, controller.list);

export default router;
