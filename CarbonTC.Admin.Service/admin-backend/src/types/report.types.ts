import { ReportType, ReportPeriod } from "./enum";

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