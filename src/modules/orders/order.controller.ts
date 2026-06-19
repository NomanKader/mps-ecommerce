import { Request, Response } from 'express';

import { BaseController } from '@core/base/BaseController';
import { OrderService } from '@modules/orders/order.service';
import { asyncHandler } from '@utils/asyncHandler';

export class OrderController extends BaseController {
  constructor(private readonly orderService = new OrderService()) {
    super();
  }

  list = asyncHandler(async (req: Request, res: Response) => {
    const orders = await this.orderService.listOrders(req.tenant?.tenantId, req.auth?.userId);
    this.ok(res, orders, 'Orders fetched');
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const order = await this.orderService.createOrder(
      req.tenant?.tenantId,
      req.auth?.userId,
      req.body
    );
    this.ok(res, order, 'Order created', 201);
  });
}
