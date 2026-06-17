import { Router } from 'express';
import { getAlert, listAlerts, updateAlertStatus } from '../controllers/alerts.controller.js';

const router = Router();

router.get('/', listAlerts);
router.get('/:id', getAlert);
router.patch('/:id/status', updateAlertStatus);

export default router;
