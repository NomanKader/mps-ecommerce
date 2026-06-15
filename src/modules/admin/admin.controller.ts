import { Request, Response } from 'express';

import { BaseController } from '@core/base/BaseController';
import { HTTP_STATUS } from '@core/response/http-status';
import { AdminService } from '@modules/admin/admin.service';
import { asyncHandler } from '@utils/asyncHandler';

const routeId = (req: Request): string => String(req.params.id);

export class AdminController extends BaseController {
  constructor(private readonly adminService = new AdminService()) {
    super();
  }

  dashboard = asyncHandler(async (req: Request, res: Response) => {
    this.ok(res, await this.adminService.dashboard(req.tenant?.tenantId), 'Dashboard loaded');
  });

  listProducts = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.adminService.listProducts(req.tenant?.tenantId, req.query),
      'Products loaded'
    );
  });

  createProduct = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.adminService.createProduct(req.tenant?.tenantId, req.body, req.file),
      'Product created',
      HTTP_STATUS.CREATED
    );
  });

  bulkImportProducts = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.adminService.bulkImportProducts(req.tenant?.tenantId, req.body),
      'Products imported',
      HTTP_STATUS.CREATED
    );
  });

  updateProduct = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.adminService.updateProduct(req.tenant?.tenantId, routeId(req), req.body, req.file),
      'Product updated'
    );
  });

  deleteProduct = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.adminService.deleteProduct(req.tenant?.tenantId, routeId(req)),
      'Product deleted'
    );
  });

  getProfile = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.adminService.getAdminProfile(req.tenant?.tenantId, req.auth?.userId),
      'Profile loaded'
    );
  });

  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.adminService.updateAdminProfile(req.tenant?.tenantId, req.auth?.userId, req.body),
      'Profile updated'
    );
  });

  listCarousel = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.adminService.listCarousel(req.tenant?.tenantId, req.query),
      'Carousel slides loaded'
    );
  });

  createCarouselSlide = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.adminService.createCarouselSlide(req.tenant?.tenantId, req.body, req.file),
      'Carousel slide created',
      HTTP_STATUS.CREATED
    );
  });

  updateCarouselSlide = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.adminService.updateCarouselSlide(
        req.tenant?.tenantId,
        routeId(req),
        req.body,
        req.file
      ),
      'Carousel slide updated'
    );
  });

  deleteCarouselSlide = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.adminService.deleteCarouselSlide(req.tenant?.tenantId, routeId(req)),
      'Carousel slide deleted'
    );
  });

  listStorefrontIcons = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.adminService.listStorefrontIcons(req.tenant?.tenantId, req.query),
      'Storefront icons loaded'
    );
  });

  createStorefrontIcon = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.adminService.createStorefrontIcon(req.tenant?.tenantId, req.body),
      'Storefront icon created',
      HTTP_STATUS.CREATED
    );
  });

  updateStorefrontIcon = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.adminService.updateStorefrontIcon(req.tenant?.tenantId, routeId(req), req.body),
      'Storefront icon updated'
    );
  });

  deleteStorefrontIcon = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.adminService.deleteStorefrontIcon(req.tenant?.tenantId, routeId(req)),
      'Storefront icon deleted'
    );
  });

  listSecondaryCategories = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.adminService.listSecondaryCategories(req.tenant?.tenantId, req.query),
      'Secondary categories loaded'
    );
  });

  createSecondaryCategory = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.adminService.createSecondaryCategory(req.tenant?.tenantId, req.body),
      'Secondary category created',
      HTTP_STATUS.CREATED
    );
  });

  updateSecondaryCategory = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.adminService.updateSecondaryCategory(req.tenant?.tenantId, routeId(req), req.body),
      'Secondary category updated'
    );
  });

  deleteSecondaryCategory = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.adminService.deleteSecondaryCategory(req.tenant?.tenantId, routeId(req)),
      'Secondary category deleted'
    );
  });

  listProductSections = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.adminService.listProductSections(req.tenant?.tenantId),
      'Product sections loaded'
    );
  });

  createProductSectionAssignment = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.adminService.createProductSectionAssignment(req.tenant?.tenantId, req.body),
      'Product section assignment created',
      HTTP_STATUS.CREATED
    );
  });

  updateProductSectionAssignment = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.adminService.updateProductSectionAssignment(
        req.tenant?.tenantId,
        routeId(req),
        req.body
      ),
      'Product section assignment updated'
    );
  });

  deleteProductSectionAssignment = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.adminService.deleteProductSectionAssignment(req.tenant?.tenantId, routeId(req)),
      'Product section assignment deleted'
    );
  });

  listCategories = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.adminService.listCategories(req.tenant?.tenantId, req.query),
      'Categories loaded'
    );
  });

  createCategory = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.adminService.createCategory(req.tenant?.tenantId, req.body),
      'Category created',
      HTTP_STATUS.CREATED
    );
  });

  updateCategory = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.adminService.updateCategory(req.tenant?.tenantId, routeId(req), req.body),
      'Category updated'
    );
  });

  deleteCategory = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.adminService.deleteCategory(req.tenant?.tenantId, routeId(req)),
      'Category deleted'
    );
  });

  listOrders = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.adminService.listOrders(req.tenant?.tenantId, req.query),
      'Orders loaded'
    );
  });

  orderStats = asyncHandler(async (req: Request, res: Response) => {
    this.ok(res, await this.adminService.orderStats(req.tenant?.tenantId), 'Order stats loaded');
  });

  updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.adminService.updateOrderStatus(
        req.tenant?.tenantId,
        routeId(req),
        req.body.status
      ),
      'Order status updated'
    );
  });

  listCustomers = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.adminService.listCustomers(req.tenant?.tenantId, req.query),
      'Customers loaded'
    );
  });

  listPromotions = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.adminService.listPromotions(req.tenant?.tenantId, req.query),
      'Promotions loaded'
    );
  });

  createPromotion = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.adminService.createPromotion(req.tenant?.tenantId, req.body),
      'Promotion created',
      HTTP_STATUS.CREATED
    );
  });

  updatePromotion = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.adminService.updatePromotion(req.tenant?.tenantId, routeId(req), req.body),
      'Promotion updated'
    );
  });

  deletePromotion = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.adminService.deletePromotion(req.tenant?.tenantId, routeId(req)),
      'Promotion deleted'
    );
  });

  listRegions = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.adminService.listRegions(req.tenant?.tenantId, req.query),
      'Regions loaded'
    );
  });

  createRegion = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.adminService.createRegion(req.tenant?.tenantId, req.body),
      'Region created',
      HTTP_STATUS.CREATED
    );
  });

  updateRegion = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.adminService.updateRegion(req.tenant?.tenantId, routeId(req), req.body),
      'Region updated'
    );
  });

  deleteRegion = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.adminService.deleteRegion(req.tenant?.tenantId, routeId(req)),
      'Region deleted'
    );
  });

  listTownships = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.adminService.listTownships(req.tenant?.tenantId, req.query),
      'Townships loaded'
    );
  });

  createTownship = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.adminService.createTownship(req.tenant?.tenantId, req.body),
      'Township created',
      HTTP_STATUS.CREATED
    );
  });

  updateTownship = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.adminService.updateTownship(req.tenant?.tenantId, routeId(req), req.body),
      'Township updated'
    );
  });

  deleteTownship = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.adminService.deleteTownship(req.tenant?.tenantId, routeId(req)),
      'Township deleted'
    );
  });

  listDeliveryFees = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.adminService.listDeliveryFees(req.tenant?.tenantId, req.query),
      'Delivery fees loaded'
    );
  });

  createDeliveryFee = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.adminService.createDeliveryFee(req.tenant?.tenantId, req.body),
      'Delivery fee created',
      HTTP_STATUS.CREATED
    );
  });

  updateDeliveryFee = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.adminService.updateDeliveryFee(req.tenant?.tenantId, routeId(req), req.body),
      'Delivery fee updated'
    );
  });

  deleteDeliveryFee = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.adminService.deleteDeliveryFee(req.tenant?.tenantId, routeId(req)),
      'Delivery fee deleted'
    );
  });
}
