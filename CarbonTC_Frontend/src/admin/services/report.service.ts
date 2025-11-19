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

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[];
  timestamp: string;
}

export const reportApi = {
  // TODO: Add report APIs when backend is ready
  // Example structure:

  getFees: async (startDate: string, endDate: string): Promise<number> => {
    const response = await walletServiceAxios.get<ApiResponse<number>>(
      '/admin-dashboard/fees',
      {
        params: { startDate, endDate },
      }
    );
    return response.data.data;
  },

  // Future APIs:
  // getTransactionReport: async (params) => { ... }
  // getRevenueReport: async (params) => { ... }
  // exportReport: async (params) => { ... }
};
