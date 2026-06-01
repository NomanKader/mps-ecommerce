import { Router } from 'express';

import { AuthController } from '@modules/auth/auth.controller';
import { loginSchema, registerSchema, requestOtpSchema } from '@modules/auth/auth.validation';
import { authMiddleware } from '@middlewares/auth.middleware';
import { tenantMiddleware } from '@middlewares/tenant.middleware';
import { validateMiddleware } from '@middlewares/validate.middleware';

const router = Router();
const controller = new AuthController();

router.post('/otp/request', tenantMiddleware, validateMiddleware(requestOtpSchema), controller.requestOtp);
router.post('/register', tenantMiddleware, validateMiddleware(registerSchema), controller.register);
router.post('/login', tenantMiddleware, validateMiddleware(loginSchema), controller.login);
router.get('/me', authMiddleware, controller.me);
router.post('/logout', authMiddleware, controller.logout);

export default router;
