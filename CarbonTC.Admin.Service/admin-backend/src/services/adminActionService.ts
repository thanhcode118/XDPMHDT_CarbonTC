import AdminAction, { IAdminActionDocument } from '../models/AdminAction';
import { 
  CreateAdminActionDTO, 
  AdminActionQueryFilter,
  AdminActionType,
  NotFoundError
} from '../types';
import logger from '../utils/logger';

/**
 * Admin Action Service
 * Handles logging and tracking of all administrative actions
 */
class AdminActionService {

  /**
   * Log an admin action
   */
  async logAction(
    data: CreateAdminActionDTO,
    adminId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<IAdminActionDocument> {
    try {
      const action = new AdminAction({
        ...data,
        adminId,
        ipAddress,
        userAgent
      });

      await action.save();

      logger.info(
        `Admin action logged: ${action.actionType} by ${adminId} on target ${data.targetId}`
      );

      return action;
    } catch (error) {
      logger.error('Error logging admin action:', error);
      throw error;
    }
  }

  /**
   * Get action by ID
   */
  async getActionById(actionId: string): Promise<IAdminActionDocument> {
    try {
      const action = await AdminAction.findOne({ actionId });

      if (!action) {
        throw new NotFoundError(`Admin action not found with ID: ${actionId}`);
      }

      return action;
    } catch (error) {
      logger.error('Error fetching admin action:', error);
      throw error;
    }
  }

  /**
   * Get all actions with filters and pagination
   */
  async getAllActions(
    filters: AdminActionQueryFilter
  ): Promise<{ actions: IAdminActionDocument[]; total: number }> {
    try {
      const {
        page = 1,
        limit = 10,
        adminId,
        actionType,
        startDate,
        endDate,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = filters;

      // Build query
      const query: any = {};

      if (adminId) {
        query.adminId = adminId;
      }

      if (actionType) {
        query.actionType = actionType;
      }

      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      // Execute query with pagination
      const skip = (page - 1) * limit;
      const sortOptions: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

      const [actions, total] = await Promise.all([
        AdminAction.find(query)
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .lean(),
        AdminAction.countDocuments(query)
      ]);

      return { actions: actions as unknown as IAdminActionDocument[], total };
    } catch (error) {
      logger.error('Error fetching admin actions:', error);
      throw error;
    }
  }

  /**
   * Get actions by admin
   */
  async getActionsByAdmin(adminId: string): Promise<IAdminActionDocument[]> {
    try {
      const actions = await AdminAction.find({ adminId })
        .sort({ createdAt: -1 })
        .lean();

      return actions as unknown as IAdminActionDocument[];
    } catch (error) {
      logger.error('Error fetching actions by admin:', error);
      throw error;
    }
  }

  /**
   * Get actions by type
   */
  async getActionsByType(
    actionType: AdminActionType
  ): Promise<IAdminActionDocument[]> {
    try {
      const actions = await AdminAction.find({ actionType })
        .sort({ createdAt: -1 })
        .lean();

      return actions as unknown as IAdminActionDocument[];
    } catch (error) {
      logger.error('Error fetching actions by type:', error);
      throw error;
    }
  }

  /**
   * Get actions by target
   */
  async getActionsByTarget(targetId: string): Promise<IAdminActionDocument[]> {
    try {
      const actions = await AdminAction.find({ targetId })
        .sort({ createdAt: -1 })
        .lean();

      return actions as unknown as IAdminActionDocument[];
    } catch (error) {
      logger.error('Error fetching actions by target:', error);
      throw error;
    }
  }

  /**
   * Get recent actions
   */
  async getRecentActions(hours: number = 24): Promise<IAdminActionDocument[]> {
    try {
      const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000);
      const actions = await AdminAction.find({
        createdAt: { $gte: cutoffDate }
      })
        .sort({ createdAt: -1 })
        .lean();

      return actions as unknown as IAdminActionDocument[];
    } catch (error) {
      logger.error('Error fetching recent actions:', error);
      throw error;
    }
  }

  /**
   * Get action statistics
   */
  async getActionStatistics(
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    try {
      const stats = await AdminAction.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: '$actionType',
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            actionType: '$_id',
            count: 1,
            _id: 0
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);

      const total = await AdminAction.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate }
      });

      return {
        total,
        byActionType: stats,
        period: {
          startDate,
          endDate
        }
      };
    } catch (error) {
      logger.error('Error getting action statistics:', error);
      throw error;
    }
  }

  /**
   * Get admin activity summary
   */
  async getAdminActivity(
    adminId: string,
    days: number = 30
  ): Promise<any> {
    try {
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const activity = await AdminAction.aggregate([
        {
          $match: {
            adminId,
            createdAt: { $gte: cutoffDate }
          }
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              actionType: '$actionType'
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.date': -1 }
        }
      ]);

      const totalActions = await AdminAction.countDocuments({
        adminId,
        createdAt: { $gte: cutoffDate }
      });

      return {
        adminId,
        totalActions,
        activity,
        period: {
          days,
          startDate: cutoffDate,
          endDate: new Date()
        }
      };
    } catch (error) {
      logger.error('Error getting admin activity:', error);
      throw error;
    }
  }

  /**
   * Export audit log
   */
  async exportAuditLog(
    startDate: Date,
    endDate: Date
  ): Promise<IAdminActionDocument[]> {
    try {
      const auditLog = await AdminAction.find({
        createdAt: { $gte: startDate, $lte: endDate }
      })
        .sort({ createdAt: -1 })
        .lean();

      logger.info(
        `Audit log exported: ${auditLog.length} records from ${startDate} to ${endDate}`
      );

      return auditLog as unknown as IAdminActionDocument[];
    } catch (error) {
      logger.error('Error exporting audit log:', error);
      throw error;
    }
  }

  /**
   * Get actions grouped by date
   */
  async getActionsGroupedByDate(
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    try {
      const groupedActions = await AdminAction.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
            },
            count: { $sum: 1 },
            actions: { $push: '$ROOT' }
          }
        },
        {
          $sort: { '_id.date': -1 }
        }
      ]);

      return groupedActions;
    } catch (error) {
      logger.error('Error grouping actions by date:', error);
      throw error;
    }
  }
}

export default new AdminActionService();