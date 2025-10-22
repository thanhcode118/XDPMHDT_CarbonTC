import { Router } from 'express';
import reportController from '../controllers/reportController';
import { authenticate } from '../middlewares/authMiddleware';
import { requireAdmin, requireAdminOrCVA } from '../middlewares/roleMiddleware';

const router = Router();

/**
 * @route   POST /api/admin/reports
 * @desc    Generate a new platform report
 * @access  Private (Admin)
 */
router.post(
  '/',
  authenticate,
  requireAdmin,
  reportController.generateReport
);

/**
 * @route   DELETE /api/admin/reports/cleanup
 * @desc    Delete old reports (cleanup)
 * @access  Private (Admin)
 * NOTE: This route must be BEFORE /:reportId to avoid conflicts
 */
router.delete(
  '/cleanup',
  authenticate,
  requireAdmin,
  reportController.deleteOldReports
);

/**
 * @route   GET /api/admin/reports/latest/:type
 * @desc    Get latest report by type
 * @access  Private (Admin, CVA)
 */
router.get(
  '/latest/:type',
  authenticate,
  requireAdminOrCVA,
  reportController.getLatestReportByType
);

/**
 * @route   GET /api/admin/reports/:reportId
 * @desc    Get report by ID
 * @access  Private (Admin, CVA)
 */
router.get(
  '/:reportId',
  authenticate,
  requireAdminOrCVA,
  reportController.getReportById
);

/**
 * @route   GET /api/admin/reports
 * @desc    Get all reports with filters and pagination
 * @access  Private (Admin, CVA)
 */
router.get(
  '/',
  authenticate,
  requireAdminOrCVA,
  reportController.getAllReports
);

/**
 * @route   DELETE /api/admin/reports/:reportId
 * @desc    Delete report
 * @access  Private (Admin)
 */
router.delete(
  '/:reportId',
  authenticate,
  requireAdmin,
  reportController.deleteReport
);

export default router;