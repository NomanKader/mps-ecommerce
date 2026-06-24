import { Request, Response } from 'express';

import { BaseController } from '@core/base/BaseController';
import { AddressService } from '@modules/addresses/address.service';
import { asyncHandler } from '@utils/asyncHandler';

export class AddressController extends BaseController {
  constructor(private readonly addressService = new AddressService()) {
    super();
  }

  list = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.addressService.listAddresses(req.tenant?.tenantId, req.auth?.userId),
      'Addresses fetched'
    );
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.addressService.createAddress(req.tenant?.tenantId, req.auth?.userId, req.body),
      'Address created',
      201
    );
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.addressService.updateAddress(
        req.tenant?.tenantId,
        req.auth?.userId,
        String(req.params.id),
        req.body
      ),
      'Address updated'
    );
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    this.ok(
      res,
      await this.addressService.deleteAddress(
        req.tenant?.tenantId,
        req.auth?.userId,
        String(req.params.id)
      ),
      'Address deleted'
    );
  });
}
