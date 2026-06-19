import { Router } from 'express';

import { authMiddleware } from '@middlewares/auth.middleware';
import { tenantMiddleware } from '@middlewares/tenant.middleware';
import { FavoriteController } from '@modules/favorites/favorite.controller';

const router = Router();
const controller = new FavoriteController();

router.get('/', tenantMiddleware, authMiddleware, controller.list);
router.put('/:productId/toggle', tenantMiddleware, authMiddleware, controller.toggle);

export default router;
