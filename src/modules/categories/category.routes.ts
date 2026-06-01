import { Router } from 'express';

import { CategoryController } from '@modules/categories/category.controller';
import { tenantMiddleware } from '@middlewares/tenant.middleware';

const router = Router();
const controller = new CategoryController();

router.get('/', tenantMiddleware, controller.list);

export default router;
