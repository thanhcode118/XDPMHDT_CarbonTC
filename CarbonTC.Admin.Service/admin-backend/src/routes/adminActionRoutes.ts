import { Router } from 'express';
import adminActionController from '../controllers/adminActionController';
import { authenticate } from '../middlewares/authMiddleware';
import { requireAdmin } from '../middlewares/roleMiddleware';

const router = Router();

/**
 * @route   POST /api/admin/actions
 * @desc    Log an admin action
 * @access  Private (Admin)
 */
router.post(
  '/',
  authenticate,
  requireAdmin,
  adminActionController.logAction
);

/**
 * @route   GET /api/admin/actions/statistics
 * @desc    Get action statistics
 * @access  Private (Admin)
 * NOTE: This route must be BEFORE /:actionId to avoid conflicts
 */
router.get(
  '/statistics',
  authenticate,
  requireAdmin,
  adminActionController.getActionStatistics
);

/**
 * @route   GET /api/admin/actions/recent
 * @desc    Get recent actions
 * @access  Private (Admin)
 */
router.get(
  '/recent',
  authenticate,
  requireAdmin,
  adminActionController.getRecentActions
);

/**
 * @route   GET /api/admin/actions/export/audit-log
 * @desc    Export audit log
 * @access  Private (Admin)
 */
router.get(
  '/export/audit-log',
  authenticate,
  requireAdmin,
  adminActionController.exportAuditLog
);

/**
 * @route   GET /api/admin/actions/admin/:adminId
 * @desc    Get actions by admin ID
 * @access  Private (Admin)
 */
router.get(
  '/admin/:adminId',
  authenticate,
  requireAdmin,
  adminActionController.getActionsByAdmin
);

/**
 * @route   GET /api/admin/actions/type/:actionType
 * @desc    Get actions by type
 * @access  Private (Admin)
 */
router.get(
  '/type/:actionType',
  authenticate,
  requireAdmin,
  adminActionController.getActionsByType
);

/**
 * @route   GET /api/admin/actions/target/:targetId
 * @desc    Get actions by target ID
 * @access  Private (Admin)
 */
router.get(
  '/target/:targetId',
  authenticate,
  requireAdmin,
  adminActionController.getActionsByTarget
);

/**
 * @route   GET /api/admin/actions/activity/:adminId
 * @desc    Get admin activity summary
 * @access  Private (Admin)
 */
router.get(
  '/activity/:adminId',
  authenticate,
  requireAdmin,
  adminActionController.getAdminActivity
);

/**
 * @route   GET /api/admin/actions/:actionId
 * @desc    Get action by ID
 * @access  Private (Admin)
 */
router.get(
  '/:actionId',
  authenticate,
  requireAdmin,
  adminActionController.getActionById
);

/**
 * @route   GET /api/admin/actions
 * @desc    Get all actions with filters and pagination
 * @access  Private (Admin)
 */
router.get(
  '/',
  authenticate,
  requireAdmin,
  adminActionController.getAllActions
);

export default router;