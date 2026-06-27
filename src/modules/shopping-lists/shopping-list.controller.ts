import { Request, Response } from 'express';

import { BaseController } from '@core/base/BaseController';
import { ShoppingListService } from '@modules/shopping-lists/shopping-list.service';
import { asyncHandler } from '@utils/asyncHandler';

export class ShoppingListController extends BaseController {
  constructor(private readonly service = new ShoppingListService()) {
    super();
  }

  list = asyncHandler(async (req: Request, res: Response) => {
    this.ok(res, await this.service.list(req.tenant?.tenantId, req.auth?.userId), 'Shopping lists fetched');
  });
  create = asyncHandler(async (req: Request, res: Response) => {
    this.ok(res, await this.service.create(req.tenant?.tenantId, req.auth?.userId, req.body.name), 'Shopping list created', 201);
  });
  rename = asyncHandler(async (req: Request, res: Response) => {
    this.ok(res, await this.service.rename(req.tenant?.tenantId, req.auth?.userId, String(req.params.id), req.body.name), 'Shopping list updated');
  });
  remove = asyncHandler(async (req: Request, res: Response) => {
    this.ok(res, await this.service.remove(req.tenant?.tenantId, req.auth?.userId, String(req.params.id)), 'Shopping list deleted');
  });
  toggleProduct = asyncHandler(async (req: Request, res: Response) => {
    this.ok(res, await this.service.toggleProduct(req.tenant?.tenantId, req.auth?.userId, String(req.params.id), String(req.params.productId)), 'Shopping list updated');
  });
}
