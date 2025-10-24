// src/context/AuthContext.jsx

import { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize authentication on mount
  useEffect(() => {
    console.log('=== 🚀 AuthContext MOUNTED ===');
    
    const initializeAuth = () => {
      console.log('🔍 [Step 1] Starting authentication initialization...');
      
      try {
        // Get data from localStorage
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        const userStr = localStorage.getItem('user');
        
        console.log('🔍 [Step 2] LocalStorage Check:');
        console.log('   - accessToken:', accessToken ? `✅ EXISTS (${accessToken.substring(0, 30)}...)` : '❌ MISSING');
        console.log('   - refreshToken:', refreshToken ? `✅ EXISTS (${refreshToken.substring(0, 30)}...)` : '❌ MISSING');
        console.log('   - user:', userStr ? '✅ EXISTS' : '❌ MISSING');

        if (accessToken && userStr) {
          try {
            const storedUser = JSON.parse(userStr);
            console.log('👤 [Step 3] User parsed successfully:');
            console.log('   - ID:', storedUser.id);
            console.log('   - Email:', storedUser.email);
            console.log('   - Full Name:', storedUser.fullName);
            console.log('   - Role:', storedUser.roleName);
            
            setUser(storedUser);
            console.log('✅ [Step 4] User set in state successfully');
          } catch (parseError) {
            console.error('❌ [Step 3] Failed to parse user data:', parseError);
            console.log('🧹 Clearing invalid localStorage data...');
            localStorage.clear();
          }
        } else {
          console.log('❌ [Step 3] No valid authentication data found');
          console.log('   → User needs to login');
        }
      } catch (error) {
        console.error('❌ [Step 3] Error during initialization:', error);
        console.log('🧹 Clearing localStorage due to error...');
        localStorage.clear();
      } finally {
        console.log('✅ [Step 5] Setting loading to false');
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Log state changes for debugging
  useEffect(() => {
    console.log('📊 AuthContext State Updated:');
    console.log('   - user:', user ? `${user.email} (${user.roleName})` : 'null');
    console.log('   - loading:', loading);
    console.log('   - isAuthenticated:', !!user && !!localStorage.getItem('accessToken'));
  }, [user, loading]);

  // Register function
  const register = async (userData) => {
    console.log('🔐 [Register] Starting registration...');
    console.log('   - Email:', userData.email);
    
    try {
      const response = await authService.register(userData);
      
      if (response.success) {
        console.log('✅ [Register] Registration successful');
        console.log('   - User:', response.data.user.email);
        setUser(response.data.user);
      }
      
      return response;
    } catch (error) {
      console.error('❌ [Register] Registration failed:', error);
      throw error;
    }
  };

  // Login function
  const login = async (credentials) => {
    console.log('🔐 [Login] Starting login...');
    console.log('   - Email:', credentials.email);
    
    try {
      const response = await authService.login(credentials);
      
      if (response.success) {
        console.log('✅ [Login] Login successful');
        console.log('   - User:', response.data.user.email);
        console.log('   - Role:', response.data.user.roleName);
        console.log('   - Tokens saved to localStorage');
        setUser(response.data.user);
      }
      
      return response;
    } catch (error) {
      console.error('❌ [Login] Login failed:', error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    console.log('🚪 [Logout] Starting logout...');
    
    try {
      await authService.logout();
      console.log('✅ [Logout] API call successful');
    } catch (error) {
      console.error('❌ [Logout] API call failed:', error);
    } finally {
      console.log('🧹 [Logout] Clearing user state and localStorage');
      setUser(null);
      localStorage.clear();
      console.log('✅ [Logout] Logout complete');
    }
  };

  // Logout all devices function
  const logoutAll = async () => {
    console.log('🚪 [Logout All] Starting logout from all devices...');
    
    try {
      await authService.logoutAll();
      console.log('✅ [Logout All] API call successful');
    } catch (error) {
      console.error('❌ [Logout All] API call failed:', error);
    } finally {
      console.log('🧹 [Logout All] Clearing user state and localStorage');
      setUser(null);
      localStorage.clear();
      console.log('✅ [Logout All] Logout complete');
    }
  };

  // Context value
  const value = {
    user,
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