import PlatformReport, { IPlatformReportDocument } from '../models/PlatformReport';
import { 
  GenerateReportDTO, 
  ReportQueryFilter,
  ReportType,
  ReportPeriod,
  NotFoundError,
  ValidationError,
  AdminActionType
} from '../types';
import logger from '../utils/logger';
import adminActionService from './adminActionService';

interface AuditContext {
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Report Service
 * Handles report generation and aggregation
 */
class ReportService {

  /**
   * Generate a new platform report
   */
  async generateReport(
    data: GenerateReportDTO,
    generatedBy: string,
    auditContext?: AuditContext
  ): Promise<IPlatformReportDocument> {
    try {
      // Calculate date range based on period
      const { startDate, endDate } = this.calculateDateRange(
        data.period,
        data.startDate,
        data.endDate
      );

      // Generate report data based on type
      const reportData = await this.aggregateReportData(
        data.type,
        startDate,
        endDate
      );

      // Create report
      const report = new PlatformReport({
        type: data.type,
        period: data.period,
        dataJson: reportData,
        generatedBy,
        startDate,
        endDate,
        generatedAt: new Date()
      });

      await report.save();

      logger.info(
        `Report generated: ${report.reportId} - ${data.type} (${data.period})`
      );

      // Log admin action
      await adminActionService.logAction(
        {
          actionType: AdminActionType.GENERATE_REPORT,
          targetId: report.reportId,
          description: `Generated ${data.type} report for ${data.period} period`,
          actionDetails: {
            reportType: data.type,
            period: data.period,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          }
        },
        generatedBy,
        auditContext?.ipAddress,
        auditContext?.userAgent
      );

      return report;
    } catch (error) {
      logger.error('Error generating report:', error);
      throw error;
    }
  }

  /**
   * Get report by ID
   */
  async getReportById(reportId: string): Promise<IPlatformReportDocument> {
    try {
      const report = await PlatformReport.findOne({ reportId });

      if (!report) {
        throw new NotFoundError(`Report not found with ID: ${reportId}`);
      }

      return report;
    } catch (error) {
      logger.error('Error fetching report:', error);
      throw error;
    }
  }

  /**
   * Get all reports with filters and pagination
   */
  async getAllReports(
    filters: ReportQueryFilter
  ): Promise<{ reports: IPlatformReportDocument[]; total: number }> {
    try {
      const {
        page = 1,
        limit = 10,
        type,
        period,
        startDate,
        endDate,
        sortBy = 'generatedAt',
        sortOrder = 'desc'
      } = filters;

      // Build query
      const query: any = {};

      if (type) {
        query.type = type;
      }

      if (period) {
        query.period = period;
      }

      if (startDate || endDate) {
        query.generatedAt = {};
        if (startDate) query.generatedAt.$gte = new Date(startDate);
        if (endDate) query.generatedAt.$lte = new Date(endDate);
      }

      // Execute query with pagination
      const skip = (page - 1) * limit;
      const sortOptions: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

      const [reports, total] = await Promise.all([
        PlatformReport.find(query)
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .lean(),
        PlatformReport.countDocuments(query)
      ]);

      return { reports: reports as unknown as IPlatformReportDocument[], total };
    } catch (error) {
      logger.error('Error fetching reports:', error);
      throw error;
    }
  }

  /**
   * Get latest report by type
   */
  async getLatestReportByType(
    type: ReportType
  ): Promise<IPlatformReportDocument | null> {
    try {
      const report = await PlatformReport.findOne({ type })
        .sort({ generatedAt: -1 })
        .lean();

      return report as IPlatformReportDocument | null;
    } catch (error) {
      logger.error('Error fetching latest report:', error);
      throw error;
    }
  }

  /**
   * Delete report
   */
  async deleteReport(
    reportId: string,
    adminId: string,
    auditContext?: AuditContext
  ): Promise<void> {
    try {
      // Get report first for logging details
      const report = await this.getReportById(reportId);
      
      await PlatformReport.deleteOne({ reportId });

      logger.info(`Report deleted: ${reportId} by admin ${adminId}`);

      // Log admin action
      await adminActionService.logAction(
        {
          actionType: AdminActionType.DELETE_REPORT,
          targetId: reportId,
          description: `Deleted ${report.type} report (${report.period})`,
          actionDetails: {
            reportType: report.type,
            period: report.period,
            generatedAt: report.generatedAt.toISOString()
          }
        },
        adminId,
        auditContext?.ipAddress,
        auditContext?.userAgent
      );
    } catch (error) {
      logger.error('Error deleting report:', error);
      throw error;
    }
  }

  /**
   * Delete old reports (cleanup)
   */
  async deleteOldReports(
    days: number = 90,
    adminId: string,
    auditContext?: AuditContext
  ): Promise<number> {
    try {
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const result = await PlatformReport.deleteMany({
        generatedAt: { $lt: cutoffDate }
      });

      const deletedCount = result.deletedCount || 0;

      logger.info(`Deleted ${deletedCount} old reports (older than ${days} days) by admin ${adminId}`);
      
      // Log admin action
      await adminActionService.logAction(
        {
          actionType: AdminActionType.CLEANUP_OLD_REPORTS,
          targetId: 'bulk-cleanup',
          description: `Cleaned up ${deletedCount} old reports (older than ${days} days)`,
          actionDetails: {
            days,
            deletedCount,
            cutoffDate: cutoffDate.toISOString()
          }
        },
        adminId,
        auditContext?.ipAddress,
        auditContext?.userAgent
      );

      return deletedCount;
    } catch (error) {
      logger.error('Error deleting old reports:', error);
      throw error;
    }
  }

  /**
   * Calculate date range based on period
   */
  private calculateDateRange(
    period: ReportPeriod,
    customStart?: Date,
    customEnd?: Date
  ): { startDate: Date; endDate: Date } {
    // If custom dates provided, use them
    if (customStart && customEnd) {
      if (customStart > customEnd) {
        throw new ValidationError('Start date cannot be after end date');
      }
      return { startDate: customStart, endDate: customEnd };
    }

    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (period) {
      case ReportPeriod.DAILY:
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(now.setHours(23, 59, 59, 999));
        break;

      case ReportPeriod.WEEKLY:
        const dayOfWeek = now.getDay();
        startDate = new Date(now);
        startDate.setDate(now.getDate() - dayOfWeek);
        startDate.setHours(0, 0, 0, 0);
        break;

      case ReportPeriod.MONTHLY:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        break;

      case ReportPeriod.QUARTERLY:
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0, 23, 59, 59);
        break;

      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    return { startDate, endDate };
  }

  /**
   * Aggregate report data from other services
   */
  private async aggregateReportData(
    type: ReportType,
    startDate: Date,
    endDate: Date
  ): Promise<Record<string, any>> {
    try {
      switch (type) {
        case ReportType.USER_STATS:
          return await this.aggregateUserStats(startDate, endDate);
        
        case ReportType.TRANSACTION_STATS:
          return await this.aggregateTransactionStats(startDate, endDate);
        
        case ReportType.REVENUE_STATS:
          return await this.aggregateRevenueStats(startDate, endDate);
        
        case ReportType.CARBON_STATS:
          return await this.aggregateCarbonStats(startDate, endDate);
        
        default:
          throw new ValidationError(`Invalid report type: ${type}`);
      }
    } catch (error) {
      logger.error('Error aggregating report data:', error);
      throw error;
    }
  }

  /**
   * Aggregate user statistics
   */
  private async aggregateUserStats(
    startDate: Date,
    endDate: Date
  ): Promise<Record<string, any>> {
    try {
      // Call Auth Service API to get user stats
      const authServiceUrl = process.env.AUTH_SERVICE_URL;
      
      // Mock data for now (replace with actual API call)
      return {
        totalUsers: 150,
        newUsers: 25,
        activeUsers: 120,
        usersByRole: {
          EV_OWNER: 80,
          BUYER: 50,
          CVA: 15,
          ADMIN: 5
        },
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      };
    } catch (error) {
      logger.error('Error aggregating user stats:', error);
      return { error: 'Failed to fetch user statistics' };
    }
  }

  /**
   * Aggregate transaction statistics
   */
  private async aggregateTransactionStats(
    startDate: Date,
    endDate: Date
  ): Promise<Record<string, any>> {
    try {
      // Call Marketplace Service API to get transaction stats
      const marketplaceServiceUrl = process.env.MARKETPLACE_SERVICE_URL;
      
      // Mock data for now (replace with actual API call)
      return {
        totalTransactions: 320,
        completedTransactions: 280,
        pendingTransactions: 30,
        failedTransactions: 10,
        totalVolume: 15000,
        averageTransactionValue: 46.88,
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      };
    } catch (error) {
      logger.error('Error aggregating transaction stats:', error);
      return { error: 'Failed to fetch transaction statistics' };
    }
  }

  /**
   * Aggregate revenue statistics
   */
  private async aggregateRevenueStats(
    startDate: Date,
    endDate: Date
  ): Promise<Record<string, any>> {
    try {
      // Call Payment Service API to get revenue stats
      const paymentServiceUrl = process.env.PAYMENT_SERVICE_URL;
      
      // Mock data for now (replace with actual API call)
      return {
        totalRevenue: 15000,
        platformFees: 750,
        netRevenue: 14250,
        transactionCount: 280,
        averageRevenuePerTransaction: 53.57,
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      };
    } catch (error) {
      logger.error('Error aggregating revenue stats:', error);
      return { error: 'Failed to fetch revenue statistics' };
    }
  }

  /**
   * Aggregate carbon statistics
   */
  private async aggregateCarbonStats(
    startDate: Date,
    endDate: Date
  ): Promise<Record<string, any>> {
    try {
      // Call Carbon Service API to get carbon stats
      const carbonServiceUrl = process.env.CARBON_SERVICE_URL;
      
      // Mock data for now (replace with actual API call)
      return {
        totalCreditsIssued: 5000,
        totalCreditsTraded: 3200,
        totalCO2Reduced: 2500,
        averageCreditPrice: 4.69,
        topSellers: [
          { userId: 'user1', credits: 500 },
          { userId: 'user2', credits: 450 }
        ],
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      };
    } catch (error) {
      logger.error('Error aggregating carbon stats:', error);
      return { error: 'Failed to fetch carbon statistics' };
    }
  }
}

export default new ReportService();