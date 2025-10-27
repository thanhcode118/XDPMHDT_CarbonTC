// src/services/userService.js

import axiosInstance from '../api/axios';

const userService = {
  // Get current user profile
  getProfile: async () => {
    try {
      const response = await axiosInstance.get('/users/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get profile' };
    }
  },

  // Update profile
  updateProfile: async (data) => {
    try {
      const response = await axiosInstance.put('/users/profile', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update profile' };
    }
  },

  // Change password
  changePassword: async (data) => {
    try {
      const response = await axiosInstance.post('/users/change-password', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to change password' };
    }
  },

  // Delete account
  deleteAccount: async () => {
    try {
      const response = await axiosInstance.delete('/users/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete account' };
    }
  },

  // ===== ADMIN ENDPOINTS =====

  // Get all users (Admin)
  getAllUsers: async (pageNumber = 1, pageSize = 10, searchTerm = '') => {
    try {
      const response = await axiosInstance.get('/users', {
        params: { pageNumber, pageSize, searchTerm }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get users' };
    }
  },

  // Get user by ID (Admin)
  getUserById: async (userId) => {
    try {
      const response = await axiosInstance.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get user' };
    }
  },

  // Delete user (Admin)
  deleteUser: async (userId) => {
    try {
      const response = await axiosInstance.delete(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete user' };
    }
  },
};

export default userService;