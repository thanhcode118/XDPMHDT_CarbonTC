import { useState } from 'react';
import { reportApi } from '../../../services/report.service';

export interface UseReportReturn {
  loading: boolean;
  error: string | null;
  generateFeesReport: (startDate: string, endDate: string) => Promise<number | null>;
}

export const useReport = (): UseReportReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateFeesReport = async (
    startDate: string,
    endDate: string
  ): Promise<number | null> => {
    try {
      setLoading(true);
      setError(null);
      const fees = await reportApi.getFees(startDate, endDate);
      return fees;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate report');
      console.error('Error generating report:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    generateFeesReport,
  };
};
