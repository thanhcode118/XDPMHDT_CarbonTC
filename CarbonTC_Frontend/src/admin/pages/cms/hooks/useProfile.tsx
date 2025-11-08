import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../store';

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
  fullName: string;
  phoneNumber: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const useProfile = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Fetch profile data
  const fetchProfile = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/admin/profile/${user.id}`);
      // const data = await response.json();

      // Mock data for now
      const mockData: ProfileData = {
        userId: user.id,
        fullName: user.fullName || user.name || 'Admin User',
        email: user.email,
        role: user.role,
        phoneNumber: '+84901234567',
        createdAt: '2024-03-15T10:00:00Z',
        status: user.status || 'ACTIVE',
        avatarUrl: user.avatarUrl,
      };

      setProfileData(mockData);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update basic info
  const updateProfile = async (data: UpdateProfileData) => {
    setUpdateLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/admin/profile/${user?.id}`, {
      //   method: 'PUT',
      //   body: JSON.stringify(data),
      // });

      // Mock update
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setProfileData((prev) =>
        prev
          ? {
              ...prev,
              fullName: data.fullName,
              phoneNumber: data.phoneNumber,
            }
          : null
      );

      return { success: true, message: 'Profile updated successfully' };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, message: 'Failed to update profile' };
    } finally {
      setUpdateLoading(false);
    }
  };

  // Change password
  const changePassword = async (data: ChangePasswordData) => {
    setPasswordLoading(true);
    try {
      // Validate
      if (data.newPassword !== data.confirmPassword) {
        return { success: false, message: 'Passwords do not match' };
      }

      if (data.newPassword.length < 6) {
        return {
          success: false,
          message: 'Password must be at least 6 characters',
        };
      }

      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/change-password', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     currentPassword: data.currentPassword,
      //     newPassword: data.newPassword,
      //   }),
      // });

      // Mock change password
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return { success: true, message: 'Password changed successfully' };
    } catch (error) {
      console.error('Error changing password:', error);
      return { success: false, message: 'Failed to change password' };
    } finally {
      setPasswordLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  return {
    profileData,
    loading,
    updateLoading,
    passwordLoading,
    updateProfile,
    changePassword,
    refetch: fetchProfile,
  };
};
