import { Router } from 'express';

import { AuthController } from '@modules/auth/auth.controller';
import { changePasswordSchema, deleteAccountSchema, loginSchema, registerSchema, requestOtpSchema, updateProfileSchema } from '@modules/auth/auth.validation';
import { authMiddleware } from '@middlewares/auth.middleware';
import { tenantMiddleware } from '@middlewares/tenant.middleware';
import { validateMiddleware } from '@middlewares/validate.middleware';

const router = Router();
const controller = new AuthController();

router.post('/otp/request', validateMiddleware(requestOtpSchema), tenantMiddleware, controller.requestOtp);
router.post('/register', validateMiddleware(registerSchema), tenantMiddleware, controller.register);
router.post('/login', validateMiddleware(loginSchema), tenantMiddleware, controller.login);
router.get('/me', authMiddleware, controller.me);
router.put('/me', authMiddleware, validateMiddleware(updateProfileSchema), controller.updateMe);
router.delete('/me', authMiddleware, validateMiddleware(deleteAccountSchema), controller.deleteMe);
router.put('/password', authMiddleware, validateMiddleware(changePasswordSchema), controller.changePassword);
router.post('/logout', authMiddleware, controller.logout);

export default router;
