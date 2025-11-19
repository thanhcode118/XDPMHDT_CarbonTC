// import { ApiResponse } from './../../../../CarbonTC.Admin.Service/admin-backend/src/utils/apiResponse';
import axios from 'axios';
import { useAuthStore } from '../store';

const walletServiceAxios = axios.create({
  baseURL: 'http://localhost:5004/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

walletServiceAxios.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface WithdrawRequest {
  requestId: number;
  userId: string;
  walletId: number;
  amount: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Paid';
  bankAccountNumber: string;
  bankName: string;
  requestedAt: string;
  processedAt?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[];
  timestamp: string;
}

export const walletApi = {
  getPendingRequests: async (): Promise<WithdrawRequest[]> => {
    const response = await walletServiceAxios.get<ApiResponse<WithdrawRequest[]>>(
      '/admin-dashboard/pending'
    );
    return response.data.data;
  },

  approveRequest: async (requestId: number): Promise<WithdrawRequest> => {
    const response = await walletServiceAxios.post<ApiResponse<WithdrawRequest>>(
      `/admin-dashboard/${requestId}/approve`
    );
    return response.data.data;
  },

  rejectRequest: async (requestId: number): Promise<WithdrawRequest> => {
    const response = await walletServiceAxios.post<ApiResponse<WithdrawRequest>>(
      `/admin-dashboard/${requestId}/reject`
    );
    return response.data.data;
  },
};
