// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize authentication on mount
  useEffect(() => {
    console.log('=== 🚀 AuthContext MOUNTED ===');

    const initializeAuth = () => {
      console.log('🔍 [Step 1] Starting authentication initialization...');

      try {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        const userStr = localStorage.getItem('user');

        console.log('🔍 [Step 2] LocalStorage Check:');
        console.log('   - accessToken:', accessToken ? '✅ EXISTS' : '❌ MISSING');
        console.log('   - refreshToken:', refreshToken ? '✅ EXISTS' : '❌ MISSING');
        console.log('   - user:', userStr ? '✅ EXISTS' : '❌ MISSING');

        if (accessToken && userStr) {
          try {
            const storedUser = JSON.parse(userStr);
            console.log('👤 [Step 3] User parsed successfully:', storedUser);
            setUser(storedUser);
            console.log('✅ [Step 4] User set in state successfully');
          } catch (parseError) {
            console.error('❌ [Step 3] Failed to parse user data:', parseError);
            localStorage.clear();
          }
        } else {
          console.log('❌ [Step 3] No valid authentication data found → User must log in');
        }
      } catch (error) {
        console.error('❌ [Step 3] Error during initialization:', error);
        localStorage.clear();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Log when AuthContext changes
  useEffect(() => {
    console.log('📊 AuthContext State Updated:');
    console.log('   - user:', user ? user.email : 'null');
    console.log('   - loading:', loading);
    console.log('   - isAuthenticated:', !!user && !!localStorage.getItem('accessToken'));
  }, [user, loading]);

  // ✅ Hàm cập nhật user sau khi update profile
  const updateUser = (newUserData) => {
    console.log('🔄 [AuthContext] Updating user in context:', newUserData);
    setUser(newUserData);
    localStorage.setItem('user', JSON.stringify(newUserData));
  };

  // Register
  const register = async (userData) => {
    console.log('🔐 [Register] Starting registration...');
    try {
      const response = await authService.register(userData);
      if (response.success) {
        console.log('✅ [Register] Successful');
        setUser(response.data.user);
      }
      return response;
    } catch (error) {
      console.error('❌ [Register] Failed:', error);
      throw error;
    }
  };

  // Login
  const login = async (credentials) => {
    console.log('🔐 [Login] Starting login...');
    try {
      const response = await authService.login(credentials);
      if (response.success) {
        const userData = response.data.user;
        console.log('✅ [Login] Successful:', userData);
        setUser(userData);

        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        const payload = accessToken ? authService.decodeToken(accessToken) : null;
        const role = payload?.role;

        const normalizedRole = (role || userData.role || '').toLowerCase();
        if (normalizedRole === 'admin') {
          setTimeout(() => {
            navigate('/admin/dashboard');
          }, 100);

          return {
            ...response,
            isAdmin: true,
            handled: true
          }
        }
        console.log('👤 [Login] Regular user → Return to Login.jsx');
      }
      return response;
    } catch (error) {
      console.error('❌ [Login] Failed:', error);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    console.log('🚪 [Logout] Logging out...');
    try {
      await authService.logout();
    } catch (error) {
      console.error('❌ [Logout] API failed:', error);
    } finally {
      setUser(null);
      localStorage.clear();
    }
  };

  // Logout all
  const logoutAll = async () => {
    console.log('🚪 [Logout All]');
    try {
      await authService.logoutAll();
    } catch (error) {
      console.error('❌ [Logout All] API failed:', error);
    } finally {
      setUser(null);
      localStorage.clear();
    }
  };

  const value = {
    user,
    setUser,
    updateUser, // ✅ thêm dòng này
    loading,
    register,
    login,
    logout,
    logoutAll,
    isAuthenticated: !!user && !!localStorage.getItem('accessToken'),
  };

  console.log('📦 [AuthContext] Provider value:', {
    hasUser: !!user,
    userEmail: user?.email || 'null',
    loading,
    isAuthenticated: value.isAuthenticated,
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
