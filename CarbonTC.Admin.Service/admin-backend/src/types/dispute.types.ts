import { DisputeStatus } from "./enum";

export interface IDispute {
  disputeId: string;
  transactionId: string;
  raisedBy: string;
  reason: string;
  description: string;
  status: DisputeStatus;
  createdAt: Date;
  resolvedAt?: Date;
  resolutionNotes?: string;
}

export interface CreateDisputeDTO {
  transactionId: string;
  reason: string;
  description: string;
}

export interface ResolveDisputeDTO {
  status: DisputeStatus;
  resolutionNotes: string;
}