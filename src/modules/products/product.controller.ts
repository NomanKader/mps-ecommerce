import { Request, Response } from 'express';

import { BaseController } from '@core/base/BaseController';
import { HTTP_STATUS } from '@core/response/http-status';
import { ProductService } from '@modules/products/product.service';
import { ApiError } from '@utils/ApiError';
import { asyncHandler } from '@utils/asyncHandler';

export class ProductController extends BaseController {
  constructor(private readonly productService = new ProductService()) {
    super();
  }

  list = asyncHandler(async (req: Request, res: Response) => {
    const products = await this.productService.listProducts(req.tenant?.tenantId);
    this.ok(res, products, 'Products fetched');
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const product = await this.productService.getProductById(
      req.tenant?.tenantId,
      String(req.params.productId)
    );

    if (!product) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Product not found');
    }

    this.ok(res, product, 'Product fetched');
  });
}
