// src/services/authService.js

import axiosInstance from '../api/axios';

const authService = {
  // Đăng ký
  register: async (userData) => {
    try {
      const response = await axiosInstance.post('/auth/register', userData);

      if (response.data.success) {
        const { accessToken, refreshToken, user } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Registration failed' };
    }
  },

  // Đăng nhập
  login: async (credentials) => {
    try {
      const response = await axiosInstance.post('/auth/login', credentials);

      if (response.data.success) {
        const { accessToken, refreshToken, user } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  // Refresh Token
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axiosInstance.post('/auth/refresh-token', {
        refreshToken
      });

      if (response.data.success) {
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        return response.data;
      }
    } catch (error) {
      localStorage.clear();
      throw error;
    }
  },

  // Đăng xuất
  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        await axiosInstance.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  // Đăng xuất khỏi tất cả thiết bị
  logoutAll: async () => {
    try {
      await axiosInstance.post('/auth/logout-all');
    } catch (error) {
      console.error('Logout all error:', error);
    } finally {
      localStorage.clear();
    }
  },

  // Lấy user hiện tại
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Kiểm tra đã đăng nhập
  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  },

  // Lấy access token
  getAccessToken: () => {
    return localStorage.getItem('accessToken');
  },

  // Lấy refresh token
  getRefreshToken: () => {
    return localStorage.getItem('refreshToken');
  },

  // Decode JWT token để lấy thông tin
  decodeToken: (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  },

  // Kiểm tra token có hết hạn không
  isTokenExpired: (token) => {
    const decoded = authService.decodeToken(token);
    if (!decoded || !decoded.exp) return true;

    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  },
};

  // ✅ Cập nhật thông tin người dùng



export default authService;
