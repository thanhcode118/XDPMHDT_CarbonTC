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
    async createDispute(
        data: CreateDisputeDTO, 
        raisedBy: string
    ): Promise<IDisputeDocument> {
        try {
            const existingDispute = await Dispute.findOne({
                transactionId: data.transactionId,
                status: { $in: [DisputeStatus.PENDING, DisputeStatus.UNDER_REVIEW] }
            });

            if (existingDispute) {
                throw new ConflictError(
                    'An active dispute already exists for this transaction'
                );
            }
            const dispute = new Dispute({
                ...data,
                raisedBy,
                status: DisputeStatus.PENDING
            });

            await dispute.save();
            logger.info(
                `Dispute created with ID: ${dispute.disputeId} by user: ${raisedBy}`);
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
            throw new NotFoundError(`Dispute not found with ID: ${disputeId}`);
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
            if (dispute.status === DisputeStatus.RESOLVED || 
                dispute.status === DisputeStatus.REJECTED) {
                throw new ValidationError(
                'Cannot update status of a resolved or rejected dispute'
                );
            }

            dispute.status = status;
            await dispute.save();
            logger.info(`Dispute ${disputeId} status updated to ${status}`);

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
                throw new ValidationError('Dispute is already resolved');
            }

            if (dispute.status === DisputeStatus.REJECTED) {
                throw new ValidationError('Dispute is already rejected');
            }

            dispute.status = resolution.status;
            dispute.resolutionNotes = resolution.resolutionNotes;
            dispute.resolvedAt = new Date();
            await dispute.save();

            logger.info(`Dispute ${disputeId} resolved by ${resolvedBy}`);
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
                'Only pending disputes can be deleted'
                );
            }

            dispute.status = DisputeStatus.REJECTED;
            dispute.resolutionNotes = 'Dispute cancelled by user';
            dispute.resolvedAt = new Date();
            await dispute.save();

            logger.info(`Dispute ${disputeId} deleted (soft delete)`);
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
        action: 'created' | 'resolved',
        resolvedBy?: string
    ): Promise<void> {
        try {
            const message = {
                disputeId: dispute.disputeId,
                transactionId: dispute.transactionId,
                status: dispute.status,
                resolvedBy,
                resolutionNotes: dispute.resolutionNotes,
                timestamp: new Date()
            };

            const routingKey = action === 'created' 
                ? ROUTING_KEYS.DISPUTE_CREATED 
                : ROUTING_KEYS.DISPUTE_RESOLVED;

            await publishMessage(EXCHANGES.DISPUTE_EVENTS, routingKey, message);

            logger.info(`Dispute event published: ${action} - ${dispute.disputeId}`);
        } catch (error) {
            logger.error('Error publishing dispute event:', error);
        }
    }
}

export default new DisputeService();