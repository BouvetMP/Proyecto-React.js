import { Router } from 'express';
import { getClient, listClients } from '../controllers/clients.controller.js';
import { listClientDevices } from '../controllers/devices.controller.js';

const router = Router();

router.get('/', listClients);
router.get('/:id', getClient);
router.get('/:id/devices', listClientDevices);

export default router;
