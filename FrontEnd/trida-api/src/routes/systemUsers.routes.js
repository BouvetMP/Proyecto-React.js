import { Router } from 'express';
import {
  createSystemUser,
  listSystemUsers,
  updateSystemUserRole,
  updateSystemUserStatus
} from '../controllers/systemUsers.controller.js';
import { requirePermission } from '../middleware/auth.js';

const router = Router();

router.get('/', listSystemUsers);
router.post('/', requirePermission('manageUsers'), createSystemUser);
router.patch('/:id/status', requirePermission('manageUsers'), updateSystemUserStatus);
router.patch('/:id/role', requirePermission('manageUsers'), updateSystemUserRole);

export default router;
