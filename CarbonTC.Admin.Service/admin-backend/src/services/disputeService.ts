import Dispute, { IDisputeDocument } from '../models/Dispute';
import { 
  CreateDisputeDTO, 
  ResolveDisputeDTO, 
  DisputeQueryFilter,
  DisputeStatus,
  NotFoundError,
  ValidationError,
  ConflictError,
  AdminActionType
} from '../types';
import { publishMessage, EXCHANGES, ROUTING_KEYS } from '../config/rabbitmq';
import adminActionService from './adminActionService';
import logger from '../utils/logger';
import { mapTransactionStatus } from '../utils/transactionStatus';

class DisputeService {
    async createDispute(
        data: CreateDisputeDTO, 
        raisedBy: string,
        authToken?: string,
        ipAddress?: string,
        userAgent?: string
    ): Promise<any> {
        try {
            // ✅ Validate transactionId must be UUID format
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(data.transactionId)) {
                throw new ValidationError(
                    'TransactionId must be a valid UUID format (e.g., 550e8400-e29b-41d4-a716-446655440000)'
                );
            }

            // ⚠️ Detect old format and log warning
            if (data.transactionId.startsWith('TXN-')) {
                logger.warn(
                    `Old transaction format detected: ${data.transactionId}. Please use UUID format.`
                );
            }

            // Check nếu đã có dispute cho transaction này
            const existingDispute = await Dispute.findOne({
                transactionId: data.transactionId
            });

            if (existingDispute) {
                throw new ConflictError(
                    `Tranh chấp đã tồn tại cho giao dịch ${data.transactionId}`
                );
            }

            try {
                const marketplaceClient = (await import('../utils/clients/marketplaceClient')).default;
                const transactionExists = await marketplaceClient.checkTransactionExists(
                    data.transactionId,
                    authToken
                );

                if (!transactionExists) {
                    throw new NotFoundError(
                        `Transaction ${data.transactionId} không tồn tại trong hệ thống`
                    );
                }
            } catch (error) {
                logger.error('Error checking transaction existence:', error);
                throw new ValidationError(
                    `Không thể xác thực transaction ${data.transactionId}. Vui lòng kiểm tra lại.`
                );
            }

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
                `Dispute created - ID: ${dispute.disputeId}, 
                User: ${raisedBy}, 
                Transaction: ${data.transactionId}, 
                Status: ${dispute.status}`
            );

            // 🔥 LOG ADMIN ACTION
            await adminActionService.logAction(
                {
                    actionType: AdminActionType.CREATE_DISPUTE,
                    targetId: dispute.disputeId,
                    description: `Created dispute for transaction ${data.transactionId}: ${data.reason}`,
                    actionDetails: {
                        disputeId: dispute.disputeId,
                        transactionId: data.transactionId,
                        reason: data.reason,
                        description: data.description,
                        status: dispute.status
                    }
                },
                raisedBy,
                ipAddress,
                userAgent
            );

            // Publish event đến RabbitMQ
            await this.publishDisputeEvent(dispute, 'created');

            // 🔥 Return enriched data (consistent với các endpoints khác)
            return await this.getDisputeById(dispute.disputeId, authToken);
        } catch (error) {
            logger.error('Error creating dispute:', error);
            throw error;
        }
    }

    async getDisputeById(
        disputeId: string, 
        authToken?: string
    ): Promise<any> {
        try {
            const dispute = await Dispute.findOne({ disputeId });

            if (!dispute) {
                throw new NotFoundError(`Không tìm thấy tranh chấp với ID: ${disputeId}`);
            }

            // Convert to plain object for enrichment
            let enrichedDispute: any = dispute.toJSON();

            try {
                const marketplaceClient = (await import('../utils/clients/marketplaceClient')).default;
                const transactionResponse = await marketplaceClient.getTransactionDetails(
                    dispute.transactionId,
                    authToken
                );
                
                // Extract transaction data from response wrapper
                const transaction = transactionResponse?.data || transactionResponse;

                if (transaction) {
                    logger.info(
                        `Fetched transaction ${dispute.transactionId}: buyerId=${transaction.buyerId}, sellerId=${transaction.sellerId}, status=${transaction.status}`
                    );

                    let buyerInfo = null;
                    if (transaction.buyerId) {
                        try {
                            const authClient = (await import('../utils/clients/authClient')).default;
                            buyerInfo = await authClient.getUserBasicInfo(transaction.buyerId, authToken);
                            
                            if (buyerInfo) {
                                logger.info(
                                    `Enriched buyer info for ${transaction.buyerId}: ${buyerInfo.fullName}`
                                );
                            }
                        } catch (err) {
                            logger.warn(
                                `Failed to fetch buyer info for ${transaction.buyerId}:`,
                                err
                            );
                        }
                    }

                    let sellerInfo = null;
                    if (transaction.sellerId) {
                        try {
                            const authClient = (await import('../utils/clients/authClient')).default;
                            sellerInfo = await authClient.getUserBasicInfo(transaction.sellerId, authToken);
                            
                            if (sellerInfo) {
                                logger.info(
                                    `Enriched seller info for ${transaction.sellerId}: ${sellerInfo.fullName}`
                                );
                            }
                        } catch (err) {
                            logger.warn(
                                `Failed to fetch seller info for ${transaction.sellerId}:`,
                                err
                            );
                        }
                    }

                    enrichedDispute.transactionDetails = {
                        transactionId: transaction.id || dispute.transactionId,
                        listingId: transaction.listingId,
                        quantity: transaction.quantity,
                        amount: transaction.totalAmount || transaction.amount || 0,
                        statusCode: transaction.status,
                        status: mapTransactionStatus(transaction.status),
                        buyerId: transaction.buyerId,
                        buyerName: buyerInfo?.fullName || 'Unknown Buyer',
                        buyerEmail: buyerInfo?.email || null,
                        sellerId: transaction.sellerId,
                        sellerName: sellerInfo?.fullName || 'Unknown Seller',
                        sellerEmail: sellerInfo?.email || null,
                        createdAt: transaction.createdAt,
                        completedAt: transaction.completedAt
                    };

                    logger.info(
                        `✅ Fully enriched dispute ${disputeId} with transaction, buyer, and seller details`
                    );
                } else {
                    logger.warn(
                        `Transaction ${dispute.transactionId} returned empty response`
                    );
                }
            } catch (err) {
                logger.warn(
                    `Failed to fetch transaction details for ${dispute.transactionId}:`,
                    err
                );
                // Continue without transaction details - not critical
            }

            // ENRICH: Fetch user details from Auth Service (dispute creator)
            try {
                const authClient = (await import('../utils/clients/authClient')).default;
                const userInfo = await authClient.getUserBasicInfo(dispute.raisedBy, authToken);
                
                if (userInfo) {
                    enrichedDispute.raisedByName = userInfo.fullName;
                    enrichedDispute.raisedByEmail = userInfo.email;

                    logger.info(
                        `Enriched dispute ${disputeId} with creator details for ${dispute.raisedBy}`
                    );
                }
            } catch (err) {
                logger.warn(
                    `Failed to fetch creator details for ${dispute.raisedBy}:`,
                    err
                );
                // Continue without user details - not critical
            }

            return enrichedDispute;
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
        status: DisputeStatus,
        authToken?: string,
        adminId?: string,
        ipAddress?: string,
        userAgent?: string
    ): Promise<any> {
        try {
            const dispute = await Dispute.findOne({ disputeId });
            
            if (!dispute) {
                throw new NotFoundError(`Không tìm thấy tranh chấp với ID: ${disputeId}`);
            }
            
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

            // 🔥 LOG ADMIN ACTION
            if (adminId) {
                await adminActionService.logAction(
                    {
                        actionType: AdminActionType.UPDATE_DISPUTE_STATUS,
                        targetId: disputeId,
                        description: `Updated dispute status from ${oldStatus} to ${status}`,
                        actionDetails: {
                            disputeId,
                            transactionId: dispute.transactionId,
                            oldStatus,
                            newStatus: status,
                            resolvedAt: dispute.resolvedAt
                        }
                    },
                    adminId,
                    ipAddress,
                    userAgent
                );
            }

            await this.publishDisputeEvent(dispute, 'status_updated');

            return await this.getDisputeById(disputeId, authToken);
        } catch (error) {
            logger.error('Error updating dispute status:', error);
            throw error;
        }
    }

    async resolveDispute(
        disputeId: string,
        resolution: ResolveDisputeDTO,
        resolvedBy: string,
        authToken?: string,
        ipAddress?: string,
        userAgent?: string
    ): Promise<any> {
        try {
            const dispute = await Dispute.findOne({ disputeId });
            
            if (!dispute) {
                throw new NotFoundError(`Không tìm thấy tranh chấp với ID: ${disputeId}`);
            }
            
            if (dispute.status === DisputeStatus.RESOLVED) {
                throw new ValidationError('Tranh chấp đã được giải quyết');
            }

            if (dispute.status === DisputeStatus.REJECTED) {
                throw new ValidationError('Tranh chấp đã bị từ chối');
            }

            const oldStatus = dispute.status;
            dispute.status = resolution.status;
            dispute.resolutionNotes = resolution.resolutionNotes;
            dispute.resolvedAt = new Date();
            await dispute.save();

            logger.info(
                `Dispute ${disputeId} resolved by ${resolvedBy} with status: ${resolution.status}`
            );

            // 🔥 LOG ADMIN ACTION
            await adminActionService.logAction(
                {
                    actionType: AdminActionType.RESOLVE_DISPUTE,
                    targetId: disputeId,
                    description: `Resolved dispute with status: ${resolution.status}`,
                    actionDetails: {
                        disputeId,
                        transactionId: dispute.transactionId,
                        oldStatus,
                        newStatus: resolution.status,
                        resolutionNotes: resolution.resolutionNotes,
                        resolvedBy,
                        resolvedAt: dispute.resolvedAt
                    }
                },
                resolvedBy,
                ipAddress,
                userAgent
            );
            
            // Publish resolved event
            await this.publishDisputeEvent(dispute, 'resolved', resolvedBy);

            return await this.getDisputeById(disputeId, authToken);
        } catch (error) {
            logger.error('Error resolving dispute:', error);
            throw error;
        }
    }

    async deleteDispute(
        disputeId: string,
        deletedBy: string,
        ipAddress?: string,
        userAgent?: string
    ): Promise<void> {
        try {
            const dispute = await Dispute.findOne({ disputeId });

            if (!dispute) {
                throw new NotFoundError(`Không tìm thấy tranh chấp với ID: ${disputeId}`);
            }

            if (dispute.status !== DisputeStatus.PENDING) {
                throw new ValidationError(
                    'Chỉ có thể xóa tranh chấp đang ở trạng thái Pending'
                );
            }

            const oldStatus = dispute.status;
            dispute.status = DisputeStatus.REJECTED;
            dispute.resolutionNotes = 'Tranh chấp đã bị hủy bởi người dùng';
            dispute.resolvedAt = new Date();
            await dispute.save();

            logger.info(`Dispute ${disputeId} deleted (soft delete -> Rejected)`);

            // 🔥 LOG ADMIN ACTION
            await adminActionService.logAction(
                {
                    actionType: AdminActionType.DELETE_DISPUTE,
                    targetId: disputeId,
                    description: `Deleted dispute (soft delete)`,
                    actionDetails: {
                        disputeId,
                        transactionId: dispute.transactionId,
                        oldStatus,
                        newStatus: DisputeStatus.REJECTED,
                        resolutionNotes: dispute.resolutionNotes,
                        deletedBy,
                        deletedAt: dispute.resolvedAt
                    }
                },
                deletedBy,
                ipAddress,
                userAgent
            );
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

            // Get status counts
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

            // Transform byStatus array to object
            const statusMap = stats.reduce((acc: any, item: any) => {
                const key = item.status.toLowerCase().replace('_', '');
                acc[key] = item.count;
                return acc;
            }, {});

            // Calculate average resolution time (in hours)
            const resolvedMatchStage: any = {
                status: { $in: [DisputeStatus.RESOLVED, DisputeStatus.REJECTED] },
                resolvedAt: { $exists: true },
                createdAt: { $exists: true }
            };

            if (startDate || endDate) {
                resolvedMatchStage.createdAt = {};
                if (startDate) resolvedMatchStage.createdAt.$gte = startDate;
                if (endDate) resolvedMatchStage.createdAt.$lte = endDate;
            }

            const resolvedDisputes = await Dispute.find(resolvedMatchStage)
                .select('createdAt resolvedAt')
                .lean();

            let avgResolutionTime = 0;
            if (resolvedDisputes.length > 0) {
                const totalTime = resolvedDisputes.reduce((sum, dispute) => {
                    const created = new Date(dispute.createdAt).getTime();
                    const resolved = new Date(dispute.resolvedAt!).getTime();
                    const diffHours = (resolved - created) / (1000 * 60 * 60);
                    return sum + diffHours;
                }, 0);
                avgResolutionTime = totalTime / resolvedDisputes.length;
            }

            return {
                total,
                byStatus: {
                    pending: statusMap['pending'] || 0,
                    underReview: statusMap['underreview'] || 0,
                    resolved: statusMap['resolved'] || 0,
                    rejected: statusMap['rejected'] || 0,
                },
                avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
                recentTrend: [],
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