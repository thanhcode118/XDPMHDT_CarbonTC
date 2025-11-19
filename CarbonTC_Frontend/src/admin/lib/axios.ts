import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

import { config } from '../config/env';
import { useAuthStore } from '../store';

// ============================================
// Axios Instance for Admin Service (Port 5005)
// ============================================

const axiosInstance = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// ============================================
// REQUEST INTERCEPTOR
// ============================================
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    const user = useAuthStore.getState().user;

    // Log request details in development
    if (import.meta.env.DEV) {
      console.group('📤 [Axios Request]');
      // console.log('URL:', config.baseURL + config.url);
      console.log('Method:', config.method?.toUpperCase());
      console.log('Has Token:', !!token);
      console.log('User Role:', user?.role);
      console.groupEnd();
    }

    // Attach Authorization header
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('❌ [Axios Request Error]:', error);
    return Promise.reject(error);
  },
);

// ============================================
// RESPONSE INTERCEPTOR
// ============================================
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.group('📥 [Axios Response]');
      console.log('URL:', response.config.url);
      console.log('Status:', response.status);
      console.log('Data:', response.data);
      console.groupEnd();
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Log error details
    console.group('❌ [Axios Response Error]');
    console.log('URL:', error.config?.url);
    console.log('Status:', error.response?.status);
    console.log('Message:', error.message);
    console.log('Response Data:', error.response?.data);
    console.groupEnd();

    // 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401) {
      console.warn('⚠️ [Axios] 401 Unauthorized - Logging out...');

      // Clear auth state
      useAuthStore.getState().logout();

      // Redirect to login
      setTimeout(() => {
        window.location.href = config.loginUrl;
      }, 1000);

      return Promise.reject(error);
    }

    // 403 Forbidden - No permission
    if (error.response?.status === 403) {
      console.error('🚫 [Axios] 403 Forbidden - Access Denied');
      // You might want to show a toast notification here
    }

    // 500 Internal Server Error
    if (error.response?.status === 500) {
      console.error('💥 [Axios] 500 Internal Server Error:', error.response.data);
    }

    // Network Error - Service might be down
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.error('🔌 [Axios] Network Error - Is Admin Service (port 5005) running?');
      console.error('   Expected URL:', config.apiBaseUrl);
    }

    return Promise.reject(error);
  },
);

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Create axios instance for specific service
 * Useful when you need to call other services directly (not through Admin Service)
 */
export const createServiceAxios = (serviceUrl: string) => {
  return axios.create({
    baseURL: serviceUrl,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  });
};

// Export instances for different services (if needed)
export const authServiceAxios = createServiceAxios(config.authServiceUrl);
export const carbonServiceAxios = createServiceAxios(config.carbonServiceUrl);
export const marketplaceServiceAxios = createServiceAxios(config.marketplaceServiceUrl);
export const walletServiceAxios = createServiceAxios(config.walletServiceUrl);

export default axiosInstance;
