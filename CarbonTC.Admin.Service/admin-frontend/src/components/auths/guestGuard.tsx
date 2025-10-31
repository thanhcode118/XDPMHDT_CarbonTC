/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, CircularProgress, Typography } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuthStore } from '../../store/auth.store';

interface GuestGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const GuestGuard: React.FC<GuestGuardProps> = ({
  children,
  redirectTo = '/dashboard',
}) => {
  const { isAuthenticated, checkAuth, setLoading, isLoading } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const verifyGuest = async () => {
      setLoading(true);

      try {
        checkAuth();

        setIsChecking(false);
        setLoading(false);
      } catch (error) {
        console.error('Guest verification error:', error);
        setIsChecking(false);
        setLoading(false);
      }
    };
    verifyGuest();
  }, [checkAuth, setLoading]);

  if (isChecking || isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
        }}
      >
        <CircularProgress size={40} sx={{ mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Checking authentication...
        </Typography>
      </Box>
    );
  }

  if (isAuthenticated) {
    const from = (location.state as any)?.from?.pathname || redirectTo;
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};

export const withGuestGuard = (
  Component: React.ComponentType,
  redirectTo?: string,
) => {
  const WrappedComponent = (props: any) => (
    <GuestGuard redirectTo={redirectTo}>
      <Component {...props} />
    </GuestGuard>
  );

  WrappedComponent.displayName = `withGuestGuard(${Component.displayName || Component.name})`;
  return WrappedComponent;
};
