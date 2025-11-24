import type { AxiosResponse } from 'axios';

import axiosInstance from '../lib/axios';
import type {
  PaginatedUsersResponse,
  User,
  UserDetail,
  UserFilters,
  UserStatistics,
} from '../types/user.types';


/**
 * Map backend role names to frontend role enum
 */
const mapRoleName = (roleName: string): string => {
  const roleMap: Record<string, string> = {
    'EVOwner': 'EV_OWNER',
    'CreditBuyer': 'BUYER',
    'CVA': 'CVA',
    'Admin': 'ADMIN',
  };
  return roleMap[roleName] || roleName;
};

/**
 * Transform backend user to frontend format
 */
const transformUser = (backendUser: any): User => ({
  id: backendUser.id,
  userId: backendUser.id, // Backend uses single 'id' field
  fullName: backendUser.fullName || null,
  email: backendUser.email,
  phoneNumber: backendUser.phoneNumber || null,
  role: mapRoleName(backendUser.roleName) as any,
  status: backendUser.status === 'Active' ? 'ACTIVE' : 'INACTIVE',
  createdAt: backendUser.createdAt,
  avatarUrl: backendUser.avatarUrl || null,
});

/**
 * Calculate statistics from users list (fallback when backend endpoint not available)
 */
const calculateStatisticsFromUsers = (users: User[]): UserStatistics => {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const stats: UserStatistics = {
    totalUsers: users.length,
    activeUsers: 0,
    inactiveUsers: 0,
    byRole: {
      evOwner: 0,
      buyer: 0,
      cva: 0,
      admin: 0,
    },
    pendingVerifiers: 0,
    newUsersThisWeek: 0,
    newUsersThisMonth: 0,
  };

  users.forEach(user => {
    if (user.status === 'ACTIVE') {
      stats.activeUsers++;
    } else {
      stats.inactiveUsers++;
    }

    switch (user.role) {
      case 'EV_OWNER':
        stats.byRole.evOwner++;
        break;
      case 'BUYER':
        stats.byRole.buyer++;
        break;
      case 'CVA':
        stats.byRole.cva++;
        if (user.status === 'INACTIVE') {
          stats.pendingVerifiers++;
        }
        break;
      case 'ADMIN':
        stats.byRole.admin++;
        break;
    }

    // Count new users
    const createdAt = new Date(user.createdAt);
    if (createdAt >= oneWeekAgo) {
      stats.newUsersThisWeek++;
    }
    if (createdAt >= oneMonthAgo) {
      stats.newUsersThisMonth++;
    }
  });

  return stats;
};

/**
 * Get paginated list of users with optional filters
 */
export const getAllUsers = async (
  page: number = 1,
  limit: number = 10,
  filters?: UserFilters,
): Promise<PaginatedUsersResponse> => {
  const params: Record<string, unknown> = {
    pageNumber: page,     // Backend expects pageNumber
    pageSize: limit,      // Backend expects pageSize
    ...filters,
  };

  const response: AxiosResponse<any> = await axiosInstance.get(
    '/api/Users',
    { params },
  );

  // Transform backend response to frontend format
  const backendData = response.data;

  // Backend wraps data in success/data structure
  const actualData = backendData.data || backendData;

  // Transform users array
  const transformedUsers = (actualData.items || []).map(transformUser);

  // Return in frontend expected format
  return {
    data: transformedUsers,
    pagination: {
      page: actualData.pageNumber || page,
      pageSize: actualData.pageSize || limit,
      total: actualData.totalCount || 0,
      totalPages: actualData.totalPages || 0,
    },
  };
};

/**
 * Get ALL users (no pagination) for statistics calculation
 */
const getAllUsersForStats = async (): Promise<User[]> => {
  try {
    // Get first page to know total count
    const firstPage = await getAllUsers(1, 100); // Get up to 100 users
    const totalCount = firstPage.pagination.total;

    if (totalCount <= 100) {
      // All users already loaded
      return firstPage.data;
    }

    // If more than 100 users, fetch remaining pages
    const allUsers = [...firstPage.data];
    const totalPages = firstPage.pagination.totalPages;

    // Fetch remaining pages in parallel
    const remainingPages = Array.from(
      { length: totalPages - 1 },
      (_, i) => i + 2
    );

    const remainingResponses = await Promise.all(
      remainingPages.map(page => getAllUsers(page, 100))
    );

    remainingResponses.forEach(response => {
      allUsers.push(...response.data);
    });

    return allUsers;
  } catch (error) {
    console.error('Error fetching all users for stats:', error);
    return [];
  }
};

/**
 * Get user statistics
 */
export const getUserStatistics = async (): Promise<UserStatistics> => {
  try {
    const response: AxiosResponse<any> = await axiosInstance.get(
      '/api/Users/statistics',
    );

    // Backend may wrap in success/data structure
    const backendData = response.data.data || response.data;

    // If backend doesn't have statistics endpoint yet, return mock data
    if (!backendData || typeof backendData !== 'object') {
      console.warn('⚠️ Statistics endpoint returned invalid data, calculating from users...');
      const allUsers = await getAllUsersForStats();
      return calculateStatisticsFromUsers(allUsers);
    }

    // Transform to frontend format
    return {
      totalUsers: backendData.totalUsers || 0,
      activeUsers: backendData.activeUsers || 0,
      inactiveUsers: backendData.inactiveUsers || 0,
      byRole: {
        evOwner: backendData.byRole?.evOwner || 0,
        buyer: backendData.byRole?.buyer || 0,
        cva: backendData.byRole?.cva || 0,
        admin: backendData.byRole?.admin || 0,
      },
      pendingVerifiers: backendData.pendingVerifiers || 0,
      newUsersThisWeek: backendData.newUsersThisWeek || 0,
      newUsersThisMonth: backendData.newUsersThisMonth || 0,
    };
  } catch (error: any) {
    // If endpoint doesn't exist yet (404 or 500), calculate from users
    if (error.response?.status === 404 || error.response?.status === 500) {
      console.warn('⚠️ Statistics endpoint not available, calculating from users...');
      const allUsers = await getAllUsersForStats();
      return calculateStatisticsFromUsers(allUsers);
    }
    throw error;
  }
};

/**
 * Get user details by ID
 */
export const getUserById = async (userId: string): Promise<UserDetail> => {
  const response: AxiosResponse<any> = await axiosInstance.get(
    `/api/Users/${userId}`,
  );

  // Backend may wrap in success/data structure
  const backendUser = response.data.data || response.data;

  // Transform to frontend format
  return {
    id: backendUser.id,
    userId: backendUser.id,
    fullName: backendUser.fullName || null,
    email: backendUser.email,
    phoneNumber: backendUser.phoneNumber || null,
    role: mapRoleName(backendUser.roleName) as any,
    status: backendUser.status === 'Active' ? 'ACTIVE' : 'INACTIVE',
    createdAt: backendUser.createdAt,
    updatedAt: backendUser.updatedAt || undefined,
    avatarUrl: backendUser.avatarUrl || null,
    address: backendUser.address || null,
    companyName: backendUser.companyName || null,
    taxCode: backendUser.taxCode || null,
  };
};

/**
 * Get pending CVA verifiers
 */
export const getPendingVerifiers = async (): Promise<User[]> => {
  try {
    const response: AxiosResponse<any> = await axiosInstance.get(
      '/api/Users/pending-verifiers',
    );

    // Backend may wrap in success/data structure
    const backendData = response.data.data || response.data;
    const users = Array.isArray(backendData) ? backendData : (backendData.items || []);

    // Transform to frontend format
    return users.map(transformUser);
  } catch (error: any) {
    // If endpoint doesn't exist yet (404), calculate from all users
    if (error.response?.status === 404) {
      console.warn('⚠️ Pending verifiers endpoint not available, calculating from users...');
      try {
        const allUsers = await getAllUsersForStats();
        return allUsers.filter(user => user.role === 'CVA' && user.status === 'INACTIVE');
      } catch (e) {
        console.error('Error calculating pending verifiers:', e);
        return [];
      }
    }
    throw error;
  }
};

/**
 * Delete user by ID
 */
export const deleteUser = async (userId: string): Promise<void> => {
  await axiosInstance.delete(`/api/Users/${userId}`);
};

/**
 * Approve CVA verifier
 */
export const approveVerifier = async (userId: string): Promise<void> => {
  await axiosInstance.post(`/api/Users/${userId}/approve`);
};

/**
 * Reject CVA verifier
 */
export const rejectVerifier = async (userId: string): Promise<void> => {
  await axiosInstance.post(`/api/Users/${userId}/reject`);
};

// Export all services
export const userService = {
  getAllUsers,
  getUserStatistics,
  getUserById,
  getPendingVerifiers,
  deleteUser,
  approveVerifier,
  rejectVerifier,
};

export default userService;
