import { DisputeStatus } from "./enum";

export interface UserStatusUpdateMessage {
  userId: string;
  status: 'blocked' | 'unblocked';
  reason?: string;
  actionBy: string;
  timestamp: Date;
}

export interface DisputeEventMessage {
  disputeId: string;
  transactionId: string;
  status: DisputeStatus;
  resolvedBy?: string;
  resolutionNotes?: string;
  timestamp: Date;
}

export interface WithdrawalApprovalMessage {
  requestId: string;
  userId: string;
  amount: number;
  status: 'approved' | 'rejected';
  approvedBy: string;
  notes?: string;
  timestamp: Date;
}

export interface ListingModerationMessage {
  listingId: string;
  action: 'delist' | 'freeze' | 'unfreeze';
  reason?: string;
  moderatedBy: string;
  timestamp: Date;
}