import { Router } from 'express';
import { getTransaction, listTransactions, mapTransactions } from '../controllers/transactions.controller.js';

const router = Router();

router.get('/', listTransactions);
router.get('/map', mapTransactions);
router.get('/:id', getTransaction);

export default router;
