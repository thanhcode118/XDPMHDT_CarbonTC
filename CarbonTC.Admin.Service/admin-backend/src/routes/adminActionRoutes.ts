import { Router } from 'express';
import adminActionController from '../controllers/adminActionController';
import { authenticate } from '../middlewares/authMiddleware';
import { requireAdmin } from '../middlewares/roleMiddleware';

const router = Router();

/**
 * @swagger
 * /admin/actions:
 *   post:
 *     summary: Log an admin action
 *     description: Record an administrative action for audit trail (Admin only)
 *     tags: [Admin Actions]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAdminActionRequest'
 *     responses:
 *       201:
 *         description: Action logged successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/AdminAction'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin only
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/',
  authenticate,
  requireAdmin,
  adminActionController.logAction
);

/**
 * @swagger
 * /admin/actions/statistics:
 *   get:
 *     summary: Get action statistics
 *     description: Get aggregated statistics about admin actions (Admin only)
 *     tags: [Admin Actions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for statistics period
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for statistics period
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 450
 *                         byActionType:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               actionType:
 *                                 type: string
 *                                 example: BlockUser
 *                               count:
 *                                 type: integer
 *                                 example: 120
 *                         period:
 *                           type: object
 *                           properties:
 *                             startDate:
 *                               type: string
 *                               format: date-time
 *                             endDate:
 *                               type: string
 *                               format: date-time
 *       400:
 *         description: Bad request - missing required dates
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/statistics',
  authenticate,
  requireAdmin,
  adminActionController.getActionStatistics
);

/**
 * @swagger
 * /admin/actions/recent:
 *   get:
 *     summary: Get recent actions
 *     description: Get admin actions from the last N hours (Admin only)
 *     tags: [Admin Actions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: hours
 *         schema:
 *           type: integer
 *           default: 24
 *         description: Number of hours to look back
 *     responses:
 *       200:
 *         description: Recent actions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AdminAction'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/recent',
  authenticate,
  requireAdmin,
  adminActionController.getRecentActions
);

/**
 * @swagger
 * /admin/actions/export/audit-log:
 *   get:
 *     summary: Export audit log
 *     description: Export audit log for a specific date range (Admin only)
 *     tags: [Admin Actions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for export
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for export
 *     responses:
 *       200:
 *         description: Audit log exported successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AdminAction'
 *       400:
 *         description: Bad request - missing required dates
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/export/audit-log',
  authenticate,
  requireAdmin,
  adminActionController.exportAuditLog
);

/**
 * @swagger
 * /admin/actions/admin/{adminId}:
 *   get:
 *     summary: Get actions by admin ID
 *     description: Get all actions performed by a specific admin (Admin only)
 *     tags: [Admin Actions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: adminId
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin user ID
 *     responses:
 *       200:
 *         description: Actions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AdminAction'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/admin/:adminId',
  authenticate,
  requireAdmin,
  adminActionController.getActionsByAdmin
);

/**
 * @swagger
 * /admin/actions/type/{actionType}:
 *   get:
 *     summary: Get actions by type
 *     description: Get all actions of a specific type (Admin only)
 *     tags: [Admin Actions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: actionType
 *         required: true
 *         schema:
 *           type: string
 *           enum:
 *             - BlockUser
 *             - UnblockUser
 *             - ApproveWithdrawal
 *             - RejectWithdrawal
 *             - ResolveDispute
 *             - ForceRefund
 *             - DelistListing
 *             - FreezeListing
 *             - UnfreezeListing
 *             - UpdateConfig
 *             - IssueCertificate
 *             - RevokeCertificate
 *         description: Action type
 *     responses:
 *       200:
 *         description: Actions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AdminAction'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/type/:actionType',
  authenticate,
  requireAdmin,
  adminActionController.getActionsByType
);

/**
 * @swagger
 * /admin/actions/target/{targetId}:
 *   get:
 *     summary: Get actions by target ID
 *     description: Get all actions performed on a specific target (Admin only)
 *     tags: [Admin Actions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: targetId
 *         required: true
 *         schema:
 *           type: string
 *         description: Target ID (user, transaction, listing, etc.)
 *     responses:
 *       200:
 *         description: Actions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AdminAction'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/target/:targetId',
  authenticate,
  requireAdmin,
  adminActionController.getActionsByTarget
);

/**
 * @swagger
 * /admin/actions/activity/{adminId}:
 *   get:
 *     summary: Get admin activity summary
 *     description: Get activity summary for a specific admin over N days (Admin only)
 *     tags: [Admin Actions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: adminId
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin user ID
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of days to analyze
 *     responses:
 *       200:
 *         description: Activity summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         adminId:
 *                           type: string
 *                           example: admin-user-123
 *                         totalActions:
 *                           type: integer
 *                           example: 245
 *                         activity:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               date:
 *                                 type: string
 *                                 example: "2025-01-15"
 *                               actionType:
 *                                 type: string
 *                                 example: BlockUser
 *                               count:
 *                                 type: integer
 *                                 example: 5
 *                         period:
 *                           type: object
 *                           properties:
 *                             days:
 *                               type: integer
 *                               example: 30
 *                             startDate:
 *                               type: string
 *                               format: date-time
 *                             endDate:
 *                               type: string
 *                               format: date-time
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/activity/:adminId',
  authenticate,
  requireAdmin,
  adminActionController.getAdminActivity
);

/**
 * @swagger
 * /admin/actions/{actionId}:
 *   get:
 *     summary: Get action by ID
 *     description: Get a specific action by its ID (Admin only)
 *     tags: [Admin Actions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: actionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Action ID
 *     responses:
 *       200:
 *         description: Action retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/AdminAction'
 *       404:
 *         description: Action not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/:actionId',
  authenticate,
  requireAdmin,
  adminActionController.getActionById
);

/**
 * @swagger
 * /admin/actions:
 *   get:
 *     summary: Get all actions with filters
 *     description: Get paginated list of admin actions with optional filters (Admin only)
 *     tags: [Admin Actions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: adminId
 *         schema:
 *           type: string
 *         description: Filter by admin user ID
 *       - in: query
 *         name: actionType
 *         schema:
 *           type: string
 *           enum:
 *             - BlockUser
 *             - UnblockUser
 *             - ApproveWithdrawal
 *             - RejectWithdrawal
 *             - ResolveDispute
 *             - ForceRefund
 *             - DelistListing
 *             - FreezeListing
 *             - UnfreezeListing
 *             - UpdateConfig
 *             - IssueCertificate
 *             - RevokeCertificate
 *         description: Filter by action type
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter actions created after this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter actions created before this date
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Actions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Admin actions retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AdminAction'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/',
  authenticate,
  requireAdmin,
  adminActionController.getAllActions
);

export default router;