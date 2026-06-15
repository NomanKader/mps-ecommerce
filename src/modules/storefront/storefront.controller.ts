import { Request, Response } from 'express';

import { BaseController } from '@core/base/BaseController';
import { StorefrontCarouselSlide } from '@modules/admin/admin.models';
import { AdminService } from '@modules/admin/admin.service';
import { asyncHandler } from '@utils/asyncHandler';

export class StorefrontController extends BaseController {
  constructor(private readonly adminService = new AdminService()) {
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
}
