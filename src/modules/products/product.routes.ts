import { Router } from 'express';

import { ProductController } from '@modules/products/product.controller';
import { tenantMiddleware } from '@middlewares/tenant.middleware';

const router = Router();
const controller = new ProductController();

router.get('/', tenantMiddleware, controller.list);

export default router;
