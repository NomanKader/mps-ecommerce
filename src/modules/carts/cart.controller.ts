import { Request, Response } from 'express';

import { BaseController } from '@core/base/BaseController';
import { CartService } from '@modules/carts/cart.service';
import { asyncHandler } from '@utils/asyncHandler';

export class CartController extends BaseController {
  constructor(private readonly cartService = new CartService()) {
    super();
  }

  list = asyncHandler(async (req: Request, res: Response) => {
    const carts = await this.cartService.listCarts(req.tenant?.tenantId);
    this.ok(res, carts, 'Carts fetched');
  });
}
