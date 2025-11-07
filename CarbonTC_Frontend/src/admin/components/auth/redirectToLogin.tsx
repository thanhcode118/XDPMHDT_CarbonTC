import { Box, CircularProgress, Typography } from '@mui/material';
import { useEffect } from 'react';

import { config } from '../../config/env';

export const RedirectToLogin: React.FC = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.assign(config.loginUrl);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

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
};
