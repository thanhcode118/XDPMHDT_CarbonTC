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
  requestId: string;
  userId: string;
  amount: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Paid';
  bankAccountNumber: string;
  bankName: string;
  requestedAt: string;
  processedAt?: string;
}

export interface SystemOverview {
  totalWallets: number;
  totalBalanceVND: number;
  totalCarbonBalance: number;
}

export const walletApi = {
  getPendingRequests: async (): Promise<WithdrawRequest[]> => {
    const response = await walletServiceAxios.get('/admin/pending');
    return response.data;
  },

  approveRequest: async (requestId: string): Promise<WithdrawRequest> => {
    const response = await walletServiceAxios.post(`/admin/${requestId}/approve`);
    return response.data;
  },

  rejectRequest: async (requestId: string): Promise<WithdrawRequest> => {
    const response = await walletServiceAxios.post(`/admin/${requestId}/reject`);
    return response.data;
  },

  getOverview: async (): Promise<SystemOverview> => {
    const response = await walletServiceAxios.get('/admin/overview');
    return response.data;
  },
};
