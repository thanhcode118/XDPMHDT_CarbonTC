import { Request } from 'express';

// ============= ENUMS =============

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

// ============= INTERFACES =============

// Extended Request with authenticated user
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: UserRole;
    iat?: number;
    exp?: number;
  };
}

// Dispute related
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

// Platform Report related
export interface IPlatformReport {
  reportId: string;
  type: ReportType;
  dataJson: Record<string, any>;
  period: ReportPeriod;
  generatedAt: Date;
  generatedBy: string;
}

export interface GenerateReportDTO {
  type: ReportType;
  period: ReportPeriod;
  startDate?: Date;
  endDate?: Date;
}

// Admin Action related
export interface IAdminAction {
  actionId: string;
  adminId: string;
  actionType: AdminActionType;
  targetId: string;
  description: string;
  createdAt: Date;
  actionDetails?: Record<string, any>;
}

export interface CreateAdminActionDTO {
  actionType: AdminActionType;
  targetId: string;
  description: string;
  actionDetails?: Record<string, any>;
}

// System Config related
export interface ISystemConfig {
  configId: string;
  configKey: string;
  configValue: string;
  description?: string;
  updatedAt: Date;
  updatedBy: string;
}

export interface UpdateSystemConfigDTO {
  configValue: string;
  description?: string;
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Query filters
export interface DisputeQueryFilter extends PaginationParams {
  status?: DisputeStatus;
  raisedBy?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface ReportQueryFilter extends PaginationParams {
  type?: ReportType;
  period?: ReportPeriod;
  startDate?: Date;
  endDate?: Date;
}

export interface AdminActionQueryFilter extends PaginationParams {
  adminId?: string;
  actionType?: AdminActionType;
  startDate?: Date;
  endDate?: Date;
}

// RabbitMQ Message Types
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

// Certificate related
export interface CertificateData {
  transactionId: string;
  buyerId: string;
  creditAmount: number;
  certificateNumber: string;
  uniqueHash: string;
  issuedAt: Date;
  expiryDate?: Date;
}

// Error types
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, true);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, true);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, true);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404, true);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, true);
  }
}