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
  // const [isAuthenticated, setIsAuthenticated] = useState(false);
  // const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const verify = () => {
      console.log('🔐 [PrivateRoute] Checking auth...');
      console.log('🔐 [PrivateRoute] isAuthenticated:', isAuthenticated);
      console.log('🔐 [PrivateRoute] user:', user);

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

      // // ✅ CHECK LOCALSTORAGE
      // const accessToken = localStorage.getItem('accessToken');
      // const refreshToken = localStorage.getItem('refreshToken');
      // const userStr = localStorage.getItem('user');

      // console.log('');
      // console.log('📦 [Step 1] LocalStorage Check:');
      // console.log('   - accessToken:', accessToken ? '✅ EXISTS' : '❌ MISSING');
      // console.log('   - refreshToken:', refreshToken ? '✅ EXISTS' : '❌ MISSING');
      // console.log('   - user string:', userStr ? '✅ EXISTS' : '❌ MISSING');

      // if (accessToken) {
      //   console.log('   - Token preview:', accessToken.substring(0, 50) + '...');
      // }

      // if (!accessToken || !userStr) {
      //   console.log('');
      //   console.log('❌ [PrivateRoute] No auth data → Redirect to /login');
      //   console.log('═══════════════════════════════════════════════════');
      //   setIsAuthenticated(false);
      //   setIsChecking(false);
      //   return;
      // }

      // // Parse user
      // try {
      //   const parsedUser = JSON.parse(userStr);
      //   console.log('');
      //   console.log('👤 [Step 2] User Data:');
      //   console.log('   - Email:', parsedUser.email);
      //   console.log('   - Role:', parsedUser.role);
      //   console.log('   - Role Type:', typeof parsedUser.role);
      //   console.log('   - Full user:', parsedUser);

      //   setUser(parsedUser);
      //   setIsAuthenticated(true);

      //   // Check role
      //   const userRole = (parsedUser.role || '').toLowerCase();
      //   console.log('');
      //   console.log('🔍 [Step 3] Role Verification:');
      //   console.log('   - Original role:', parsedUser.role);
      //   console.log('   - Normalized role:', userRole);
      //   console.log('   - Is admin?', userRole === 'admin');

      //   if (userRole !== 'admin') {
      //     console.log('');
      //     console.log('❌ [PrivateRoute] NOT ADMIN → Redirect to /dashboard');
      //     console.log('═══════════════════════════════════════════════════');
      //   } else {
      //     console.log('');
      //     console.log('✅ [PrivateRoute] ADMIN ACCESS GRANTED!');
      //     console.log('═══════════════════════════════════════════════════');
      //   }
      // } catch (error) {
      //   console.log('');
      //   console.log('❌ [PrivateRoute] Failed to parse user:', error);
      //   console.log('   - User string:', userStr);
      //   console.log('═══════════════════════════════════════════════════');
      //   setIsAuthenticated(false);
      // }

      // setIsChecking(false);
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
