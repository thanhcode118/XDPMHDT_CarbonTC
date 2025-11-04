import { Box, CircularProgress, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store';

interface PrivateRouteProps {
  children: React.ReactNode;
}

function PrivateRoute({ children }: PrivateRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const verify = () => {
      const isAuth = checkAuth();
      console.log('🔐 [PrivateRoute] checkAuth result:', isAuth);

      if (!isAuth) {
        const token = localStorage.getItem('admin-auth-storage');
        if (token) {
          try {
            const parsed = JSON.parse(token);
            console.log('Parsed storage:', parsed);
          } catch (error) {
            console.error('Failed to parse storage:', error)
          }
        }
      }
      setIsChecking(false);
    };
    verify();
  }, [isAuthenticated, user, checkAuth]);

  if (isChecking) {
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
          Verifying access...
        </Typography>
      </Box>
    );
  }

  // No auth → Redirect to login
  if (!isAuthenticated || !user) {
    setTimeout(() => {
      window.location.href = '/login';
    }, 1000);

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
          gap: 2,
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
          🔐 Authentication Required
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Redirecting to login page...
        </Typography>
      </Box>
    );
  }

  // Check admin role
  const userRole = (user.role || '').toLowerCase();
  if (userRole !== 'admin') {
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 3000);

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
          gap: 2,
        }}
      >
        <Typography variant="h5" color="error" sx={{ mb: 1 }}>
          ❌ Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Admin role required to access this area
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Redirecting to user dashboard...
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
}

export default PrivateRoute;
