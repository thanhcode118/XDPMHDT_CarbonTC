// src/context/AuthContext.jsx

import { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import { useTokenRefresh } from '../hooks/useTokenRefresh';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auto refresh token
  useTokenRefresh();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      
      if (response.success) {
        setUser(response.data.user);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      
      if (response.success) {
        setUser(response.data.user);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
    }
  };

  const logoutAll = async () => {
    try {
      await authService.logoutAll();
      setUser(null);
    } catch (error) {
      console.error('Logout all error:', error);
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    logoutAll,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};