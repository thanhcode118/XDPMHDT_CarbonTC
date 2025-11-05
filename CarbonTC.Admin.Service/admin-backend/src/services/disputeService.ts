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
import { marketplaceClient } from '../utils/clients';

class DisputeService {
    private async validateTransaction(
        transactionId: string,
        raisedBy: string,
        authToken?: string
    ): Promise<void> {
        try {
            // Check if transaction exists in Marketplace Service
            const transactionExists = await marketplaceClient.checkTransactionExists(
                transactionId,
                authToken
            );

            if (!transactionExists) {
                throw new NotFoundError(
                    `Transaction not found with ID: ${transactionId}`
                );
            }

            // Optional: Get transaction details to validate user permission
            // Uncomment if you need to check if user is buyer or seller
            /*
            try {
                const transaction = await marketplaceClient.getTransactionDetails(
                    transactionId,
                    authToken
                );

                // Check if user is buyer or seller of this transaction
                if (transaction.buyerId !== raisedBy && transaction.sellerId !== raisedBy) {
                    throw new ValidationError(
                        'You are not authorized to create a dispute for this transaction'
                    );
                }
            } catch (error) {
                logger.warn('Could not validate user permission for transaction', error);
                // Continue anyway - let it through
            }
            */

            logger.info(`Transaction ${transactionId} validated successfully`);
        } catch (error) {
            if (error instanceof NotFoundError || error instanceof ValidationError) {
                throw error;
            }
            // If service is down, log warning but allow dispute creation
            logger.warn(
                `Could not validate transaction ${transactionId} - Marketplace Service may be unavailable`,
                error
            );
        }
    }

    async createDispute(
        data: CreateDisputeDTO, 
        raisedBy: string,
        authToken?: string
    ): Promise<IDisputeDocument> {
        try {
            // Validate transaction exists (call Service 3)
            await this.validateTransaction(data.transactionId, raisedBy, authToken);

            // Check if there's already an active dispute for this transaction
            const existingDispute = await Dispute.findOne({
                transactionId: data.transactionId,
                status: { $in: [DisputeStatus.PENDING, DisputeStatus.UNDER_REVIEW] }
            });

            if (existingDispute) {
                throw new ConflictError(
                    'An active dispute already exists for this transaction'
                );
            }

            // Create the dispute
            const dispute = new Dispute({
                ...data,
                raisedBy,
                status: DisputeStatus.PENDING
            });

            await dispute.save();
            logger.info(
                `Dispute created with ID: ${dispute.disputeId} by user: ${raisedBy} for transaction: ${data.transactionId}`
            );

            // Publish event to RabbitMQ for Service 3
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
                throw new ValidationError('Dispute is already resolved');
            }

            if (dispute.status === DisputeStatus.REJECTED) {
                throw new ValidationError('Dispute is already rejected');
            }

            dispute.status = resolution.status;
            dispute.resolutionNotes = resolution.resolutionNotes;
            dispute.resolvedAt = new Date();
            await dispute.save();

            logger.info(`Dispute ${disputeId} resolved by ${resolvedBy} with status: ${resolution.status}`);
            
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

    /**
     * Publish dispute event to RabbitMQ for other services
     */
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
                    routingKey = 'dispute.status.updated';
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
            // Don't throw error - dispute is already saved, event publishing failure shouldn't break the flow
        }
    }
}

export default new DisputeService();