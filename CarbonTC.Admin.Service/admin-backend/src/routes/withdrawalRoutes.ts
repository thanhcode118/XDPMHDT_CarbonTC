import { Response, Router } from 'express';
import { AuthRequest } from '../types';
import { authenticate } from '../middlewares/authMiddleware';
import { requireAdmin } from '../middlewares/roleMiddleware';
import { asyncHandler } from '../middlewares/errorHandler';
import ApiResponseHelper from '../utils/apiResponse';
import axios from 'axios';
import logger from '../utils/logger';

const router = Router();
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:5004';

/**
 * @swagger
 * /admin/withdrawals:
 *   get:
 *     summary: Get all withdrawal requests
 *     tags: [Withdrawals]
 *     security:
 *       - BearerAuth: []
 */
router.get(
  '/',
  authenticate,
  requireAdmin,
  asyncHandler(async (req: AuthRequest, res: Response<any, Record<string, any>>) => {
    try {
      const { data } = await axios.get(`${PAYMENT_SERVICE_URL}/api/withdrawals`, {
        headers: { Authorization: req.headers.authorization },
        params: req.query
      });
      return ApiResponseHelper.success(res, data, 'Withdrawal requests retrieved successfully');
    } catch (error: any) {
      logger.error('Error fetching withdrawals:', error);
      return ApiResponseHelper.error(res, 'Failed to fetch withdrawals', error.response?.status || 500);
    }
  })
);

/**
 * @swagger
 * /admin/withdrawals/{requestId}/approve:
 *   patch:
 *     summary: Approve withdrawal request
 *     tags: [Withdrawals]
 *     security:
 *       - BearerAuth: []
 */
router.patch(
  '/:requestId/approve',
  authenticate,
  requireAdmin,
  asyncHandler(async (req: AuthRequest, res: Response<any, Record<string, any>>) => {
    const { requestId } = req.params;
    const { notes } = req.body;
    
    try {
      const { data } = await axios.patch(
        `${PAYMENT_SERVICE_URL}/api/withdrawals/${requestId}/approve`,
        { notes },
        { headers: { Authorization: req.headers.authorization } }
      );
      return ApiResponseHelper.success(res, data, 'Withdrawal approved successfully');
    } catch (error: any) {
      logger.error('Error approving withdrawal:', error);
      return ApiResponseHelper.error(res, 'Failed to approve withdrawal', error.response?.status || 500);
    }
  })
);

/**
 * @swagger
 * /admin/withdrawals/{requestId}/reject:
 *   patch:
 *     summary: Reject withdrawal request
 *     tags: [Withdrawals]
 *     security:
 *       - BearerAuth: []
 */
router.patch(
  '/:requestId/reject',
  authenticate,
  requireAdmin,
  asyncHandler(async (req: AuthRequest, res: Response<any, Record<string, any>>) => {
    const { requestId } = req.params;
    const { reason } = req.body;
    
    try {
      const { data } = await axios.patch(
        `${PAYMENT_SERVICE_URL}/api/withdrawals/${requestId}/reject`,
        { reason },
        { headers: { Authorization: req.headers.authorization } }
      );
      return ApiResponseHelper.success(res, data, 'Withdrawal rejected successfully');
    } catch (error: any) {
      logger.error('Error rejecting withdrawal:', error);
      return ApiResponseHelper.error(res, 'Failed to reject withdrawal', error.response?.status || 500);
    }
  })
);

export default router;