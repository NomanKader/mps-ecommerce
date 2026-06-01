import { Router } from 'express';

import { authMiddleware } from '@middlewares/auth.middleware';
import { tenantMiddleware } from '@middlewares/tenant.middleware';
import { CartController } from '@modules/carts/cart.controller';

const router = Router();
const controller = new CartController();

router.get('/', tenantMiddleware, authMiddleware, controller.list);

export default router;
