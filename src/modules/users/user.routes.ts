import { Router } from 'express';

import { authMiddleware } from '@middlewares/auth.middleware';
import { roleMiddleware } from '@middlewares/role.middleware';
import { validateMiddleware } from '@middlewares/validate.middleware';
import { Role } from '@common/enums/role.enum';
import { UserController } from '@modules/users/user.controller';
import { createSystemUserSchema } from '@modules/users/user.validation';

const router = Router();
const controller = new UserController();

router.get('/', authMiddleware, roleMiddleware(Role.SYSTEM_ADMIN, Role.SUPER_ADMIN, Role.TENANT_ADMIN), controller.list);
router.post('/', validateMiddleware(createSystemUserSchema), controller.createSystemUser);

export default router;
