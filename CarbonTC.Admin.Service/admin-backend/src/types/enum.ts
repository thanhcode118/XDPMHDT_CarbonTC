export enum UserRole {
  EV_OWNER = 'EV_OWNER',
  BUYER = 'BUYER',
  CVA = 'CVA',
  ADMIN = 'ADMIN'
}

export enum DisputeStatus {
  PENDING = 'Pending',
  UNDER_REVIEW = 'UnderReview',
  RESOLVED = 'Resolved',
  REJECTED = 'Rejected'
}

export enum ReportType {
  USER_STATS = 'UserStats',
  TRANSACTION_STATS = 'TransactionStats',
  REVENUE_STATS = 'RevenueStats',
  CARBON_STATS = 'CarbonStats'
}

export enum ReportPeriod {
  DAILY = 'Daily',
  WEEKLY = 'Weekly',
  MONTHLY = 'Monthly',
  QUARTERLY = 'Quarterly'
}

export enum AdminActionType {
  BLOCK_USER = 'BlockUser',
  UNBLOCK_USER = 'UnblockUser',
  APPROVE_WITHDRAWAL = 'ApproveWithdrawal',
  REJECT_WITHDRAWAL = 'RejectWithdrawal',
  RESOLVE_DISPUTE = 'ResolveDispute',
  FORCE_REFUND = 'ForceRefund',
  DELIST_LISTING = 'DelistListing',
  FREEZE_LISTING = 'FreezeListing',
  UNFREEZE_LISTING = 'UnfreezeListing',
  UPDATE_CONFIG = 'UpdateConfig',
  ISSUE_CERTIFICATE = 'IssueCertificate',
  REVOKE_CERTIFICATE = 'RevokeCertificate'
}