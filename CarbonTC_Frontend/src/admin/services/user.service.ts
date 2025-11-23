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
 * Get paginated list of users with optional filters
 */
export const getAllUsers = async (
  page: number = 1,
  limit: number = 10,
  filters?: UserFilters,
): Promise<PaginatedUsersResponse> => {
  const params: Record<string, unknown> = {
    page,
    limit,
    ...filters,
  };

  const response: AxiosResponse<PaginatedUsersResponse> = await axiosInstance.get(
    '/api/Users',
    { params },
  );

  return response.data;
};

/**
 * Get user statistics
 */
export const getUserStatistics = async (): Promise<UserStatistics> => {
  const response: AxiosResponse<UserStatistics> = await axiosInstance.get(
    '/api/Users/statistics',
  );

  return response.data;
};

/**
 * Get user details by ID
 */
export const getUserById = async (userId: string): Promise<UserDetail> => {
  const response: AxiosResponse<UserDetail> = await axiosInstance.get(
    `/api/Users/${userId}`,
  );

  return response.data;
};

/**
 * Get pending CVA verifiers
 */
export const getPendingVerifiers = async (): Promise<User[]> => {
  const response: AxiosResponse<User[]> = await axiosInstance.get(
    '/api/Users/pending-verifiers',
  );

  return response.data;
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
