import { Router } from 'express';

import { authMiddleware } from '@middlewares/auth.middleware';
import { roleMiddleware } from '@middlewares/role.middleware';
import { Role } from '@common/enums/role.enum';
import { TenantController } from '@modules/tenants/tenant.controller';

const router = Router();
const controller = new TenantController();

router.get('/', authMiddleware, roleMiddleware(Role.SUPER_ADMIN), controller.list);

export default router;
