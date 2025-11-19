import axios from "axios";
import { useAuthStore } from "../store";

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

export interface SystemOverview {
  totalEWallets: number;
  totalCarbonWallets: number;
  totalMoneyBalance: number;
  totalCarbonBalance: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[];
  timestamp: string;
}
export const dashboardApi = {
  getOverview: async (): Promise<SystemOverview> => {
      const response = await walletServiceAxios.get<ApiResponse<SystemOverview>>(
        '/admin-dashboard/overview'
      );
      return response.data.data;
    },

  getFees: async (startDate: string, endDate: string): Promise<number> => {
    const response = await walletServiceAxios.get<ApiResponse<number>>(
      '/admin-dashboard/fees',
      {
        params: { startDate, endDate }
      }
    );
    return response.data.data;
  },
}
