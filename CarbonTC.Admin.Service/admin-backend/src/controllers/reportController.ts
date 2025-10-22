import { Response } from 'express';
import { AuthRequest } from '../types';
import reportService from '../services/reportService';
import ApiResponseHelper from '../utils/apiResponse';
import { asyncHandler } from '../middlewares/errorHandler';

/**
 * Report Controller
 * Handles HTTP requests for report generation and management
 */
class ReportController {

  /**
   * @route   POST /api/admin/reports
   * @desc    Generate a new platform report
   * @access  Private (Admin)
   */
  generateReport = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { type, period, startDate, endDate } = req.body;
    const generatedBy = req.user!.userId;

    const report = await reportService.generateReport(
      {
        type,
        period,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined
      },
      generatedBy
    );

    return ApiResponseHelper.created(
      res,
      report,
      'Report generated successfully'
    );
  });

  /**
   * @route   GET /api/admin/reports/:reportId
   * @desc    Get report by ID
   * @access  Private (Admin, CVA)
   */
  getReportById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { reportId } = req.params;

    const report = await reportService.getReportById(reportId);

    return ApiResponseHelper.success(
      res,
      report,
      'Report retrieved successfully'
    );
  });

  /**
   * @route   GET /api/admin/reports
   * @desc    Get all reports with filters and pagination
   * @access  Private (Admin, CVA)
   */
  getAllReports = asyncHandler(async (req: AuthRequest, res: Response) => {
    const {
      page = 1,
      limit = 10,
      type,
      period,
      startDate,
      endDate,
      sortBy = 'generatedAt',
      sortOrder = 'desc'
    } = req.query;

    const filters = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      type: type as any,
      period: period as any,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    };

    const { reports, total } = await reportService.getAllReports(filters);

    return ApiResponseHelper.paginated(
      res,
      reports,
      filters.page,
      total,
      filters.limit,
      'Reports retrieved successfully'
    );
  });

  /**
   * @route   GET /api/admin/reports/latest/:type
   * @desc    Get latest report by type
   * @access  Private (Admin, CVA)
   */
  getLatestReportByType = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const { type } = req.params;

      const report = await reportService.getLatestReportByType(type as any);

      if (!report) {
        return ApiResponseHelper.notFound(
          res,
          `No report found for type: ${type}`
        );
      }

      return ApiResponseHelper.success(
        res,
        report,
        'Latest report retrieved successfully'
      );
    }
  );

  /**
   * @route   DELETE /api/admin/reports/:reportId
   * @desc    Delete report
   * @access  Private (Admin)
   */
  deleteReport = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { reportId } = req.params;

    await reportService.deleteReport(reportId);

    return ApiResponseHelper.success(
      res,
      null,
      'Report deleted successfully'
    );
  });

  /**
   * @route   DELETE /api/admin/reports/cleanup
   * @desc    Delete old reports (cleanup)
   * @access  Private (Admin)
   */
  deleteOldReports = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { days = 90 } = req.query;

    const deletedCount = await reportService.deleteOldReports(
      parseInt(days as string)
    );

    return ApiResponseHelper.success(
      res,
      { deletedCount },
      `Deleted ${deletedCount} old reports`
    );
  });
}

export default new ReportController();