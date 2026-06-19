import { NextFunction, Request, Response, Router } from 'express';

import { Role } from '@common/enums/role.enum';
import { HTTP_STATUS } from '@core/response/http-status';
import { bulkProductUploadMiddleware } from '@middlewares/bulk-product-upload.middleware';
import { authMiddleware } from '@middlewares/auth.middleware';
import { productImageUploadMiddleware } from '@middlewares/product-image-upload.middleware';
import { roleMiddleware } from '@middlewares/role.middleware';
import { validateMiddleware } from '@middlewares/validate.middleware';
import { AdminController } from '@modules/admin/admin.controller';
import { UserController } from '@modules/users/user.controller';
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
import {
  createTenantDashboardUserSchema,
  tenantDashboardUserIdSchema,
  updateTenantDashboardUserSchema
} from '@modules/users/user.validation';

const router = Router();
const controller = new AdminController();
const userController = new UserController();

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
const dashboardAccess = [
  authMiddleware,
  roleMiddleware(Role.TENANT_ADMIN, Role.STAFF),
  useAuthenticatedTenant
];

router.get('/dashboard', dashboardAccess, controller.dashboard);

router.get('/users', tenantAdminOnly, userController.listTenantDashboardUsers);
router.post(
  '/users',
  tenantAdminOnly,
  validateMiddleware(createTenantDashboardUserSchema),
  userController.createTenantDashboardUser
);
router.put(
  '/users/:id',
  tenantAdminOnly,
  validateMiddleware(updateTenantDashboardUserSchema),
  userController.updateTenantDashboardUser
);
router.delete(
  '/users/:id',
  tenantAdminOnly,
  validateMiddleware(tenantDashboardUserIdSchema),
  userController.deleteTenantDashboardUser
);

router.get(
  '/products',
  dashboardAccess,
  validateMiddleware(productQuerySchema),
  controller.listProducts
);
router.post(
  '/products',
  dashboardAccess,
  productImageUploadMiddleware,
  validateMiddleware(productBodySchema),
  controller.createProduct
);
router.post(
  '/products/bulk',
  dashboardAccess,
  bulkProductUploadMiddleware,
  validateMiddleware(bulkProductsBodySchema),
  controller.bulkImportProducts
);
router.put(
  '/products/:id',
  dashboardAccess,
  productImageUploadMiddleware,
  validateMiddleware(productBodySchema),
  controller.updateProduct
);
router.delete(
  '/products/:id',
  dashboardAccess,
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
  dashboardAccess,
  validateMiddleware(carouselQuerySchema),
  controller.listCarousel
);
router.post(
  '/carousel',
  dashboardAccess,
  productImageUploadMiddleware,
  validateMiddleware(carouselBodySchema),
  controller.createCarouselSlide
);
router.put(
  '/carousel/:id',
  dashboardAccess,
  productImageUploadMiddleware,
  validateMiddleware(carouselBodySchema),
  controller.updateCarouselSlide
);
router.delete(
  '/carousel/:id',
  dashboardAccess,
  validateMiddleware(idParamSchema),
  controller.deleteCarouselSlide
);

router.get(
  '/storefront-icons',
  dashboardAccess,
  validateMiddleware(storefrontIconQuerySchema),
  controller.listStorefrontIcons
);
router.post(
  '/storefront-icons',
  dashboardAccess,
  validateMiddleware(storefrontIconBodySchema),
  controller.createStorefrontIcon
);
router.put(
  '/storefront-icons/:id',
  dashboardAccess,
  validateMiddleware(storefrontIconBodySchema),
  controller.updateStorefrontIcon
);
router.delete(
  '/storefront-icons/:id',
  dashboardAccess,
  validateMiddleware(idParamSchema),
  controller.deleteStorefrontIcon
);

router.get(
  '/secondary-categories',
  dashboardAccess,
  validateMiddleware(secondaryCategoryQuerySchema),
  controller.listSecondaryCategories
);
router.post(
  '/secondary-categories',
  dashboardAccess,
  validateMiddleware(secondaryCategoryBodySchema),
  controller.createSecondaryCategory
);
router.put(
  '/secondary-categories/:id',
  dashboardAccess,
  validateMiddleware(secondaryCategoryBodySchema),
  controller.updateSecondaryCategory
);
router.delete(
  '/secondary-categories/:id',
  dashboardAccess,
  validateMiddleware(idParamSchema),
  controller.deleteSecondaryCategory
);

router.get('/product-sections', dashboardAccess, controller.listProductSections);
router.post(
  '/product-sections/assignments',
  dashboardAccess,
  validateMiddleware(productSectionAssignmentBodySchema),
  controller.createProductSectionAssignment
);
router.put(
  '/product-sections/assignments/:id',
  dashboardAccess,
  validateMiddleware(productSectionAssignmentUpdateSchema),
  controller.updateProductSectionAssignment
);
router.delete(
  '/product-sections/assignments/:id',
  dashboardAccess,
  validateMiddleware(idParamSchema),
  controller.deleteProductSectionAssignment
);

router.get('/categories', dashboardAccess, controller.listCategories);
router.post(
  '/categories',
  dashboardAccess,
  validateMiddleware(categoryBodySchema),
  controller.createCategory
);
router.put(
  '/categories/:id',
  dashboardAccess,
  validateMiddleware(categoryBodySchema),
  controller.updateCategory
);
router.delete(
  '/categories/:id',
  dashboardAccess,
  validateMiddleware(idParamSchema),
  controller.deleteCategory
);

router.get('/orders', dashboardAccess, validateMiddleware(orderQuerySchema), controller.listOrders);
router.get('/orders/stats', dashboardAccess, controller.orderStats);
router.patch(
  '/orders/:id/status',
  dashboardAccess,
  validateMiddleware(orderStatusSchema),
  controller.updateOrderStatus
);

router.get(
  '/customers',
  dashboardAccess,
  validateMiddleware(customerQuerySchema),
  controller.listCustomers
);

router.get('/promotions', dashboardAccess, controller.listPromotions);
router.post(
  '/promotions',
  dashboardAccess,
  validateMiddleware(promotionBodySchema),
  controller.createPromotion
);
router.put(
  '/promotions/:id',
  dashboardAccess,
  validateMiddleware(promotionBodySchema),
  controller.updatePromotion
);
router.delete(
  '/promotions/:id',
  dashboardAccess,
  validateMiddleware(idParamSchema),
  controller.deletePromotion
);

router.get(
  '/regions',
  dashboardAccess,
  validateMiddleware(regionQuerySchema),
  controller.listRegions
);
router.post(
  '/regions',
  dashboardAccess,
  validateMiddleware(regionBodySchema),
  controller.createRegion
);
router.put(
  '/regions/:id',
  dashboardAccess,
  validateMiddleware(regionBodySchema),
  controller.updateRegion
);
router.delete(
  '/regions/:id',
  dashboardAccess,
  validateMiddleware(idParamSchema),
  controller.deleteRegion
);

router.get(
  '/townships',
  dashboardAccess,
  validateMiddleware(townshipQuerySchema),
  controller.listTownships
);
router.post(
  '/townships',
  dashboardAccess,
  validateMiddleware(townshipBodySchema),
  controller.createTownship
);
router.put(
  '/townships/:id',
  dashboardAccess,
  validateMiddleware(townshipBodySchema),
  controller.updateTownship
);
router.delete(
  '/townships/:id',
  dashboardAccess,
  validateMiddleware(idParamSchema),
  controller.deleteTownship
);

router.get('/delivery-fees', dashboardAccess, controller.listDeliveryFees);
router.post(
  '/delivery-fees',
  dashboardAccess,
  validateMiddleware(deliveryFeeBodySchema),
  controller.createDeliveryFee
);
router.put(
  '/delivery-fees/:id',
  dashboardAccess,
  validateMiddleware(deliveryFeeBodySchema),
  controller.updateDeliveryFee
);
router.delete(
  '/delivery-fees/:id',
  dashboardAccess,
  validateMiddleware(idParamSchema),
  controller.deleteDeliveryFee
);

export default router;
