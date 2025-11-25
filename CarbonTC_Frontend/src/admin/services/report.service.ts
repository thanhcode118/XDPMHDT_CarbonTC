
import axiosInstance from '../lib/axios';
import type {
  PlatformReport,
  GenerateReportRequest,
  GetReportsRequest,
  ReportListResponse,
  ReportResponse,
  DeleteReportResponse,
  CleanupReportsResponse,
} from '../types/report.types';

const REPORT_BASE_URL = '/admin/reports';

export const reportApi = {
  generateReport: async (
    data: GenerateReportRequest
  ): Promise<PlatformReport> => {
    const response = await axiosInstance.post<ReportResponse>(
      REPORT_BASE_URL,
      data
    );
    return response.data.data;
  },

  getReports: async (
    params: GetReportsRequest = {}
  ): Promise<ReportListResponse> => {
    const response = await axiosInstance.get<ReportListResponse>(
      REPORT_BASE_URL,
      { params }
    );
    return response.data;
  },

  getReportById: async (reportId: string): Promise<PlatformReport> => {
    const response = await axiosInstance.get<ReportResponse>(
      `${REPORT_BASE_URL}/${reportId}`
    );
    return response.data.data;
  },

  getLatestReportByType: async (type: string): Promise<PlatformReport | null> => {
    try {
      const response = await axiosInstance.get<ReportResponse>(
        `${REPORT_BASE_URL}/latest/${type}`
      );
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  deleteReport: async (reportId: string): Promise<void> => {
    await axiosInstance.delete<DeleteReportResponse>(
      `${REPORT_BASE_URL}/${reportId}`
    );
  },

  cleanupOldReports: async (days: number = 90): Promise<number> => {
    const response = await axiosInstance.delete<CleanupReportsResponse>(
      `${REPORT_BASE_URL}/cleanup`,
      {
        params: { days },
      }
    );
    return response.data.data.deletedCount;
  },
};

export default reportApi;
