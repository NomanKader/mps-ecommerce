import { Request, Response } from 'express';

import { BaseController } from '@core/base/BaseController';
import { myanmarLocations } from '@modules/locations/myanmar-location.data';
import { asyncHandler } from '@utils/asyncHandler';

export class LocationController extends BaseController {
  listMyanmarLocations = asyncHandler(async (_req: Request, res: Response) => {
    this.ok(res, myanmarLocations, 'Myanmar locations fetched');
  });
}
