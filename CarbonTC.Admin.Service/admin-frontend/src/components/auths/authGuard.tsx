import { Box, CircularProgress, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuthStore } from '../../store/auth.store';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, checkAuth, setLoading, isLoading } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const verifyAuth = async () => {
      setLoading(true);

      try {
        const isAuth = checkAuth();

        if (!isAuth) {
          setIsChecking(false);
          setLoading(false);
          return;
        }

        setIsChecking(false);
        setLoading(false);
      } catch (error) {
        console.error('Auth verification error:', error);
        setIsChecking(false);
        setLoading(false);
      }
    };
    verifyAuth();
  }, [checkAuth, setLoading]);

  if (isLoading || isChecking) {
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

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export const withAuthGuard = (Component: React.ComponentType) => {
  const WrappedComponent = (props: any) => (
    <AuthGuard>
      <Component {...props} />
    </AuthGuard>
  );

  WrappedComponent.displayName = `withAuthGuard(${Component.displayName || Component.name})`;
  return WrappedComponent;
};
