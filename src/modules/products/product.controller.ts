import { Request, Response } from 'express';

import { BaseController } from '@core/base/BaseController';
import { ProductService } from '@modules/products/product.service';
import { asyncHandler } from '@utils/asyncHandler';

export class ProductController extends BaseController {
  constructor(private readonly productService = new ProductService()) {
    super();
  }

  list = asyncHandler(async (req: Request, res: Response) => {
    const products = await this.productService.listProducts(req.tenant?.tenantId);
    this.ok(res, products, 'Products fetched');
  });
}
