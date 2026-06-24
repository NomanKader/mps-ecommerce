import { Router } from 'express';

import { authMiddleware } from '@middlewares/auth.middleware';
import { tenantMiddleware } from '@middlewares/tenant.middleware';
import { walletReceiptUploadMiddleware } from '@middlewares/wallet-receipt-upload.middleware';
import { WalletController } from '@modules/wallets/wallet.controller';

const router = Router();
const controller = new WalletController();

router.get('/', tenantMiddleware, authMiddleware, controller.getCustomerWallet);
router.post('/topups', tenantMiddleware, authMiddleware, walletReceiptUploadMiddleware, controller.createTopUpRequest);

export default router;
