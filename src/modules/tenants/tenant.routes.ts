import { Router } from 'express';

import { authMiddleware } from '@middlewares/auth.middleware';
import { roleMiddleware } from '@middlewares/role.middleware';
import { Role } from '@common/enums/role.enum';
import { TenantController } from '@modules/tenants/tenant.controller';
import { validateMiddleware } from '@middlewares/validate.middleware';
import { createTenantAdminSchema } from '@modules/users/user.validation';
import { createTenantSchema, tenantSlugParamSchema, updateTenantSchema } from '@modules/tenants/tenant.validation';

const router = Router();
const controller = new TenantController();

router.use(authMiddleware, roleMiddleware(Role.SYSTEM_ADMIN));

router.get('/', controller.list);
router.post('/', validateMiddleware(createTenantSchema), controller.create);
router.post('/admins', validateMiddleware(createTenantAdminSchema), controller.createAdmin);
router.get('/:tenantId', validateMiddleware(tenantSlugParamSchema), controller.get);
router.put('/:tenantId', validateMiddleware(updateTenantSchema), controller.update);
router.delete('/:tenantId', validateMiddleware(tenantSlugParamSchema), controller.delete);
router.post(
  '/:tenantId/admins',
  validateMiddleware(createTenantAdminSchema),
  controller.createAdmin
);

export default router;
