import axios from 'axios';

import type {
  CreateDisputeRequest,
  Dispute,
  DisputeDetail,
  DisputeFilters,
  DisputeStatistics,
  PaginatedResponse,
  ResolveDisputeRequest,
  UpdateStatusRequest,
} from '../types/dispute.type';

const API_BASE_URL = import.meta.env.VITE_ADMIN_API_URL || 'http://localhost:5005/api';
const BASE_PATH = '/admin/disputes';

// Axios instance with auth
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor
axiosInstance.interceptors.request.use((config) => {
  const authStorage = localStorage.getItem('admin-auth-storage');
  if (authStorage) {
    try {
      const parsed = JSON.parse(authStorage);
      const token = parsed?.state?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Failed to parse admin-auth-storage:', error);
    }
  }
  // const token = localStorage.getItem('adminToken');
  // if (token) {
  //   config.headers.Authorization = `Bearer ${token}`;
  // }
  return config;
});

export const disputeService = {
  // Get all disputes with filters and pagination
  async getAll(
    filters: DisputeFilters,
    page: number = 0,
    limit: number = 10,
  ): Promise<PaginatedResponse<Dispute>> {
    const params = {
      ...filters,
      page: page + 1,
      limit,
    };

    const response = await axiosInstance.get<PaginatedResponse<Dispute>>(
      BASE_PATH,
      { params },
    );
    return response.data;
  },

  // Get dispute statistics
  async getStatistics(): Promise<DisputeStatistics> {
    const response = await axiosInstance.get<DisputeStatistics>(
      `${BASE_PATH}/statistics`,
    );
    return response.data;
  },

  // Get dispute by ID
  async getById(disputeId: string): Promise<DisputeDetail> {
    const response = await axiosInstance.get<DisputeDetail>(
      `${BASE_PATH}/${disputeId}`,
    );
    return response.data;
  },

  // Get disputes by transaction ID
  async getByTransactionId(transactionId: string): Promise<Dispute[]> {
    const response = await axiosInstance.get<Dispute[]>(
      `${BASE_PATH}/transaction/${transactionId}`,
    );
    return response.data;
  },

  // Get disputes by user ID
  async getByUserId(userId: string): Promise<Dispute[]> {
    const response = await axiosInstance.get<Dispute[]>(
      `${BASE_PATH}/user/${userId}`,
    );
    return response.data;
  },

  // Create new dispute
  async create(data: CreateDisputeRequest): Promise<Dispute> {
    const response = await axiosInstance.post<Dispute>(BASE_PATH, data);
    return response.data;
  },

  // Update dispute status
  async updateStatus(
    disputeId: string,
    data: UpdateStatusRequest,
  ): Promise<Dispute> {
    const response = await axiosInstance.patch<Dispute>(
      `${BASE_PATH}/${disputeId}/status`,
      data,
    );
    return response.data;
  },

  // Resolve dispute
  async resolve(
    disputeId: string,
    data: ResolveDisputeRequest,
  ): Promise<Dispute> {
    const response = await axiosInstance.post<Dispute>(
      `${BASE_PATH}/${disputeId}/resolve`,
      data,
    );
    return response.data;
  },

  // Delete dispute
  async delete(disputeId: string): Promise<void> {
    await axiosInstance.delete(`${BASE_PATH}/${disputeId}`);
  },
};

export default disputeService;
