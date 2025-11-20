export enum ActionType {
  BLOCK_USER = 'BlockUser',
  UNBLOCK_USER = 'UnblockUser',
  RESOLVE_DISPUTE = 'ResolveDispute',
  APPROVE_WITHDRAWAL = 'ApproveWithdrawal',
  REJECT_WITHDRAWAL = 'RejectWithdrawal',
  FORCE_REFUND = 'ForceRefund',
  UPDATE_CONFIG = 'UpdateConfig',
  DELETE_REPORT = 'DeleteReport',
  DELIST_LISTING = 'DelistListing',
  FREEZE_USER = 'FreezeUser',
  UNFREEZE_USER = 'UnfreezeUser',
}

export interface AdminAction {
  actionId: string;
  id?: string; // For DataGrid
  adminId: string;
  adminName?: string;
  adminEmail?: string;
  actionType: ActionType | string;
  targetId: string;
  targetType?: string;
  description: string;
  actionDetails?: Record<string, unknown>;
  createdAt: string;
}

export interface AdminActionDetail extends AdminAction {
  targetDetails?: Record<string, unknown>;
}

export interface AdminActionStatistics {
  totalActions: number;
  thisWeek: number;
  thisMonth: number;
  mostCommonAction: string;
  lastActivity: string;
  actionsByType: Record<string, number>;
}

export interface AdminActivitySummary {
  adminId: string;
  adminName: string;
  totalActions: number;
  recentActions: number;
  actionBreakdown: Record<string, number>;
  lastActiveAt: string;
}

export interface AdminActionFilters {
  actionType?: ActionType | string;
  adminId?: string;
  targetId?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
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

export const ActionTypeLabels: Record<string, string> = {
  BlockUser: 'Block User',
  UnblockUser: 'Unblock User',
  ResolveDispute: 'Resolve Dispute',
  ApproveWithdrawal: 'Approve Withdrawal',
  RejectWithdrawal: 'Reject Withdrawal',
  ForceRefund: 'Force Refund',
  UpdateConfig: 'Update Config',
  DeleteReport: 'Delete Report',
  DelistListing: 'Delist Listing',
  FreezeUser: 'Freeze User',
  UnfreezeUser: 'Unfreeze User',
};

export const getActionTypeColor = (
  actionType: string,
): 'success' | 'warning' | 'error' | 'info' | 'default' => {
  switch (actionType) {
    case ActionType.BLOCK_USER:
    case ActionType.REJECT_WITHDRAWAL:
    case ActionType.FORCE_REFUND:
    case ActionType.FREEZE_USER:
      return 'error';

    case ActionType.UNBLOCK_USER:
    case ActionType.APPROVE_WITHDRAWAL:
    case ActionType.UNFREEZE_USER:
      return 'success';

    case ActionType.RESOLVE_DISPUTE:
      return 'info';

    case ActionType.UPDATE_CONFIG:
    case ActionType.DELETE_REPORT:
    case ActionType.DELIST_LISTING:
      return 'warning';

    default:
      return 'default';
  }
};
