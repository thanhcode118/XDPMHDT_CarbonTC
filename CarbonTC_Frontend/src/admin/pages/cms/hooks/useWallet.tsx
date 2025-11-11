import { useState, useEffect, useCallback } from 'react';
import { walletApi, type WithdrawRequest } from '../../../services/wallet.service';

export type WithdrawStatus = 'All' | 'Pending' | 'Approved' | 'Rejected';

export interface UseWalletReturn {
  requests: WithdrawRequest[];
  filteredRequests: WithdrawRequest[];
  loading: boolean;
  error: string | null;
  selectedStatus: WithdrawStatus;
  searchTerm: string;
  dateRange: { start: string | null; end: string | null };

  setSelectedStatus: (status: WithdrawStatus) => void;
  setSearchTerm: (term: string) => void;
  setDateRange: (range: { start: string | null; end: string | null }) => void;

  handleApprove: (requestId: string) => Promise<void>;
  handleReject: (requestId: string) => Promise<void>;
  refreshData: () => Promise<void>;

  stats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    totalPendingAmount: number;
  };
}

export const useWallet = (): UseWalletReturn => {
  const [requests, setRequests] = useState<WithdrawRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedStatus, setSelectedStatus] = useState<WithdrawStatus>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({
    start: null,
    end: null,
  });

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await walletApi.getPendingRequests();
      setRequests(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch withdraw requests');
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const filteredRequests = requests.filter((req) => {
    if (selectedStatus !== 'All' && req.status !== selectedStatus) {
      return false;
    }

    // Filter by search term (userId or bank account)
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      const matchesUserId = req.userId?.toLowerCase().includes(lowerSearch);
      const matchesBankAccount = req.bankAccountNumber?.toLowerCase().includes(lowerSearch);
      if (!matchesUserId && !matchesBankAccount) {
        return false;
      }
    }

    // Filter by date range
    if (dateRange.start || dateRange.end) {
      const requestDate = new Date(req.requestedAt);
      if (dateRange.start && requestDate < new Date(dateRange.start)) {
        return false;
      }
      if (dateRange.end && requestDate > new Date(dateRange.end)) {
        return false;
      }
    }

    return true;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'Pending').length,
    approved: requests.filter((r) => r.status === 'Approved').length,
    rejected: requests.filter((r) => r.status === 'Rejected').length,
    totalPendingAmount: requests
      .filter((r) => r.status === 'Pending')
      .reduce((sum, r) => sum + r.amount, 0),
  };

  const handleApprove = async (requestId: string) => {
    try {
      setLoading(true);
      await walletApi.approveRequest(requestId);
      await fetchRequests();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve request');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      setLoading(true);
      await walletApi.rejectRequest(requestId);
      await fetchRequests();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject request');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    requests,
    filteredRequests,
    loading,
    error,
    selectedStatus,
    searchTerm,
    dateRange,
    setSelectedStatus,
    setSearchTerm,
    setDateRange,
    handleApprove,
    handleReject,
    refreshData: fetchRequests,
    stats,
  };
};
