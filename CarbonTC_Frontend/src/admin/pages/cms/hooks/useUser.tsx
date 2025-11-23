import { useCallback, useEffect, useState } from 'react';

import type {
  PaginatedUsersResponse,
  User,
  UserDetail,
  UserFilters,
  UserStatistics,
} from '../../../types/user.types';
import { userService } from '../../../services/user.service';
import { useUIStore } from '../../../store';

export const useUser = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [pendingVerifiers, setPendingVerifiers] = useState<User[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStatistics, setIsLoadingStatistics] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const [filters, setFilters] = useState<UserFilters>({});

  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const { showNotification } = useUIStore();

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response: PaginatedUsersResponse = await userService.getAllUsers(
        currentPage + 1,
        pageSize,
        filters,
      );

      setUsers(response.data);
      setTotalCount(response.pagination?.total ?? 0);
    } catch (error) {
      console.error('Error fetching users:', error);
      showNotification('Failed to load users', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, filters, showNotification]);

  const fetchStatistics = useCallback(async () => {
    try {
      setIsLoadingStatistics(true);
      const stats = await userService.getUserStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      showNotification('Failed to load statistics', 'error');
    } finally {
      setIsLoadingStatistics(false);
    }
  }, [showNotification]);

  const fetchUserDetail = useCallback(
    async (userId: string) => {
      try {
        setIsLoadingDetail(true);
        const user = await userService.getUserById(userId);
        setSelectedUser(user);
        setDetailDialogOpen(true);
      } catch (error) {
        console.error('Error fetching user detail:', error);
        showNotification('Failed to load user details', 'error');
      } finally {
        setIsLoadingDetail(false);
      }
    },
    [showNotification],
  );

  const fetchPendingVerifiers = useCallback(async () => {
    try {
      // const verifiers = await userService.getPendingVerifiers();
      // setPendingVerifiers(verifiers);
      setPendingVerifiers([]);
      console.warn('⚠️ Pending verifiers endpoint not available yet');
    } catch (error) {
      console.error('Error fetching pending verifiers:', error);
    }
  }, []);

  const handleDeleteUser = async (userId: string) => {
    try {
      await userService.deleteUser(userId);
      showNotification('User deleted successfully', 'success');
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchUsers();
      fetchStatistics();
    } catch (error) {
      console.error('Error deleting user:', error);
      showNotification('Failed to delete user', 'error');
    }
  };

  const handleApproveVerifier = async (userId: string) => {
    try {
      await userService.approveVerifier(userId);
      showNotification('Verifier approved successfully', 'success');
      fetchUsers();
      fetchStatistics();
      fetchPendingVerifiers();
    } catch (error) {
      console.error('Error approving verifier:', error);
      showNotification('Failed to approve verifier', 'error');
    }
  };

  const handleRejectVerifier = async (userId: string) => {
    try {
      await userService.rejectVerifier(userId);
      showNotification('Verifier rejected successfully', 'success');
      fetchUsers();
      fetchStatistics();
      fetchPendingVerifiers();
    } catch (error) {
      console.error('Error rejecting verifier:', error);
      showNotification('Failed to reject verifier', 'error');
    }
  };

  const handlePageChange = (page: number, newPageSize: number) => {
    setCurrentPage(page);
    if (newPageSize !== pageSize) {
      setPageSize(newPageSize);
      setCurrentPage(0);
    }
  };

  const handleFilterChange = (newFilters: UserFilters) => {
    setFilters(newFilters);
    setCurrentPage(0);
  };

  const openDeleteDialog = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const closeDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedUser(null);
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchStatistics();
    fetchPendingVerifiers();
  }, [fetchStatistics, fetchPendingVerifiers]);

  return {
    users,
    statistics,
    selectedUser,
    pendingVerifiers,

    isLoading,
    isLoadingStatistics,
    isLoadingDetail,

    currentPage,
    pageSize,
    totalCount,

    filters,

    detailDialogOpen,
    deleteDialogOpen,
    userToDelete,

    fetchUsers,
    fetchStatistics,
    fetchUserDetail,
    fetchPendingVerifiers,
    handleDeleteUser,
    handleApproveVerifier,
    handleRejectVerifier,
    handlePageChange,
    handleFilterChange,
    openDeleteDialog,
    closeDeleteDialog,
    closeDetailDialog,
  };
};
