import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../../store';
import { adminActionService } from '../../../services/adminaction.service';
import type {
  AdminAction,
  AdminActionFilters,
  AdminActionStatistics,
  AdminActivitySummary,
} from '../../../types/adminaction.types';

export const useAdminAction = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [actions, setActions] = useState<AdminAction[]>([]);
  const [statistics, setStatistics] = useState<AdminActionStatistics | null>(
    null,
  );
  const [activitySummary, setActivitySummary] =
    useState<AdminActivitySummary | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Fetch actions for current admin
  const fetchMyActions = useCallback(
    async (page: number = 0, limit: number = 10) => {
      if (!user?.id) return;

      setLoading(true);
      try {
        const response = await adminActionService.getByAdminId(
          user.id,
          page,
          limit,
        );
        setActions(response.data);
        setTotalCount(response.pagination.total);
        setCurrentPage(page);
        setPageSize(limit);
      } catch (error) {
        console.error('Error fetching admin actions:', error);
        setActions([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    },
    [user?.id],
  );

  // Fetch statistics for current admin
  const fetchStatistics = useCallback(async () => {
    if (!user?.id) return;

    setStatsLoading(true);
    try {
      const stats = await adminActionService.getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setStatistics(null);
    } finally {
      setStatsLoading(false);
    }
  }, [user?.id]);

  // Fetch activity summary for current admin
  const fetchActivitySummary = useCallback(async () => {
    if (!user?.id) return;

    try {
      const summary = await adminActionService.getActivitySummary(user.id);
      setActivitySummary(summary);
    } catch (error) {
      console.error('Error fetching activity summary:', error);
      setActivitySummary(null);
    }
  }, [user?.id]);

  // Fetch actions with filters
  const fetchActionsWithFilters = useCallback(
    async (
      filters: AdminActionFilters,
      page: number = 0,
      limit: number = 10,
    ) => {
      setLoading(true);
      try {
        const response = await adminActionService.getAll(filters, page, limit);
        setActions(response.data);
        setTotalCount(response.pagination.total);
        setCurrentPage(page);
        setPageSize(limit);
      } catch (error) {
        console.error('Error fetching actions with filters:', error);
        setActions([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Get action detail by ID
  const getActionDetail = useCallback(async (actionId: string) => {
    try {
      const detail = await adminActionService.getById(actionId);
      return detail;
    } catch (error) {
      console.error('Error fetching action detail:', error);
      return null;
    }
  }, []);

  // Export audit log
  const exportAuditLog = useCallback(
    async (filters?: AdminActionFilters) => {
      try {
        const blob = await adminActionService.exportAuditLog(filters);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        return { success: true, message: 'Audit log exported successfully' };
      } catch (error) {
        console.error('Error exporting audit log:', error);
        return { success: false, message: 'Failed to export audit log' };
      }
    },
    [],
  );

  // Handle page change
  const handlePageChange = useCallback(
    (page: number, size: number) => {
      fetchMyActions(page, size);
    },
    [fetchMyActions],
  );

  // Initial fetch
  useEffect(() => {
    if (user?.id) {
      fetchMyActions(0, 10);
      fetchStatistics();
      fetchActivitySummary();
    }
  }, [user?.id, fetchMyActions, fetchStatistics, fetchActivitySummary]);

  return {
    // Data
    actions,
    statistics,
    activitySummary,
    totalCount,
    currentPage,
    pageSize,

    // Loading states
    loading,
    statsLoading,

    // Methods
    fetchMyActions,
    fetchStatistics,
    fetchActivitySummary,
    fetchActionsWithFilters,
    getActionDetail,
    exportAuditLog,
    handlePageChange,

    // Refetch
    refetch: () => {
      fetchMyActions(currentPage, pageSize);
      fetchStatistics();
      fetchActivitySummary();
    },
  };
};

export default useAdminAction;
