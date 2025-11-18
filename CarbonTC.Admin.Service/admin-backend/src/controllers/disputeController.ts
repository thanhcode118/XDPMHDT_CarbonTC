import { Response } from 'express';
import { AuthRequest } from '../types';
import disputeService from '../services/disputeService';
import ApiResponseHelper from '../utils/apiResponse';
import { asyncHandler } from '../middlewares/errorHandler';

class DisputeController {

  /**
   * @route   POST /api/admin/disputes
   * @desc    Create a new dispute
   * @access  Private (Authenticated users)
   */
  createDispute = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { transactionId, reason, description } = req.body;
    const raisedBy = req.user!.userId;
    
    // Extract auth token from request header
    const authHeader = req.headers.authorization;
    const authToken = authHeader?.startsWith('Bearer ') 
      ? authHeader.split(' ')[1] 
      : undefined;

    const dispute = await disputeService.createDispute(
      { transactionId, reason, description },
      raisedBy,
      authToken
    );

    return ApiResponseHelper.created(
      res,
      dispute,
      'Dispute created successfully'
    );
  });

  /**
   * @route   GET /api/admin/disputes/:disputeId
   * @desc    Get dispute by ID
   * @access  Private (Admin, CVA, or dispute owner)
   */
  getDisputeById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { disputeId } = req.params;
    const authHeader = req.headers.authorization;
    const authToken = authHeader?.startsWith('Bearer ') 
      ? authHeader.split(' ')[1] 
      : undefined;

    const dispute = await disputeService.getDisputeById(disputeId, authToken);

    return ApiResponseHelper.success(
      res,
      dispute,
      'Dispute retrieved successfully'
    );
  });

  /**
   * @route   GET /api/admin/disputes
   * @desc    Get all disputes with filters and pagination
   * @access  Private (Admin, CVA)
   */
  getAllDisputes = asyncHandler(async (req: AuthRequest, res: Response) => {
    const {
      page = 1,
      limit = 10,
      status,
      raisedBy,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filters = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      status: status as any,
      raisedBy: raisedBy as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    };

    const { disputes, total } = await disputeService.getAllDisputes(filters);

    return ApiResponseHelper.paginated(
      res,
      disputes,
      filters.page,
      total,
      filters.limit,
      'Disputes retrieved successfully'
    );
  });

  /**
   * @route   GET /api/admin/disputes/transaction/:transactionId
   * @desc    Get disputes by transaction ID
   * @access  Private (Admin, CVA, or transaction participants)
   */
  getDisputesByTransaction = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const { transactionId } = req.params;

      const disputes = await disputeService.getDisputesByTransaction(
        transactionId
      );

      return ApiResponseHelper.success(
        res,
        disputes,
        'Disputes retrieved successfully'
      );
    }
  );

  /**
   * @route   GET /api/admin/disputes/user/:userId
   * @desc    Get disputes by user ID
   * @access  Private (Admin, CVA, or user themselves)
   */
  getDisputesByUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { userId } = req.params;

    const disputes = await disputeService.getDisputesByUser(userId);

    return ApiResponseHelper.success(
      res,
      disputes,
      'Disputes retrieved successfully'
    );
  });

  /**
   * @route   PATCH /api/admin/disputes/:disputeId/status
   * @desc    Update dispute status
   * @access  Private (Admin, CVA)
   */
  updateDisputeStatus = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const { disputeId } = req.params;
      const { status } = req.body;
      const authHeader = req.headers.authorization;
      const authToken = authHeader?.startsWith('Bearer ') 
        ? authHeader.split(' ')[1] 
        : undefined;

      const dispute = await disputeService.updateDisputeStatus(
        disputeId,
        status,
        authToken
      );

      return ApiResponseHelper.success(
        res,
        dispute,
        'Dispute status updated successfully'
      );
    }
  );

  /**
   * @route   POST /api/admin/disputes/:disputeId/resolve
   * @desc    Resolve dispute
   * @access  Private (Admin, CVA)
   */
  resolveDispute = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { disputeId } = req.params;
    const { status, resolutionNotes } = req.body;
    const resolvedBy = req.user!.userId;
    const authHeader = req.headers.authorization;
    const authToken = authHeader?.startsWith('Bearer ') 
      ? authHeader.split(' ')[1] 
      : undefined;

    const dispute = await disputeService.resolveDispute(
      disputeId,
      { status, resolutionNotes },
      resolvedBy,
      authToken
    );

    return ApiResponseHelper.success(
      res,
      dispute,
      'Dispute resolved successfully'
    );
  });

  /**
   * @route   DELETE /api/admin/disputes/:disputeId
   * @desc    Delete dispute (soft delete)
   * @access  Private (Admin or dispute owner)
   */
  deleteDispute = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { disputeId } = req.params;

    await disputeService.deleteDispute(disputeId);

    return ApiResponseHelper.success(
      res,
      null,
      'Dispute deleted successfully'
    );
  });

  /**
   * @route   GET /api/admin/disputes/statistics
   * @desc    Get dispute statistics
   * @access  Private (Admin, CVA)
   */
  getDisputeStatistics = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const { startDate, endDate } = req.query;

      const stats = await disputeService.getDisputeStatistics(
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      return ApiResponseHelper.success(
        res,
        stats,
        'Dispute statistics retrieved successfully'
      );
    }
  );
}

export default new DisputeController();