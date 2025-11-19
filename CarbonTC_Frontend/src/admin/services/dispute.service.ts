import axios from 'axios';

import {
  DisputeStatus,
  ResolutionType,
  type CreateDisputeRequest,
  type Dispute,
  type DisputeDetail,
  type DisputeFilters,
  type DisputeStatistics,
  type PaginatedResponse,
  type ResolveDisputeRequest,
  type UpdateStatusRequest,
} from '../types/dispute.type';

const API_BASE_URL = import.meta.env.VITE_ADMIN_API_URL || 'http://localhost:7000/api';
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
  return config;
});

const transformPaginatedResponse = <T>(backendResponse: any): PaginatedResponse<T> => {
  return {
    data: backendResponse.data || [],
    pagination: {
      total: backendResponse.pagination?.totalItems || 0,
      page: backendResponse.pagination?.currentPage || 1,
      limit: backendResponse.pagination?.itemsPerPage || 10,
      totalPages: backendResponse.pagination?.totalPages || 0,
    },
  };
};

const unwrapResponse = <T>(backendResponse: any): T => {
  return backendResponse.data;
};

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

    const response = await axiosInstance.get(BASE_PATH, { params });
    console.log('📦 Backend response:', response.data);

    // ✅ Transform: Add `id` field for DataGrid compatibility
    const transformedData = response.data.data.map((dispute: any) => ({
      ...dispute,
      id: dispute.disputeId,
    }));

    return transformPaginatedResponse<Dispute>({
      ...response.data,
      data: transformedData,
    });
  },

  // Get dispute statistics
  async getStatistics(filters?: {
    startDate?: string;
    endDate?: string;
  }): Promise<DisputeStatistics> {
    const response = await axiosInstance.get(`${BASE_PATH}/statistics`, {
      params: filters,
    });
    return unwrapResponse<DisputeStatistics>(response.data);
  },

  // Get dispute by ID
  async getById(disputeId: string): Promise<DisputeDetail> {
    const response = await axiosInstance.get(`${BASE_PATH}/${disputeId}`);
    const data = unwrapResponse<DisputeDetail>(response.data);

    return {
      ...data,
      id: data.disputeId,
    } as DisputeDetail;
  },

  // Get disputes by transaction ID
  async getByTransactionId(transactionId: string): Promise<Dispute[]> {
    const response = await axiosInstance.get(
      `${BASE_PATH}/transaction/${transactionId}`,
    );
    const disputes = unwrapResponse<Dispute[]>(response.data);

    // ✅ Add id field to each dispute
    return disputes.map((dispute) => ({
      ...dispute,
      id: dispute.disputeId,
    })) as Dispute[];
  },

  // Get disputes by user ID
  async getByUserId(userId: string): Promise<Dispute[]> {
    const response = await axiosInstance.get(`${BASE_PATH}/user/${userId}`);
    const disputes = unwrapResponse<Dispute[]>(response.data);

    return disputes.map((dispute) => ({
      ...dispute,
      id: dispute.disputeId,
    })) as Dispute[];
  },

  // Create new dispute
  async create(data: CreateDisputeRequest): Promise<Dispute> {
    const response = await axiosInstance.post(BASE_PATH, data);
    const dispute = unwrapResponse<Dispute>(response.data);

    return {
      ...dispute,
      id: dispute.disputeId,
    } as Dispute;
  },

  // Update dispute status
  async updateStatus(
    disputeId: string,
    data: UpdateStatusRequest,
  ): Promise<Dispute> {
    const response = await axiosInstance.patch(
      `${BASE_PATH}/${disputeId}/status`,
      data,
    );
    const dispute = unwrapResponse<Dispute>(response.data);

    // ✅ Add id field
    return {
      ...dispute,
      id: dispute.disputeId,
    } as Dispute;
  },

  // Resolve dispute
  async resolve(
    disputeId: string,
    data: ResolveDisputeRequest,
  ): Promise<Dispute> {
    const backendPayload = {
      status: data.resolution === ResolutionType.APPROVE
        ? DisputeStatus.RESOLVED
        : DisputeStatus.REJECTED,
      resolutionNotes: data.resolutionNotes,
    };

    const response = await axiosInstance.post(
      `${BASE_PATH}/${disputeId}/resolve`,
      backendPayload,
    );
    const dispute = unwrapResponse<Dispute>(response.data);

    return {
      ...dispute,
      id: dispute.disputeId,
    } as Dispute;
  },

  // Delete dispute
  async delete(disputeId: string): Promise<void> {
    await axiosInstance.delete(`${BASE_PATH}/${disputeId}`);
  },
};

export default disputeService;
