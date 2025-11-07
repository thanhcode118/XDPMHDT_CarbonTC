import { Box, CircularProgress, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
// import { Navigate } from 'react-router-dom';

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
      console.log('PrivateRoute - isAuth:', isAuth);
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
  // const isAuthenticated = true;
  // const user = {
  //   id: '1',
  //   email: 'admin@test.com',
  //   fullName: 'Admin',
  //   role: 'ADMIN' as const,
  //   status: 'ACTIVE' as const,
  // };

  if (!isAuthenticated || !user) {
    setTimeout(() => {
      window.location.href = 'http://localhost:5173/login';
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
    // Redirect về Auth Service login page
    // window.location.href = 'http://localhost:3000/login'; // Auth Service URL
    // return <Navigate to="/" replace />;
  }

  if (user.role !== 'ADMIN') {
    setTimeout(() => {
      window.location.href = 'http://localhost:5173/dashboard';
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
        <Typography variant="h5" color="error" sx={{ mb: 1 }}>
          ❌ Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Admin role required to access this area
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Redirecting...
        </Typography>
      </Box>
    );
    // return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default PrivateRoute;
