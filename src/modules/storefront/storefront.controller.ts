import { Request, Response } from 'express';

import { BaseController } from '@core/base/BaseController';
import { StorefrontCarouselSlide } from '@modules/admin/admin.models';
import { AdminService } from '@modules/admin/admin.service';
import { CategoryService } from '@modules/categories/category.service';
import { asyncHandler } from '@utils/asyncHandler';

export class StorefrontController extends BaseController {
  constructor(
    private readonly adminService = new AdminService(),
    private readonly categoryService = new CategoryService()
  ) {
    super();
  }

  headerSettings = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.adminService.storefrontHeaderSettings(req.tenant?.tenantId),
      'Header settings fetched'
    );
  });

  carousel = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.adminService.storefrontCarousel(
        req.tenant?.tenantId,
        req.query.placement as StorefrontCarouselSlide['placement']
      ),
      'Carousel slides fetched'
    );
  });

  categories = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.categoryService.listCategories(req.tenant?.tenantId),
      'Storefront categories fetched'
    );
  });

  icons = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.adminService.storefrontIcons(
        req.tenant?.tenantId,
        req.query.section as 'featured' | 'merchandising'
      ),
      'Storefront icons fetched'
    );
  });

  productSections = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.adminService.storefrontProductSections(req.tenant?.tenantId),
      'Product sections fetched'
    );
  });

  secondaryCategories = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.adminService.storefrontSecondaryCategories(req.tenant?.tenantId),
      'Secondary categories fetched'
    );
  });

  pageSegments = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.adminService.storefrontPageSegments(req.tenant?.tenantId),
      'Page segments fetched'
    );
  });

  pageSegmentDetail = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.adminService.storefrontPageSegmentDetail(
        req.tenant?.tenantId,
        String(req.params.id)
      ),
      'Page segment fetched'
    );
  });
}
