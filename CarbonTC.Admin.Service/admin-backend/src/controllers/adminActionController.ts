import { Response } from 'express';
import { AuthRequest } from '../types';
import adminActionService from '../services/adminActionService';
import ApiResponseHelper from '../utils/apiResponse';
import { asyncHandler } from '../middlewares/errorHandler';

/**
 * Admin Action Controller
 * Handles HTTP requests for admin action logging and audit trails
 */
class AdminActionController {

  /**
   * @route   POST /api/admin/actions
   * @desc    Log an admin action
   * @access  Private (Admin)
   */
  logAction = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { actionType, targetId, description, actionDetails } = req.body;
    const adminId = req.user!.userId;
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    const action = await adminActionService.logAction(
      { actionType, targetId, description, actionDetails },
      adminId,
      ipAddress,
      userAgent
    );

    return ApiResponseHelper.created(
      res,
      action,
      'Admin action logged successfully'
    );
  });

  /**
   * @route   GET /api/admin/actions/:actionId
   * @desc    Get action by ID
   * @access  Private (Admin)
   */
  getActionById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { actionId } = req.params;

    const action = await adminActionService.getActionById(actionId);

    return ApiResponseHelper.success(
      res,
      action,
      'Admin action retrieved successfully'
    );
  });

  /**
   * @route   GET /api/admin/actions
   * @desc    Get all actions with filters and pagination
   * @access  Private (Admin)
   */
  getAllActions = asyncHandler(async (req: AuthRequest, res: Response) => {
    const {
      page = 1,
      limit = 10,
      adminId,
      actionType,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filters = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      adminId: adminId as string,
      actionType: actionType as any,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    };

    const { actions, total } = await adminActionService.getAllActions(filters);

    return ApiResponseHelper.paginated(
      res,
      actions,
      filters.page,
      total,
      filters.limit,
      'Admin actions retrieved successfully'
    );
  });

  /**
   * @route   GET /api/admin/actions/admin/:adminId
   * @desc    Get actions by admin ID
   * @access  Private (Admin)
   */
  getActionsByAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { adminId } = req.params;

    const actions = await adminActionService.getActionsByAdmin(adminId);

    return ApiResponseHelper.success(
      res,
      actions,
      'Admin actions retrieved successfully'
    );
  });

  /**
   * @route   GET /api/admin/actions/type/:actionType
   * @desc    Get actions by type
   * @access  Private (Admin)
   */
  getActionsByType = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { actionType } = req.params;

    const actions = await adminActionService.getActionsByType(actionType as any);

    return ApiResponseHelper.success(
      res,
      actions,
      'Admin actions retrieved successfully'
    );
  });

  /**
   * @route   GET /api/admin/actions/target/:targetId
   * @desc    Get actions by target ID
   * @access  Private (Admin)
   */
  getActionsByTarget = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { targetId } = req.params;

    const actions = await adminActionService.getActionsByTarget(targetId);

    return ApiResponseHelper.success(
      res,
      actions,
      'Admin actions retrieved successfully'
    );
  });

  /**
   * @route   GET /api/admin/actions/recent
   * @desc    Get recent actions
   * @access  Private (Admin)
   */
  getRecentActions = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { hours = 24 } = req.query;

    const actions = await adminActionService.getRecentActions(
      parseInt(hours as string)
    );

    return ApiResponseHelper.success(
      res,
      actions,
      'Recent admin actions retrieved successfully'
    );
  });

  /**
   * @route   GET /api/admin/actions/statistics
   * @desc    Get action statistics
   * @access  Private (Admin)
   */
  getActionStatistics = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return ApiResponseHelper.badRequest(
          res,
          'startDate and endDate are required'
        );
      }

      const stats = await adminActionService.getActionStatistics(
        new Date(startDate as string),
        new Date(endDate as string)
      );

      return ApiResponseHelper.success(
        res,
        stats,
        'Action statistics retrieved successfully'
      );
    }
  );

  /**
   * @route   GET /api/admin/actions/activity/:adminId
   * @desc    Get admin activity summary
   * @access  Private (Admin)
   */
  getAdminActivity = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { adminId } = req.params;
    const { days = 30 } = req.query;

    const activity = await adminActionService.getAdminActivity(
      adminId,
      parseInt(days as string)
    );

    return ApiResponseHelper.success(
      res,
      activity,
      'Admin activity retrieved successfully'
    );
  });

  /**
   * @route   GET /api/admin/actions/export/audit-log
   * @desc    Export audit log
   * @access  Private (Admin)
   */
  exportAuditLog = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return ApiResponseHelper.badRequest(
        res,
        'startDate and endDate are required'
      );
    }

    const auditLog = await adminActionService.exportAuditLog(
      new Date(startDate as string),
      new Date(endDate as string)
    );

    return ApiResponseHelper.success(
      res,
      auditLog,
      'Audit log exported successfully'
    );
  });
}

export default new AdminActionController();