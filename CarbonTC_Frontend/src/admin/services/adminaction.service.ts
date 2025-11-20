import axios from 'axios';
import { useAuthStore } from '../store';
import type {
  AdminAction,
  AdminActionDetail,
  AdminActionFilters,
  AdminActionStatistics,
  AdminActivitySummary,
  PaginatedResponse,
} from '../types/adminaction.types';

const API_BASE_URL =
  import.meta.env.VITE_ADMIN_API_URL || 'http://localhost:7000/api';
const BASE_PATH = '/admin/actions';

// Axios instance with auth
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Transform response helpers
const transformPaginatedResponse = <T>(
  backendResponse: any,
): PaginatedResponse<T> => {
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

export const adminActionService = {
  /**
   * Get all admin actions with filters and pagination
   */
  async getAll(
    filters: AdminActionFilters,
    page: number = 0,
    limit: number = 10,
  ): Promise<PaginatedResponse<AdminAction>> {
    const params = {
      ...filters,
      page: page + 1, // Backend uses 1-based pagination
      limit,
    };

    const response = await axiosInstance.get(BASE_PATH, { params });

    // Transform: Add `id` field for DataGrid compatibility
    const transformedData = response.data.data.map((action: any) => ({
      ...action,
      id: action.actionId,
    }));

    return transformPaginatedResponse<AdminAction>({
      ...response.data,
      data: transformedData,
    });
  },

  /**
   * Get action statistics
   */
  async getStatistics(filters?: {
    startDate?: string;
    endDate?: string;
  }): Promise<AdminActionStatistics> {
    const response = await axiosInstance.get(`${BASE_PATH}/statistics`, {
      params: filters,
    });
    return unwrapResponse<AdminActionStatistics>(response.data);
  },

  /**
   * Get recent actions
   */
  async getRecent(limit: number = 10): Promise<AdminAction[]> {
    const response = await axiosInstance.get(`${BASE_PATH}/recent`, {
      params: { limit },
    });
    const actions = unwrapResponse<AdminAction[]>(response.data);

    return actions.map((action) => ({
      ...action,
      id: action.actionId,
    })) as AdminAction[];
  },

  /**
   * Get actions by admin ID
   */
  async getByAdminId(
    adminId: string,
    page: number = 0,
    limit: number = 10,
  ): Promise<PaginatedResponse<AdminAction>> {
    const response = await axiosInstance.get(`${BASE_PATH}/admin/${adminId}`, {
      params: { page: page + 1, limit },
    });

    const transformedData = response.data.data.map((action: any) => ({
      ...action,
      id: action.actionId,
    }));

    return transformPaginatedResponse<AdminAction>({
      ...response.data,
      data: transformedData,
    });
  },

  /**
   * Get actions by action type
   */
  async getByType(
    actionType: string,
    page: number = 0,
    limit: number = 10,
  ): Promise<PaginatedResponse<AdminAction>> {
    const response = await axiosInstance.get(
      `${BASE_PATH}/type/${actionType}`,
      {
        params: { page: page + 1, limit },
      },
    );

    const transformedData = response.data.data.map((action: any) => ({
      ...action,
      id: action.actionId,
    }));

    return transformPaginatedResponse<AdminAction>({
      ...response.data,
      data: transformedData,
    });
  },

  /**
   * Get actions by target ID
   */
  async getByTargetId(targetId: string): Promise<AdminAction[]> {
    const response = await axiosInstance.get(
      `${BASE_PATH}/target/${targetId}`,
    );
    const actions = unwrapResponse<AdminAction[]>(response.data);

    return actions.map((action) => ({
      ...action,
      id: action.actionId,
    })) as AdminAction[];
  },

  /**
   * Get admin activity summary
   */
  async getActivitySummary(adminId: string): Promise<AdminActivitySummary> {
    const response = await axiosInstance.get(
      `${BASE_PATH}/activity/${adminId}`,
    );
    return unwrapResponse<AdminActivitySummary>(response.data);
  },

  /**
   * Get action by ID
   */
  async getById(actionId: string): Promise<AdminActionDetail> {
    const response = await axiosInstance.get(`${BASE_PATH}/${actionId}`);
    const data = unwrapResponse<AdminActionDetail>(response.data);

    return {
      ...data,
      id: data.actionId,
    } as AdminActionDetail;
  },

  /**
   * Export audit log
   */
  async exportAuditLog(filters?: AdminActionFilters): Promise<Blob> {
    const response = await axiosInstance.get(
      `${BASE_PATH}/export/audit-log`,
      {
        params: filters,
        responseType: 'blob',
      },
    );
    return response.data;
  },

  /**
   * Log an admin action (utility function)
   */
  async logAction(data: {
    actionType: string;
    targetId: string;
    description: string;
    actionDetails?: Record<string, unknown>;
  }): Promise<AdminAction> {
    const response = await axiosInstance.post(BASE_PATH, data);
    const action = unwrapResponse<AdminAction>(response.data);

    return {
      ...action,
      id: action.actionId,
    } as AdminAction;
  },
};

export default adminActionService;
