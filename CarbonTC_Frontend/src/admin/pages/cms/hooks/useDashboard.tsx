import { useCallback, useEffect, useState } from "react";
import { dashboardApi, type SystemOverview } from "../../../services/dashboard.service";

export interface UseDashboardReturn {
  overview: SystemOverview | null;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

export const useDashboard = (): UseDashboardReturn => {
  const [overview, setOverview] = useState<SystemOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardApi.getOverview();
      setOverview(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch overview data');
      console.log('Error fetching overview:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return {
    overview,
    loading,
    error,
    refreshData: fetchOverview,
  }
}
