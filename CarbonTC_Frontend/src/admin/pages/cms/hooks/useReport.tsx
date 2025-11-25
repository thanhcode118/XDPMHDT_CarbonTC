import { useState, useCallback } from 'react';
import { reportApi } from '../../../services/report.service';
import type {
  PlatformReport,
  GenerateReportRequest,
  GetReportsRequest,
  ReportListResponse,
} from '../../../types/report.types';

export interface UseReportReturn {
  loading: boolean;
  error: string | null;
  reports: PlatformReport[];
  selectedReport: PlatformReport | null;
  pagination: ReportListResponse['pagination'] | null;

  generateReport: (data: GenerateReportRequest) => Promise<PlatformReport | null>;
  fetchReports: (params?: GetReportsRequest) => Promise<void>;
  fetchReportById: (reportId: string) => Promise<PlatformReport | null>;
  deleteReport: (reportId: string) => Promise<boolean>;
  cleanupOldReports: (days?: number) => Promise<number | null>;
  setSelectedReport: (report: PlatformReport | null) => void;
  clearError: () => void;
}

export const useReport = (): UseReportReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<PlatformReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<PlatformReport | null>(null);
  const [pagination, setPagination] = useState<ReportListResponse['pagination'] | null>(null);

  const generateReport = useCallback(
    async (data: GenerateReportRequest): Promise<PlatformReport | null> => {
      try {
        setLoading(true);
        setError(null);
        const report = await reportApi.generateReport(data);

        setReports((prev) => [report, ...prev]);

        return report;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || 'Failed to generate report';
        setError(errorMessage);
        console.error('Error generating report:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchReports = useCallback(
    async (params: GetReportsRequest = {}): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        const response = await reportApi.getReports(params);
        setReports(response.data);
        setPagination(response.pagination);
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || 'Failed to fetch reports';
        setError(errorMessage);
        console.error('Error fetching reports:', err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchReportById = useCallback(
    async (reportId: string): Promise<PlatformReport | null> => {
      try {
        setLoading(true);
        setError(null);
        const report = await reportApi.getReportById(reportId);
        setSelectedReport(report);
        return report;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || 'Failed to fetch report';
        setError(errorMessage);
        console.error('Error fetching report:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteReport = useCallback(
    async (reportId: string): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);
        await reportApi.deleteReport(reportId);

        setReports((prev) => prev.filter((r) => r.reportId !== reportId));

        if (selectedReport?.reportId === reportId) {
          setSelectedReport(null);
        }

        return true;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || 'Failed to delete report';
        setError(errorMessage);
        console.error('Error deleting report:', err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [selectedReport]
  );

  const cleanupOldReports = useCallback(
    async (days: number = 90): Promise<number | null> => {
      try {
        setLoading(true);
        setError(null);
        const deletedCount = await reportApi.cleanupOldReports(days);

        await fetchReports();

        return deletedCount;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || 'Failed to cleanup reports';
        setError(errorMessage);
        console.error('Error cleaning up reports:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchReports]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    loading,
    error,
    reports,
    selectedReport,
    pagination,

    // Actions
    generateReport,
    fetchReports,
    fetchReportById,
    deleteReport,
    cleanupOldReports,
    setSelectedReport,
    clearError,
  };
};

export default useReport;
