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

export enum TransactionStatusCode {
  PENDING = 1,
  SUCCESS = 2,
  FAILED = 3,
  REFUNDED = 4,
  DISPUTED = 5,
}

export const TransactionStatusLabels: Record<number, string> = {
  1: 'Pending',
  2: 'Success',
  3: 'Failed',
  4: 'Refunded',
  5: 'Disputed',
};

export interface TransactionDetails {
  transactionId: string;
  listingId: string;
  quantity: number;
  amount: number;

  // Status - both code and label
  statusCode: number;
  status: string;

  // Buyer info - enriched from Auth Service
  buyerId: string;
  buyerName: string;
  buyerEmail?: string | null;

  // Seller info - enriched from Auth Service
  sellerId: string;
  sellerName: string;
  sellerEmail?: string | null;

  // Dates
  createdAt?: string;
  completedAt?: string | null;
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
  transactionDetails?: TransactionDetails;
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

export const getTransactionStatusColor = (statusCode: number): 'success' | 'warning' | 'error' | 'info' | 'default' => {
  switch (statusCode) {
    case TransactionStatusCode.PENDING:
      return 'warning';
    case TransactionStatusCode.SUCCESS:
      return 'success';
    case TransactionStatusCode.FAILED:
      return 'error';
    case TransactionStatusCode.REFUNDED:
      return 'info';
    case TransactionStatusCode.DISPUTED:
      return 'warning';
    default:
      return 'default';
  }
};
