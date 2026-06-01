import { Request, Response } from 'express';

import { BaseController } from '@core/base/BaseController';
import { CategoryService } from '@modules/categories/category.service';
import { asyncHandler } from '@utils/asyncHandler';

export class CategoryController extends BaseController {
  constructor(private readonly categoryService = new CategoryService()) {
    super();
  }

  list = asyncHandler(async (req: Request, res: Response) => {
    const categories = await this.categoryService.listCategories(req.tenant?.tenantId);
    this.ok(res, categories, 'Categories fetched');
  });
}
