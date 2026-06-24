import { Router } from 'express';

import { LocationController } from '@modules/locations/location.controller';

const router = Router();
const controller = new LocationController();

router.get('/myanmar', controller.listMyanmarLocations);

export default router;
