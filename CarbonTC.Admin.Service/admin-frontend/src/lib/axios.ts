import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

import { config } from '../config/env';
import { useAuthStore } from '../store';

const axiosInstance = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();

      // Redirect to login (hoặc Auth Service)
      // Option 1: Redirect trong app
      window.location.href = '/';

      // Option 2: Redirect sang Auth Service
      // window.location.href = 'http://localhost:3000/login';
    }

    if (error.response?.status === 403) {
      console.error(
        'Forbidden: You do not have permission to access this resource',
      );
    }

    if (error.response?.status === 500) {
      console.error('Server error:', error.response.data);
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
