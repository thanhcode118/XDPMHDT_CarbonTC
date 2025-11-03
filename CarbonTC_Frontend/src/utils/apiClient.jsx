import axios from 'axios';

// Base URL: use env if provided; otherwise in dev use relative path to leverage Vite proxy
const baseURL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_WALLET_API_BASE_URL) ??
  ((typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV) ? '/' : 'http://localhost:5004');

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false
});

// Attach bearer token if available in localStorage under 'token'
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = token.startsWith('Bearer ')
      ? token
      : `Bearer ${token}`;
  }
  return config;
});

export default apiClient;


