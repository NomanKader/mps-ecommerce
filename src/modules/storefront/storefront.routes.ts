import { Router } from 'express';

import { validateMiddleware } from '@middlewares/validate.middleware';
import { tenantMiddleware } from '@middlewares/tenant.middleware';
import { StorefrontController } from '@modules/storefront/storefront.controller';
import { requiredStorefrontIconQuerySchema, storefrontCarouselQuerySchema } from '@modules/admin/admin.validation';

const router = Router();
const controller = new StorefrontController();

router.use(tenantMiddleware);

router.get('/header-settings', controller.headerSettings);
router.get('/carousel', validateMiddleware(storefrontCarouselQuerySchema), controller.carousel);
router.get('/icons', validateMiddleware(requiredStorefrontIconQuerySchema), controller.icons);
router.get('/product-sections', controller.productSections);

export default router;
