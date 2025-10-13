import axios from 'axios';

const API_BASE_URL = 'http://localhost:5183/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor - Thêm token vào header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - Xử lý lỗi chung
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Xử lý 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        // TODO: Implement refresh token logic
        // const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        // localStorage.setItem('accessToken', response.data.accessToken);
        // return axiosInstance(originalRequest);
        
        // Tạm thời logout
        localStorage.clear();
        window.location.href = '/login';
      } catch (err) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;