import { NextFunction, Request, Response, Router } from 'express';

import { Role } from '@common/enums/role.enum';
import { HTTP_STATUS } from '@core/response/http-status';
import { authMiddleware } from '@middlewares/auth.middleware';
import { productImageUploadMiddleware } from '@middlewares/product-image-upload.middleware';
import { roleMiddleware } from '@middlewares/role.middleware';
import { validateMiddleware } from '@middlewares/validate.middleware';
import { AdminController } from '@modules/admin/admin.controller';
import { ApiError } from '@utils/ApiError';
import {
  adminProfileBodySchema,
  bulkProductsBodySchema,
  categoryBodySchema,
  carouselBodySchema,
  carouselQuerySchema,
  customerQuerySchema,
  deliveryFeeBodySchema,
  idParamSchema,
  orderQuerySchema,
  orderStatusSchema,
  productBodySchema,
  productQuerySchema,
  productSectionAssignmentBodySchema,
  productSectionAssignmentUpdateSchema,
  promotionBodySchema,
  regionBodySchema,
  regionQuerySchema,
  secondaryCategoryBodySchema,
  secondaryCategoryQuerySchema,
  storefrontIconBodySchema,
  storefrontIconQuerySchema,
  townshipBodySchema,
  townshipQuerySchema
} from '@modules/admin/admin.validation';

const router = Router();
const controller = new AdminController();

const useAuthenticatedTenant = (req: Request, _res: Response, next: NextFunction): void => {
  const tokenTenant = req.auth?.tenantId;

  if (!tokenTenant) {
    next(new ApiError(HTTP_STATUS.FORBIDDEN, 'Tenant context is required'));
    return;
  }

  req.tenant = {
    tenantId: tokenTenant,
    tenantSource: 'token'
  };

  next();
};

const tenantAdminOnly = [authMiddleware, roleMiddleware(Role.TENANT_ADMIN), useAuthenticatedTenant];

router.get('/dashboard', tenantAdminOnly, controller.dashboard);

router.get(
  '/products',
  tenantAdminOnly,
  validateMiddleware(productQuerySchema),
  controller.listProducts
);
router.post(
  '/products',
  tenantAdminOnly,
  productImageUploadMiddleware,
  validateMiddleware(productBodySchema),
  controller.createProduct
);
router.post(
  '/products/bulk',
  tenantAdminOnly,
  validateMiddleware(bulkProductsBodySchema),
  controller.bulkImportProducts
);
router.put(
  '/products/:id',
  tenantAdminOnly,
  productImageUploadMiddleware,
  validateMiddleware(productBodySchema),
  controller.updateProduct
);
router.delete(
  '/products/:id',
  tenantAdminOnly,
  validateMiddleware(idParamSchema),
  controller.deleteProduct
);

router.get('/profile', tenantAdminOnly, controller.getProfile);
router.put(
  '/profile',
  tenantAdminOnly,
  validateMiddleware(adminProfileBodySchema),
  controller.updateProfile
);

router.get(
  '/carousel',
  tenantAdminOnly,
  validateMiddleware(carouselQuerySchema),
  controller.listCarousel
);
router.post(
  '/carousel',
  tenantAdminOnly,
  productImageUploadMiddleware,
  validateMiddleware(carouselBodySchema),
  controller.createCarouselSlide
);
router.put(
  '/carousel/:id',
  tenantAdminOnly,
  productImageUploadMiddleware,
  validateMiddleware(carouselBodySchema),
  controller.updateCarouselSlide
);
router.delete(
  '/carousel/:id',
  tenantAdminOnly,
  validateMiddleware(idParamSchema),
  controller.deleteCarouselSlide
);

router.get(
  '/storefront-icons',
  tenantAdminOnly,
  validateMiddleware(storefrontIconQuerySchema),
  controller.listStorefrontIcons
);
router.post(
  '/storefront-icons',
  tenantAdminOnly,
  validateMiddleware(storefrontIconBodySchema),
  controller.createStorefrontIcon
);
router.put(
  '/storefront-icons/:id',
  tenantAdminOnly,
  validateMiddleware(storefrontIconBodySchema),
  controller.updateStorefrontIcon
);
router.delete(
  '/storefront-icons/:id',
  tenantAdminOnly,
  validateMiddleware(idParamSchema),
  controller.deleteStorefrontIcon
);

router.get(
  '/secondary-categories',
  tenantAdminOnly,
  validateMiddleware(secondaryCategoryQuerySchema),
  controller.listSecondaryCategories
);
router.post(
  '/secondary-categories',
  tenantAdminOnly,
  validateMiddleware(secondaryCategoryBodySchema),
  controller.createSecondaryCategory
);
router.put(
  '/secondary-categories/:id',
  tenantAdminOnly,
  validateMiddleware(secondaryCategoryBodySchema),
  controller.updateSecondaryCategory
);
router.delete(
  '/secondary-categories/:id',
  tenantAdminOnly,
  validateMiddleware(idParamSchema),
  controller.deleteSecondaryCategory
);

router.get('/product-sections', tenantAdminOnly, controller.listProductSections);
router.post(
  '/product-sections/assignments',
  tenantAdminOnly,
  validateMiddleware(productSectionAssignmentBodySchema),
  controller.createProductSectionAssignment
);
router.put(
  '/product-sections/assignments/:id',
  tenantAdminOnly,
  validateMiddleware(productSectionAssignmentUpdateSchema),
  controller.updateProductSectionAssignment
);
router.delete(
  '/product-sections/assignments/:id',
  tenantAdminOnly,
  validateMiddleware(idParamSchema),
  controller.deleteProductSectionAssignment
);

router.get('/categories', tenantAdminOnly, controller.listCategories);
router.post(
  '/categories',
  tenantAdminOnly,
  validateMiddleware(categoryBodySchema),
  controller.createCategory
);
router.put(
  '/categories/:id',
  tenantAdminOnly,
  validateMiddleware(categoryBodySchema),
  controller.updateCategory
);
router.delete(
  '/categories/:id',
  tenantAdminOnly,
  validateMiddleware(idParamSchema),
  controller.deleteCategory
);

router.get('/orders', tenantAdminOnly, validateMiddleware(orderQuerySchema), controller.listOrders);
router.get('/orders/stats', tenantAdminOnly, controller.orderStats);
router.patch(
  '/orders/:id/status',
  tenantAdminOnly,
  validateMiddleware(orderStatusSchema),
  controller.updateOrderStatus
);

router.get(
  '/customers',
  tenantAdminOnly,
  validateMiddleware(customerQuerySchema),
  controller.listCustomers
);

router.get('/promotions', tenantAdminOnly, controller.listPromotions);
router.post(
  '/promotions',
  tenantAdminOnly,
  validateMiddleware(promotionBodySchema),
  controller.createPromotion
);
router.put(
  '/promotions/:id',
  tenantAdminOnly,
  validateMiddleware(promotionBodySchema),
  controller.updatePromotion
);
router.delete(
  '/promotions/:id',
  tenantAdminOnly,
  validateMiddleware(idParamSchema),
  controller.deletePromotion
);

router.get(
  '/regions',
  tenantAdminOnly,
  validateMiddleware(regionQuerySchema),
  controller.listRegions
);
router.post(
  '/regions',
  tenantAdminOnly,
  validateMiddleware(regionBodySchema),
  controller.createRegion
);
router.put(
  '/regions/:id',
  tenantAdminOnly,
  validateMiddleware(regionBodySchema),
  controller.updateRegion
);
router.delete(
  '/regions/:id',
  tenantAdminOnly,
  validateMiddleware(idParamSchema),
  controller.deleteRegion
);

router.get(
  '/townships',
  tenantAdminOnly,
  validateMiddleware(townshipQuerySchema),
  controller.listTownships
);
router.post(
  '/townships',
  tenantAdminOnly,
  validateMiddleware(townshipBodySchema),
  controller.createTownship
);
router.put(
  '/townships/:id',
  tenantAdminOnly,
  validateMiddleware(townshipBodySchema),
  controller.updateTownship
);
router.delete(
  '/townships/:id',
  tenantAdminOnly,
  validateMiddleware(idParamSchema),
  controller.deleteTownship
);

router.get('/delivery-fees', tenantAdminOnly, controller.listDeliveryFees);
router.post(
  '/delivery-fees',
  tenantAdminOnly,
  validateMiddleware(deliveryFeeBodySchema),
  controller.createDeliveryFee
);
router.put(
  '/delivery-fees/:id',
  tenantAdminOnly,
  validateMiddleware(deliveryFeeBodySchema),
  controller.updateDeliveryFee
);
router.delete(
  '/delivery-fees/:id',
  tenantAdminOnly,
  validateMiddleware(idParamSchema),
  controller.deleteDeliveryFee
);

export default router;
