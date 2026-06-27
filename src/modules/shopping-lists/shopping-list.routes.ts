import { Router } from 'express';

import { authMiddleware } from '@middlewares/auth.middleware';
import { tenantMiddleware } from '@middlewares/tenant.middleware';
import { validateMiddleware } from '@middlewares/validate.middleware';
import { ShoppingListController } from '@modules/shopping-lists/shopping-list.controller';
import { shoppingListBodySchema, shoppingListNameSchema } from '@modules/shopping-lists/shopping-list.validation';

const router = Router();
const controller = new ShoppingListController();

router.use(tenantMiddleware, authMiddleware);
router.get('/', controller.list);
router.post('/', validateMiddleware(shoppingListBodySchema), controller.create);
router.put('/:id', validateMiddleware(shoppingListNameSchema), controller.rename);
router.delete('/:id', controller.remove);
router.put('/:id/products/:productId/toggle', controller.toggleProduct);

export default router;
