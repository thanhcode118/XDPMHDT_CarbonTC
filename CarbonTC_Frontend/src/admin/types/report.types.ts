
export enum ReportType {
  USER_STATS = 'UserStats',
  TRANSACTION_STATS = 'TransactionStats',
  REVENUE_STATS = 'RevenueStats',
  CARBON_STATS = 'CarbonStats',
}

export enum ReportPeriod {
  DAILY = 'Daily',
  WEEKLY = 'Weekly',
  MONTHLY = 'Monthly',
  QUARTERLY = 'Quarterly',
}

export interface PlatformReport {
  reportId: string;
  type: ReportType;
  period: ReportPeriod;
  dataJson: ReportData;
  generatedAt: string;
  generatedBy: string;
  startDate?: string;
  endDate?: string;
}

export interface ReportData {
  // Common fields
  period?: {
    startDate: string;
    endDate: string;
  };

  // UserStats fields
  totalUsers?: number;
  newUsers?: number;
  activeUsers?: number;
  usersByRole?: {
    EV_OWNER: number;
    BUYER: number;
    CVA: number;
    ADMIN: number;
  };

  // TransactionStats fields
  totalTransactions?: number;
  completedTransactions?: number;
  pendingTransactions?: number;
  failedTransactions?: number;
  totalVolume?: number;
  averageTransactionValue?: number;

  // RevenueStats fields
  totalRevenue?: number;
  platformFees?: number;
  netRevenue?: number;
  transactionCount?: number;
  averageRevenuePerTransaction?: number;

  // CarbonStats fields
  totalCreditsIssued?: number;
  totalCreditsTraded?: number;
  totalCO2Reduced?: number;
  averageCreditPrice?: number;
  topSellers?: Array<{
    userId: string;
    credits: number;
  }>;

  // Error field
  error?: string;
}

export interface GenerateReportRequest {
  type: ReportType;
  period: ReportPeriod;
  startDate?: string;
  endDate?: string;
}

export interface GetReportsRequest {
  page?: number;
  limit?: number;
  type?: ReportType;
  period?: ReportPeriod;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ReportListResponse {
  success: boolean;
  message: string;
  data: PlatformReport[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface ReportResponse {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: PlatformReport;
}

export interface DeleteReportResponse {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
}

export interface CleanupReportsResponse {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: {
    deletedCount: number;
  };
}

export interface ReportFilters {
  type?: ReportType;
  period?: ReportPeriod;
  startDate?: string;
  endDate?: string;
}

export interface ReportFormData {
  type: ReportType;
  period: ReportPeriod;
  startDate: string;
  endDate: string;
}

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  [ReportType.USER_STATS]: 'User Statistics',
  [ReportType.TRANSACTION_STATS]: 'Transaction Statistics',
  [ReportType.REVENUE_STATS]: 'Revenue Statistics',
  [ReportType.CARBON_STATS]: 'Carbon Statistics',
};

export const REPORT_PERIOD_LABELS: Record<ReportPeriod, string> = {
  [ReportPeriod.DAILY]: 'Daily',
  [ReportPeriod.WEEKLY]: 'Weekly',
  [ReportPeriod.MONTHLY]: 'Monthly',
  [ReportPeriod.QUARTERLY]: 'Quarterly',
};


export const getReportTypeLabel = (type: ReportType): string => {
  return REPORT_TYPE_LABELS[type] || type;
};

export const getReportPeriodLabel = (period: ReportPeriod): string => {
  return REPORT_PERIOD_LABELS[period] || period;
};

export const getReportTypeOptions = () => {
  return Object.values(ReportType).map((type) => ({
    value: type,
    label: REPORT_TYPE_LABELS[type],
  }));
};

export const getReportPeriodOptions = () => {
  return Object.values(ReportPeriod).map((period) => ({
    value: period,
    label: REPORT_PERIOD_LABELS[period],
  }));
};
