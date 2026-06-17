import { Router } from 'express';
import { getDevice, listDevices } from '../controllers/devices.controller.js';

const router = Router();

router.get('/', listDevices);
router.get('/:id', getDevice);

export default router;
