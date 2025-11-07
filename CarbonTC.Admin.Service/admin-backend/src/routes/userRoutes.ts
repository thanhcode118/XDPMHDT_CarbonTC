import { Response, Router } from 'express';
import { AuthRequest } from '../types';
import { authenticate } from '../middlewares/authMiddleware';
import { requireAdmin } from '../middlewares/roleMiddleware';
import { asyncHandler } from '../middlewares/errorHandler';
import ApiResponseHelper from '../utils/apiResponse';
import axios from 'axios';
import logger from '../utils/logger';

const router = Router();
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 */
router.get(
  '/',
  authenticate,
  requireAdmin,
  asyncHandler(async (req: AuthRequest, res: Response<any, Record<string, any>>) => {
    try {
      const { data } = await axios.get(`${AUTH_SERVICE_URL}/api/users`, {
        headers: { Authorization: req.headers.authorization }
      });
      return ApiResponseHelper.success(res, data, 'Users retrieved successfully');
    } catch (error: any) {
      logger.error('Error fetching users:', error);
      return ApiResponseHelper.error(res, 'Failed to fetch users', error.response?.status || 500);
    }
  })
);

/**
 * @swagger
 * /admin/users/{userId}/block:
 *   patch:
 *     summary: Block a user
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 */
router.patch(
  '/:userId/block',
  authenticate,
  requireAdmin,
  asyncHandler(async (req: AuthRequest, res: Response<any, Record<string, any>>) => {
    const { userId } = req.params;
    const { reason } = req.body;
    
    try {
      const { data } = await axios.patch(
        `${AUTH_SERVICE_URL}/api/users/${userId}/block`,
        { reason },
        { headers: { Authorization: req.headers.authorization } }
      );
      return ApiResponseHelper.success(res, data, 'User blocked successfully');
    } catch (error: any) {
      logger.error('Error blocking user:', error);
      return ApiResponseHelper.error(res, 'Failed to block user', error.response?.status || 500);
    }
  })
);

/**
 * @swagger
 * /admin/users/{userId}/unblock:
 *   patch:
 *     summary: Unblock a user
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 */
router.patch(
  '/:userId/unblock',
  authenticate,
  requireAdmin,
  asyncHandler(async (req: AuthRequest, res: Response<any, Record<string, any>>) => {
    const { userId } = req.params;
    
    try {
      const { data } = await axios.patch(
        `${AUTH_SERVICE_URL}/api/users/${userId}/unblock`,
        {},
        { headers: { Authorization: req.headers.authorization } }
      );
      return ApiResponseHelper.success(res, data, 'User unblocked successfully');
    } catch (error: any) {
      logger.error('Error unblocking user:', error);
      return ApiResponseHelper.error(res, 'Failed to unblock user', error.response?.status || 500);
    }
  })
);

export default router;