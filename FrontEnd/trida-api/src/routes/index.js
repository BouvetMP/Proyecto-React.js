import { Router } from 'express';
import authRoutes from './auth.routes.js';
import bankRoutes from './banks.routes.js';
import transactionRoutes from './transactions.routes.js';
import alertRoutes from './alerts.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import analyticsRoutes from './analytics.routes.js';
import systemUserRoutes from './systemUsers.routes.js';
import clientRoutes from './clients.routes.js';
import deviceRoutes from './devices.routes.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ ok: true, status: 'healthy' });
});

router.use('/auth', authRoutes);

// Todo lo demás requiere autenticación.
router.use(requireAuth);

router.use('/banks', bankRoutes);
router.use('/transactions', transactionRoutes);
router.use('/alerts', alertRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/system-users', systemUserRoutes);
router.use('/clients', clientRoutes);
router.use('/devices', deviceRoutes);

export default router;
