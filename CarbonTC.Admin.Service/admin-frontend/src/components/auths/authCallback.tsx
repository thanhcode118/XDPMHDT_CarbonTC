import { Box, CircularProgress, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ROUTES } from '../../common/constants';
import { useAuthStore } from '../../store';
import type { User } from '../../types';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading',
  );
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const refreshToken = urlParams.get('refreshToken');
        const userParam = urlParams.get('user');

        if (!token || !refreshToken || !userParam) {
          setErrorMessage('Missing authentication data. Please login again.');
          setStatus('error');
          setTimeout(() => {
            window.location.href = 'http://localhost:5173/login';
          }, 2000);
          return;
        }
        let user: User;
        try {
          const decodedUser = decodeURIComponent(userParam as string);
          user = JSON.parse(decodedUser);
        } catch (parseError) {
          console.error(
            '❌ [AuthCallback] Error parsing user data:',
            parseError,
          );
          setErrorMessage('Invalid user data. Please login again.');
          setStatus('error');
          setTimeout(() => {
            window.location.href = 'http://localhost:5173/login';
          }, 2000);
          return;
        }

        if (user.role !== 'ADMIN') {
          console.error('❌ [AuthCallback] User is not Admin:', user.role);
          setErrorMessage('Access denied. Admin role required.');
          setStatus('error');

          setTimeout(() => {
            window.location.href = 'http://localhost:5173/login';
          }, 2000);
          return;
        }

        login(token, refreshToken, {
          id: user.id || user.userId || '',
          email: user.email,
          name: user.fullName || user.name || null,
          role: 'ADMIN',
          avatarUrl: user.avatarUrl,
          status: user.status || 'ACTIVE',
        });
        setStatus('success');
        setTimeout(() => {
          window.history.replaceState({}, '', '/');
          navigate(ROUTES.ADMIN.DASHBOARD, { replace: true });
        }, 500);
      } catch (error) {
        console.error('❌ [AuthCallback] Error during authentication:', error);
        setErrorMessage(
          'An unexpected error occurred. Please try again later.',
        );
        setStatus('error');
        setTimeout(() => {
          window.location.href = 'http://localhost:5173/login';
        }, 2000);
      }
    };
    handleCallback();
  }, [login, navigate]);

  if (status === 'error') {
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
          ❌ Authentication Failed
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {errorMessage}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Redirecting to login...
        </Typography>
      </Box>
    );
  }

  if (status === 'success') {
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
        <Typography variant="h5" color="success.main" sx={{ mb: 1 }}>
          ✅ Authentication Successful
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Redirecting to dashboard...
        </Typography>
      </Box>
    );
  }

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
      <CircularProgress size={50} />
      <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
        🔐 Processing authentication...
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Please wait while we verify your credentials
      </Typography>
    </Box>
  );
};
