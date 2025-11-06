import Dispute, { IDisputeDocument } from '../models/Dispute';
import { 
  CreateDisputeDTO, 
  ResolveDisputeDTO, 
  DisputeQueryFilter,
  DisputeStatus,
  NotFoundError,
  ValidationError,
  ConflictError
} from '../types';
import { publishMessage, EXCHANGES, ROUTING_KEYS } from '../config/rabbitmq';
import logger from '../utils/logger';

class DisputeService {
    /**
     * Tạo tranh chấp mới
     * - Chỉ check duplicate TransactionId trong DB
     * - Không validate với Marketplace Service
     * - Status mặc định = Pending
     */
    async createDispute(
        data: CreateDisputeDTO, 
        raisedBy: string,
        authToken?: string
    ): Promise<IDisputeDocument> {
        try {
            // Check nếu đã có dispute cho transaction này
            const existingDispute = await Dispute.findOne({
                transactionId: data.transactionId
            });

            if (existingDispute) {
                throw new ConflictError(
                    `Tranh chấp đã tồn tại cho giao dịch ${data.transactionId}`
                );
            }

            // Tạo dispute mới với các giá trị mặc định
            const dispute = new Dispute({
                transactionId: data.transactionId,
                raisedBy,
                reason: data.reason,
                description: data.description,
                status: DisputeStatus.PENDING,
                resolvedAt: null,
                resolutionNotes: null
            });

            await dispute.save();
            logger.info(
                `Dispute created - ID: ${dispute.disputeId}, User: ${raisedBy}, Transaction: ${data.transactionId}, Status: ${dispute.status}`
            );

            // Publish event đến RabbitMQ
            await this.publishDisputeEvent(dispute, 'created');

            return dispute;
        } catch (error) {
            logger.error('Error creating dispute:', error);
            throw error;
        }
    }

    async getDisputeById(disputeId: string): Promise<IDisputeDocument> {
        try {
            const dispute = await Dispute.findOne({ disputeId });

            if (!dispute) {
                throw new NotFoundError(`Không tìm thấy tranh chấp với ID: ${disputeId}`);
            }

            return dispute;
        } catch (error) {
            logger.error('Error fetching dispute:', error);
            throw error;
        }
    }

    async getAllDisputes(
        filters: DisputeQueryFilter
    ): Promise<{ disputes: IDisputeDocument[]; total: number }> {
        try {
            const {
                page = 1,
                limit = 10,
                status,
                raisedBy,
                startDate,
                endDate,
                sortBy = 'createdAt',
                sortOrder = 'desc'
            } = filters;

            const query: any = {};
            if (status) {
                query.status = status;
            }

            if (raisedBy) {
                query.raisedBy = raisedBy;
            }

            if (startDate || endDate) {
                query.createdAt = {};
                if (startDate) query.createdAt.$gte = new Date(startDate);
                if (endDate) query.createdAt.$lte = new Date(endDate);
            }

            const skip = (page - 1) * limit;
            const sortOptions: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
            
            const [disputes, total] = await Promise.all([
                Dispute.find(query)
                    .sort(sortOptions)
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                Dispute.countDocuments(query)
            ]);

            return { disputes: disputes as unknown as IDisputeDocument[], total };
        } catch (error) {
            logger.error('Error fetching disputes:', error);
            throw error;
        }
    }

    async getDisputesByTransaction(
        transactionId: string
    ): Promise<IDisputeDocument[]> {
        try {
            const disputes = await Dispute.find({ transactionId })
                .sort({ createdAt: -1 })
                .lean();

            return disputes as unknown as IDisputeDocument[];
        } catch (error) {
            logger.error('Error fetching disputes by transaction:', error);
            throw error;
        }
    }

    async getDisputesByUser(userId: string): Promise<IDisputeDocument[]> {
        try {
            const disputes = await Dispute.find({ raisedBy: userId })
                .sort({ createdAt: -1 })
                .lean();

            return disputes as unknown as IDisputeDocument[];
        } catch (error) {
            logger.error('Error fetching disputes by user:', error);
            throw error;
        }
    }

    async updateDisputeStatus(
        disputeId: string,
        status: DisputeStatus
    ): Promise<IDisputeDocument> {
        try {
            const dispute = await this.getDisputeById(disputeId);
            
            // Không cho phép thay đổi status nếu đã Resolved hoặc Rejected
            if (dispute.status === DisputeStatus.RESOLVED || 
                dispute.status === DisputeStatus.REJECTED) {
                throw new ValidationError(
                    'Không thể thay đổi trạng thái của tranh chấp đã được giải quyết hoặc từ chối'
                );
            }

            const oldStatus = dispute.status;
            dispute.status = status;
            
            // Nếu chuyển sang Resolved hoặc Rejected, cập nhật resolvedAt
            if (status === DisputeStatus.RESOLVED || status === DisputeStatus.REJECTED) {
                dispute.resolvedAt = new Date();
            }
            
            await dispute.save();
            
            logger.info(
                `Dispute ${disputeId} status updated: ${oldStatus} -> ${status}`
            );

            // Publish status update event
            await this.publishDisputeEvent(dispute, 'status_updated');

            return dispute;
        } catch (error) {
            logger.error('Error updating dispute status:', error);
            throw error;
        }
    }

    async resolveDispute(
        disputeId: string,
        resolution: ResolveDisputeDTO,
        resolvedBy: string
    ): Promise<IDisputeDocument> {
        try {
            const dispute = await this.getDisputeById(disputeId);
            
            if (dispute.status === DisputeStatus.RESOLVED) {
                throw new ValidationError('Tranh chấp đã được giải quyết');
            }

            if (dispute.status === DisputeStatus.REJECTED) {
                throw new ValidationError('Tranh chấp đã bị từ chối');
            }

            dispute.status = resolution.status;
            dispute.resolutionNotes = resolution.resolutionNotes;
            dispute.resolvedAt = new Date();
            await dispute.save();

            logger.info(
                `Dispute ${disputeId} resolved by ${resolvedBy} with status: ${resolution.status}`
            );
            
            // Publish resolved event
            await this.publishDisputeEvent(dispute, 'resolved', resolvedBy);

            return dispute;
        } catch (error) {
            logger.error('Error resolving dispute:', error);
            throw error;
        }
    }

    async deleteDispute(disputeId: string): Promise<void> {
        try {
            const dispute = await this.getDisputeById(disputeId);

            if (dispute.status !== DisputeStatus.PENDING) {
                throw new ValidationError(
                    'Chỉ có thể xóa tranh chấp đang ở trạng thái Pending'
                );
            }

            dispute.status = DisputeStatus.REJECTED;
            dispute.resolutionNotes = 'Tranh chấp đã bị hủy bởi người dùng';
            dispute.resolvedAt = new Date();
            await dispute.save();

            logger.info(`Dispute ${disputeId} deleted (soft delete -> Rejected)`);
        } catch (error) {
            logger.error('Error deleting dispute:', error);
            throw error;
        }
    }

    async getDisputeStatistics(
        startDate?: Date,
        endDate?: Date
    ): Promise<any> {
        try {
            const matchStage: any = {};
            
            if (startDate || endDate) {
                matchStage.createdAt = {};
                if (startDate) matchStage.createdAt.$gte = startDate;
                if (endDate) matchStage.createdAt.$lte = endDate;
            }

            const stats = await Dispute.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        status: '$_id',
                        count: 1,
                        _id: 0
                    }
                }
            ]);

            const total = await Dispute.countDocuments(matchStage);

            return {
                total,
                byStatus: stats,
                period: {
                    startDate,
                    endDate
                }
            };
        } catch (error) {
            logger.error('Error getting dispute statistics:', error);
            throw error;
        }
    }

    private async publishDisputeEvent(
        dispute: IDisputeDocument,
        action: 'created' | 'resolved' | 'status_updated',
        resolvedBy?: string
    ): Promise<void> {
        try {
            const message = {
                disputeId: dispute.disputeId,
                transactionId: dispute.transactionId,
                status: dispute.status,
                raisedBy: dispute.raisedBy,
                action,
                resolvedBy,
                resolutionNotes: dispute.resolutionNotes,
                timestamp: new Date()
            };

            let routingKey: string;
            switch (action) {
                case 'created':
                    routingKey = ROUTING_KEYS.DISPUTE_CREATED;
                    break;
                case 'resolved':
                    routingKey = ROUTING_KEYS.DISPUTE_RESOLVED;
                    break;
                case 'status_updated':
                    routingKey = ROUTING_KEYS.DISPUTE_STATUS_UPDATED;
                    break;
                default:
                    routingKey = ROUTING_KEYS.DISPUTE_CREATED;
            }

            await publishMessage(EXCHANGES.DISPUTE_EVENTS, routingKey, message);

            logger.info(
                `Dispute event published: ${action} - Dispute: ${dispute.disputeId}, Transaction: ${dispute.transactionId}`
            );
        } catch (error) {
            logger.error('Error publishing dispute event:', error);
            // Không throw error - dispute đã được lưu, việc publish event fail không nên break flow
        }
    }
}

export default new DisputeService();