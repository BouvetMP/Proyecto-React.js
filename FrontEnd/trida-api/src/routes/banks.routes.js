import { Router } from 'express';
import { listBanks } from '../controllers/banks.controller.js';

const router = Router();

router.get('/', listBanks);

export default router;
