// src/hooks/useTokenRefresh.js

import { useEffect, useRef } from 'react';
import authService from '../services/authService';

export const useTokenRefresh = () => {
  const refreshIntervalRef = useRef(null);

  useEffect(() => {
    const setupTokenRefresh = () => {
      const accessToken = authService.getAccessToken();
      
      if (!accessToken) return;

      const decoded = authService.decodeToken(accessToken);
      if (!decoded || !decoded.exp) return;

      // Tính thời gian còn lại (refresh trước 5 phút)
      const expiresIn = decoded.exp * 1000 - Date.now();
      const refreshTime = Math.max(expiresIn - 5 * 60 * 1000, 0);

      if (refreshIntervalRef.current) {
        clearTimeout(refreshIntervalRef.current);
      }

      refreshIntervalRef.current = setTimeout(async () => {
        try {
          await authService.refreshToken();
          setupTokenRefresh(); // Setup lại sau khi refresh
        } catch (error) {
          console.error('Token refresh failed:', error);
          window.location.href = '/login';
        }
      }, refreshTime);
    };

    setupTokenRefresh();

    return () => {
      if (refreshIntervalRef.current) {
        clearTimeout(refreshIntervalRef.current);
      }
    };
  }, []);
};