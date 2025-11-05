import { Response, Router } from 'express';
import { AuthRequest } from '../types';
import { authenticate } from '../middlewares/authMiddleware';
import { requireAdmin, requireAdminOrCVA } from '../middlewares/roleMiddleware';
import { asyncHandler } from '../middlewares/errorHandler';
import ApiResponseHelper from '../utils/apiResponse';
import axios from 'axios';
import logger from '../utils/logger';

const router = Router();
const MARKETPLACE_SERVICE_URL = process.env.MARKETPLACE_SERVICE_URL || 'http://localhost:5003';

/**
 * @swagger
 * /admin/transactions:
 *   get:
 *     summary: Get all transactions
 *     tags: [Transactions]
 *     security:
 *       - BearerAuth: []
 */
router.get(
  '/',
  authenticate,
  requireAdminOrCVA,
  asyncHandler(async (req: AuthRequest, res: Response<any, Record<string, any>>) => {
    try {
      const { data } = await axios.get(`${MARKETPLACE_SERVICE_URL}/api/transactions`, {
        headers: { Authorization: req.headers.authorization },
        params: req.query
      });
      return ApiResponseHelper.success(res, data, 'Transactions retrieved successfully');
    } catch (error: any) {
      logger.error('Error fetching transactions:', error);
      return ApiResponseHelper.error(res, 'Failed to fetch transactions', error.response?.status || 500);
    }
  })
);

/**
 * @swagger
 * /admin/transactions/{transactionId}:
 *   get:
 *     summary: Get transaction by ID
 *     tags: [Transactions]
 *     security:
 *       - BearerAuth: []
 */
router.get(
  '/:transactionId',
  authenticate,
  requireAdminOrCVA,
  asyncHandler(async (req: AuthRequest, res: Response<any, Record<string, any>>) => {
    const { transactionId } = req.params;
    
    try {
      const { data } = await axios.get(
        `${MARKETPLACE_SERVICE_URL}/api/transactions/${transactionId}`,
        { headers: { Authorization: req.headers.authorization } }
      );
      return ApiResponseHelper.success(res, data, 'Transaction retrieved successfully');
    } catch (error: any) {
      logger.error('Error fetching transaction:', error);
      return ApiResponseHelper.error(res, 'Failed to fetch transaction', error.response?.status || 500);
    }
  })
);

export default router;