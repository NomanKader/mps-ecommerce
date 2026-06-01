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
    this.ok(res, await this.adminService.dashboard(req.tenant?.tenantId), 'Dashboard fetched');
  });

  listProducts = asyncHandler(async (req: Request, res: Response) => {
    this.ok(res, await this.adminService.listProducts(req.tenant?.tenantId, req.query), 'Products fetched');
  });

  createProduct = asyncHandler(async (req: Request, res: Response) => {
    this.ok(res, await this.adminService.createProduct(req.tenant?.tenantId, req.body), 'Product created', HTTP_STATUS.CREATED);
  });

  updateProduct = asyncHandler(async (req: Request, res: Response) => {
    this.ok(res, await this.adminService.updateProduct(req.tenant?.tenantId, routeId(req), req.body), 'Product updated');
  });

  deleteProduct = asyncHandler(async (req: Request, res: Response) => {
    this.ok(res, await this.adminService.deleteProduct(req.tenant?.tenantId, routeId(req)), 'Product deleted');
  });

  listCategories = asyncHandler(async (req: Request, res: Response) => {
    this.ok(res, await this.adminService.listCategories(req.tenant?.tenantId, req.query), 'Categories fetched');
  });

  createCategory = asyncHandler(async (req: Request, res: Response) => {
    this.ok(res, await this.adminService.createCategory(req.tenant?.tenantId, req.body), 'Category created', HTTP_STATUS.CREATED);
  });

  updateCategory = asyncHandler(async (req: Request, res: Response) => {
    this.ok(res, await this.adminService.updateCategory(req.tenant?.tenantId, routeId(req), req.body), 'Category updated');
  });

  deleteCategory = asyncHandler(async (req: Request, res: Response) => {
    this.ok(res, await this.adminService.deleteCategory(req.tenant?.tenantId, routeId(req)), 'Category deleted');
  });

  listOrders = asyncHandler(async (req: Request, res: Response) => {
    this.ok(res, await this.adminService.listOrders(req.tenant?.tenantId, req.query), 'Orders fetched');
  });

  orderStats = asyncHandler(async (req: Request, res: Response) => {
    this.ok(res, await this.adminService.orderStats(req.tenant?.tenantId), 'Order stats fetched');
  });

  updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
    this.ok(res, await this.adminService.updateOrderStatus(req.tenant?.tenantId, routeId(req), req.body.status), 'Order status updated');
  });

  listCustomers = asyncHandler(async (req: Request, res: Response) => {
    this.ok(res, await this.adminService.listCustomers(req.tenant?.tenantId, req.query), 'Customers fetched');
  });

  listPromotions = asyncHandler(async (req: Request, res: Response) => {
    this.ok(res, await this.adminService.listPromotions(req.tenant?.tenantId, req.query), 'Promotions fetched');
  });

  createPromotion = asyncHandler(async (req: Request, res: Response) => {
    this.ok(res, await this.adminService.createPromotion(req.tenant?.tenantId, req.body), 'Promotion created', HTTP_STATUS.CREATED);
  });

  updatePromotion = asyncHandler(async (req: Request, res: Response) => {
    this.ok(res, await this.adminService.updatePromotion(req.tenant?.tenantId, routeId(req), req.body), 'Promotion updated');
  });

  deletePromotion = asyncHandler(async (req: Request, res: Response) => {
    this.ok(res, await this.adminService.deletePromotion(req.tenant?.tenantId, routeId(req)), 'Promotion deleted');
  });

  listDeliveryFees = asyncHandler(async (req: Request, res: Response) => {
    this.ok(res, await this.adminService.listDeliveryFees(req.tenant?.tenantId, req.query), 'Delivery fees fetched');
  });

  createDeliveryFee = asyncHandler(async (req: Request, res: Response) => {
    this.ok(res, await this.adminService.createDeliveryFee(req.tenant?.tenantId, req.body), 'Delivery fee created', HTTP_STATUS.CREATED);
  });

  updateDeliveryFee = asyncHandler(async (req: Request, res: Response) => {
    this.ok(res, await this.adminService.updateDeliveryFee(req.tenant?.tenantId, routeId(req), req.body), 'Delivery fee updated');
  });

  deleteDeliveryFee = asyncHandler(async (req: Request, res: Response) => {
    this.ok(res, await this.adminService.deleteDeliveryFee(req.tenant?.tenantId, routeId(req)), 'Delivery fee deleted');
  });
}
