import { 
    AdminActionType, 
    DisputeStatus, 
    ReportPeriod, 
    ReportType 
} from "./enum";

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