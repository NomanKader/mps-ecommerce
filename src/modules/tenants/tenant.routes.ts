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
router.get('/:tenantSlug', validateMiddleware(tenantSlugParamSchema), controller.get);
router.put('/:tenantSlug', validateMiddleware(updateTenantSchema), controller.update);
router.delete('/:tenantSlug', validateMiddleware(tenantSlugParamSchema), controller.delete);
router.post(
  '/:tenantSlug/admins',
  validateMiddleware(createTenantAdminSchema),
  controller.createAdmin
);

export default router;
