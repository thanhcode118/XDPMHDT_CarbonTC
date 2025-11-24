import type { AxiosResponse } from 'axios';

import axiosInstance from '../lib/axios';
import type {
  PaginatedUsersResponse,
  User,
  UserDetail,
  UserFilters,
  UserStatistics,
} from '../types/user.types';


const mapRoleName = (roleName: string): string => {
  const roleMap: Record<string, string> = {
    'EVOwner': 'EV_OWNER',
    'CreditBuyer': 'BUYER',
    'CVA': 'CVA',
    'Admin': 'ADMIN',
  };
  return roleMap[roleName] || roleName;
};

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

export const getAllUsers = async (
  page: number = 1,
  limit: number = 10,
  filters?: UserFilters,
): Promise<PaginatedUsersResponse> => {
  const params: Record<string, unknown> = {
    pageNumber: page,
    pageSize: limit,
    ...filters,
  };

  const response: AxiosResponse<any> = await axiosInstance.get(
    '/Users',
    { params },
  );

  const backendData = response.data;
  const actualData = backendData.data || backendData;
  const transformedUsers = (actualData.items || []).map(transformUser);

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

const getAllUsersForStats = async (): Promise<User[]> => {
  try {
    const firstPage = await getAllUsers(1, 100);
    const totalCount = firstPage.pagination.total;

    if (totalCount <= 100) {
      return firstPage.data;
    }

    const allUsers = [...firstPage.data];
    const totalPages = firstPage.pagination.totalPages;

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

export const getUserStatistics = async (): Promise<UserStatistics> => {
  try {
    const response: AxiosResponse<any> = await axiosInstance.get(
      '/Users/statistics',
    );

    console.log('📊 Statistics response:', response.data);
    const backendData = response.data.data || response.data;
    const hasValidData = backendData &&
      typeof backendData === 'object' &&
      (backendData.totalUsers !== undefined ||
       backendData.TotalUsers !== undefined);

    if (!hasValidData) {
      console.warn('⚠️ Statistics endpoint returned invalid/empty data, calculating from users...');
      const allUsers = await getAllUsersForStats();
      return calculateStatisticsFromUsers(allUsers);
    }

    const totalUsers = backendData.totalUsers ?? backendData.TotalUsers ?? 0;
    const activeUsers = backendData.activeUsers ?? backendData.ActiveUsers ?? 0;
    const inactiveUsers = backendData.inactiveUsers ?? backendData.InactiveUsers ?? 0;
    const byRole = backendData.byRole || backendData.ByRole || {};
    const pendingVerifiers = backendData.pendingVerifiers ?? backendData.PendingVerifiers ?? 0;
    const newUsersThisWeek = backendData.newUsersThisWeek ?? backendData.NewUsersThisWeek ?? 0;
    const newUsersThisMonth = backendData.newUsersThisMonth ?? backendData.NewUsersThisMonth ?? 0;

    if (totalUsers === 0 && activeUsers === 0 && inactiveUsers === 0) {
      console.warn('⚠️ All statistics are 0, calculating from users...');
      const allUsers = await getAllUsersForStats();
      return calculateStatisticsFromUsers(allUsers);
    }

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      byRole: {
        evOwner: byRole.evOwner ?? byRole.EvOwner ?? byRole.EVOwner ?? 0,
        buyer: byRole.buyer ?? byRole.Buyer ?? byRole.CreditBuyer ?? 0,
        cva: byRole.cva ?? byRole.CVA ?? byRole.Cva ?? 0,
        admin: byRole.admin ?? byRole.Admin ?? 0,
      },
      pendingVerifiers,
      newUsersThisWeek,
      newUsersThisMonth,
    };
  } catch (error: any) {
    console.error('❌ Error fetching statistics:', error.response?.data || error.message);

    console.warn('⚠️ Falling back to calculating statistics from users...');
    const allUsers = await getAllUsersForStats();
    return calculateStatisticsFromUsers(allUsers);
  }
};

export const getUserById = async (userId: string): Promise<UserDetail> => {
  const response: AxiosResponse<any> = await axiosInstance.get(
    `/Users/${userId}`,
  );

  const backendUser = response.data.data || response.data;

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

export const getPendingVerifiers = async (): Promise<User[]> => {
  try {
    const response: AxiosResponse<any> = await axiosInstance.get(
      '/Users/pending-verifiers',
    );

    const backendData = response.data.data || response.data;
    const users = Array.isArray(backendData) ? backendData : (backendData.items || []);

    return users.map(transformUser);
  } catch (error: any) {
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

export const deleteUser = async (userId: string): Promise<void> => {
  await axiosInstance.delete(`/api/Users/${userId}`);
};

export const approveVerifier = async (userId: string): Promise<void> => {
  await axiosInstance.post(`/api/Users/${userId}/approve`);
};

export const rejectVerifier = async (userId: string): Promise<void> => {
  await axiosInstance.post(`/api/Users/${userId}/reject`);
};

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
