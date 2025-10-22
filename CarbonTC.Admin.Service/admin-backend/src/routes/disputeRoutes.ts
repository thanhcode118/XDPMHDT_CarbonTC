import { Router } from 'express';
import disputeController from '../controllers/disputeController';
import { authenticate } from '../middlewares/authMiddleware';
import { requireAdmin, requireAdminOrCVA } from '../middlewares/roleMiddleware';

const router = Router();

/**
 * @route   POST /api/admin/disputes
 * @desc    Create a new dispute
 * @access  Private (Authenticated users)
 */
router.post(
  '/',
  authenticate,
  disputeController.createDispute
);

/**
 * @route   GET /api/admin/disputes/statistics
 * @desc    Get dispute statistics
 * @access  Private (Admin, CVA)
 * NOTE: This route must be BEFORE /:disputeId to avoid conflicts
 */
router.get(
  '/statistics',
  authenticate,
  requireAdminOrCVA,
  disputeController.getDisputeStatistics
);

/**
 * @route   GET /api/admin/disputes/transaction/:transactionId
 * @desc    Get disputes by transaction ID
 * @access  Private (Admin, CVA)
 */
router.get(
  '/transaction/:transactionId',
  authenticate,
  requireAdminOrCVA,
  disputeController.getDisputesByTransaction
);

/**
 * @route   GET /api/admin/disputes/user/:userId
 * @desc    Get disputes by user ID
 * @access  Private (Admin, CVA)
 */
router.get(
  '/user/:userId',
  authenticate,
  requireAdminOrCVA,
  disputeController.getDisputesByUser
);

/**
 * @route   GET /api/admin/disputes/:disputeId
 * @desc    Get dispute by ID
 * @access  Private (Admin, CVA, or dispute owner)
 */
router.get(
  '/:disputeId',
  authenticate,
  requireAdminOrCVA,
  disputeController.getDisputeById
);

/**
 * @route   GET /api/admin/disputes
 * @desc    Get all disputes with filters and pagination
 * @access  Private (Admin, CVA)
 */
router.get(
  '/',
  authenticate,
  requireAdminOrCVA,
  disputeController.getAllDisputes
);

/**
 * @route   PATCH /api/admin/disputes/:disputeId/status
 * @desc    Update dispute status
 * @access  Private (Admin, CVA)
 */
router.patch(
  '/:disputeId/status',
  authenticate,
  requireAdminOrCVA,
  disputeController.updateDisputeStatus
);

/**
 * @route   POST /api/admin/disputes/:disputeId/resolve
 * @desc    Resolve dispute
 * @access  Private (Admin, CVA)
 */
router.post(
  '/:disputeId/resolve',
  authenticate,
  requireAdminOrCVA,
  disputeController.resolveDispute
);

/**
 * @route   DELETE /api/admin/disputes/:disputeId
 * @desc    Delete dispute (soft delete)
 * @access  Private (Admin)
 */
router.delete(
  '/:disputeId',
  authenticate,
  requireAdmin,
  disputeController.deleteDispute
);

export default router;