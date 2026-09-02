import { Router } from 'express';

import { PaymentController } from '@modules/payments/payment.controller';

const router = Router();
const controller = new PaymentController();

router.post('/mopayments/callback', controller.moPaymentsCallback);
router.post('/mopayments/return', controller.moPaymentsReturn);
router.get('/mopayments/return', controller.moPaymentsReturn);

export default router;
