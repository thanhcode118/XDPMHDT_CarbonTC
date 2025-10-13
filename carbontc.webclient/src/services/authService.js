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
};

export default authService;