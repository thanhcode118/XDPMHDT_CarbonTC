// Dispute Types & Interfaces

export enum DisputeStatus {
  PENDING = 'Pending',
  UNDER_REVIEW = 'UnderReview',
  RESOLVED = 'Resolved',
  REJECTED = 'Rejected',
}

export enum ResolutionType {
  APPROVE = 'Approve',
  REJECT = 'Reject',
}

export enum ActionType {
  REFUND = 'Refund',
  CANCEL = 'CancelTransaction',
  NO_ACTION = 'NoAction',
}

export interface Dispute {
  disputeId: string;
  id?: string;
  transactionId: string;
  raisedBy: string;
  raisedByName?: string;
  raisedByEmail?: string;
  reason: string;
  description: string;
  status: DisputeStatus;
  createdAt: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

export interface DisputeDetail extends Dispute {
  transactionDetails?: {
    buyerId: string;
    buyerName: string;
    sellerId: string;
    sellerName: string;
    amount: number;
    quantity: number;
    listingId: string;
  };
}

export interface DisputeStatistics {
  total: number;
  byStatus: {
    pending: number;
    resolved: number;
    rejected: number;
    underReview: number;
  };
  avgResolutionTime: number;
  recentTrend: Array<{
    date: string;
    count: number;
  }>;
}

export interface DisputeFilters {
  status?: DisputeStatus;
  raisedBy?: string;
  transactionId?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
}

export interface CreateDisputeRequest {
  transactionId: string;
  // raisedBy: string;
  reason: string;
  description: string;
}

export interface UpdateStatusRequest {
  status: DisputeStatus;
}

export interface ResolveDisputeRequest {
  resolution: ResolutionType;
  resolutionNotes: string;
  action?: {
    type: ActionType;
    details?: unknown;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
