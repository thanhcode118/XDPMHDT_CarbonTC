import axios from "axios";
import { useAuthStore } from "../store";

const authServiceAxios = axios.create({
  baseURL: 'http://localhost:5001/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials: true,
});

authServiceAxios.interceptors.request.use(
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

export interface ProfileData {
  userId: string;
  fullName: string;
  email: string;
  role: string;
  phoneNumber?: string;
  createdAt: string;
  status: 'ACTIVE' | 'INACTIVE';
  avatarUrl?: string;
}

export interface UpdateProfileData {
  userId: string;
  fullName: string;
  phoneNumber?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  // confirmPassword: string;
}

export const profileApi = {
  getProfile: async (): Promise<ProfileData> => {
    const response = await authServiceAxios.get('/Users/profile');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileData): Promise<{
    success: boolean;
    message: string
  }> => {
    try {
      await authServiceAxios.put('/Users/profile', {
        userId: data.userId,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
      });
      return {
        success: true,
        message: 'Profile updated successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update profile'
      }
    }
  },

  changePassword: async (data: ChangePasswordData): Promise<{
    success: boolean;
    message: string
  }> => {
    try {
      await authServiceAxios.post('/Users/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      return {
        success: true,
        message: 'Password changed successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to change password',
      };
    }
  },
};
