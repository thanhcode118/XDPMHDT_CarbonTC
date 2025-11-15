import { useCallback, useEffect, useState } from 'react';

import { disputeService } from '../../../services/dispute.service';
import type {
  CreateDisputeRequest,
  Dispute,
  DisputeDetail,
  DisputeFilters,
  DisputeStatistics,
  ResolveDisputeRequest,
  UpdateStatusRequest,
} from '../../../types/dispute.type';

export const useDispute = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [statistics, setStatistics] = useState<DisputeStatistics | null>(null);
  const [selectedDispute, setSelectedDispute] = useState<DisputeDetail | null>(
    null,
  );

  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [filters, setFilters] = useState<DisputeFilters>({});

  const [isLoading, setIsLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all disputes
  const fetchDisputes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await disputeService.getAll(
        filters,
        currentPage,
        pageSize,
      );

      setDisputes(response.data);
      setTotalCount(response.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch disputes');
      console.error('Error fetching disputes:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, currentPage, pageSize]);

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    try {
      setIsStatsLoading(true);
      const stats = await disputeService.getStatistics();
      setStatistics(stats);
    } catch (err) {
      console.error('Error fetching statistics:', err);
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  // Fetch dispute by ID
  const fetchDisputeById = useCallback(async (disputeId: string) => {
    try {
      setIsDetailLoading(true);
      setError(null);

      const dispute = await disputeService.getById(disputeId);
      setSelectedDispute(dispute);

      return dispute;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch dispute details',
      );
      console.error('Error fetching dispute details:', err);
      return null;
    } finally {
      setIsDetailLoading(false);
    }
  }, []);

  // Create dispute
  const createDispute = useCallback(
    async (data: CreateDisputeRequest) => {
      try {
        setError(null);
        const newDispute = await disputeService.create(data);
        await fetchDisputes();
        await fetchStatistics();
        return { success: true, data: newDispute };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to create dispute';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [fetchDisputes, fetchStatistics],
  );

  // Update status
  const updateStatus = useCallback(
    async (disputeId: string, data: UpdateStatusRequest) => {
      try {
        setError(null);
        const updatedDispute = await disputeService.updateStatus(
          disputeId,
          data,
        );

        // Update local state
        setDisputes((prev) =>
          prev.map((d) => (d.disputeId === disputeId ? updatedDispute : d)),
        );

        if (selectedDispute?.disputeId === disputeId) {
          setSelectedDispute((prev) =>
            prev ? { ...prev, ...updatedDispute } : null,
          );
        }

        return { success: true, data: updatedDispute };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update status';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [selectedDispute],
  );

  // Resolve dispute
  const resolveDispute = useCallback(
    async (disputeId: string, data: ResolveDisputeRequest) => {
      try {
        setError(null);
        const resolvedDispute = await disputeService.resolve(disputeId, data);

        await fetchDisputes();
        await fetchStatistics();

        if (selectedDispute?.disputeId === disputeId) {
          setSelectedDispute((prev) =>
            prev ? { ...prev, ...resolvedDispute } : null,
          );
        }

        return { success: true, data: resolvedDispute };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to resolve dispute';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [fetchDisputes, fetchStatistics, selectedDispute],
  );

  // Delete dispute
  const deleteDispute = useCallback(
    async (disputeId: string) => {
      try {
        setError(null);
        await disputeService.delete(disputeId);
        await fetchDisputes();
        await fetchStatistics();
        return { success: true };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to delete dispute';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [fetchDisputes, fetchStatistics],
  );

  // Update filters
  const updateFilters = useCallback((newFilters: DisputeFilters) => {
    setFilters(newFilters);
    setCurrentPage(0); // Reset to first page when filters change
  }, []);

  // Pagination handlers
  const handlePageChange = useCallback((page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  }, []);

  // Initial load
  useEffect(() => {
    void fetchDisputes();
  }, [fetchDisputes]);

  useEffect(() => {
    void fetchStatistics();
  }, [fetchStatistics]);

  return {
    // Data
    disputes,
    statistics,
    selectedDispute,
    totalCount,
    currentPage,
    pageSize,
    filters,

    // Loading states
    isLoading,
    isDetailLoading,
    isStatsLoading,
    error,

    // Actions
    fetchDisputes,
    fetchStatistics,
    fetchDisputeById,
    createDispute,
    updateStatus,
    resolveDispute,
    deleteDispute,
    updateFilters,
    handlePageChange,
    setSelectedDispute,
  };
};
