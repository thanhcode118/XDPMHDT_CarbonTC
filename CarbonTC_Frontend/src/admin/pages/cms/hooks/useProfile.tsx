import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../store';
import { profileApi, type ProfileData, type UpdateProfileData } from '../../../services/profile.service';

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const useProfile = () => {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Fetch profile data
  const fetchProfile = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const data = await profileApi.getProfile();
      const actualData = (data as any)?.data || data;

      const mappedData: ProfileData = {
        userId: actualData?.userId || actualData?._id || actualData?.id || 'N/A',
        fullName: actualData?.fullName || actualData?.full_name || actualData?.name || 'N/A',
        email: actualData?.email || user.email || 'N/A',
        role: actualData?.role || actualData?.roleType || user.role || 'N/A',
        phoneNumber: actualData?.phoneNumber || actualData?.phone_number || actualData?.phone,
        createdAt: actualData?.createdAt || actualData?.created_at || actualData?.createdDate || new Date().toISOString(),
        status: actualData?.status || actualData?.accountStatus || 'ACTIVE',
        avatarUrl: actualData?.avatarUrl || actualData?.avatar_url || actualData?.avatar,
      };
      setProfileData(mappedData);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Omit<UpdateProfileData, 'userId'>) => {
    if (!profileData?.userId) {
      return {
        success: false,
        message: 'User ID not found',
      };
    }
    setUpdateLoading(true);
    try {
      const result = await profileApi.updateProfile({
        userId: profileData.userId,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
      });

      if (result.success) {
        setProfileData((prev) => prev ? {
          ...prev,
          fullName: data.fullName,
          phoneNumber: data.phoneNumber,
        }: null);
      }

      if (user) {
        setUser({
          ...user,
          fullName: data.fullName,
        });
      }
      return result;
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

      const result = await profileApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      return result;
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/change-password', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     currentPassword: data.currentPassword,
      //     newPassword: data.newPassword,
      //   }),
      // });

      // Mock change password
      // await new Promise((resolve) => setTimeout(resolve, 1000));

      // return { success: true, message: 'Password changed successfully' };
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

export type { ProfileData, UpdateProfileData } from '../../../services/profile.service';
export type UpdateProfileInput = Omit<UpdateProfileData, 'userId'>;
