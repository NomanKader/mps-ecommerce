import { Router } from 'express';

import { authMiddleware } from '@middlewares/auth.middleware';
import { tenantMiddleware } from '@middlewares/tenant.middleware';
import { validateMiddleware } from '@middlewares/validate.middleware';
import { AddressController } from '@modules/addresses/address.controller';
import { addressBodySchema, addressIdParamSchema, addressUpdateSchema } from '@modules/addresses/address.validation';

const router = Router();
const controller = new AddressController();

router.get('/', tenantMiddleware, authMiddleware, controller.list);
router.post('/', tenantMiddleware, authMiddleware, validateMiddleware(addressBodySchema), controller.create);
router.put('/:id', tenantMiddleware, authMiddleware, validateMiddleware(addressIdParamSchema), validateMiddleware(addressUpdateSchema), controller.update);
router.delete('/:id', tenantMiddleware, authMiddleware, validateMiddleware(addressIdParamSchema), controller.delete);

export default router;
