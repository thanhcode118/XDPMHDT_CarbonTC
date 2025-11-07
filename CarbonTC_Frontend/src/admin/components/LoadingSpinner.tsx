import { Box, CircularProgress } from '@mui/material';

function LoadingSpinner() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}
    >
      <CircularProgress size={60} />
    </Box>
  );
}

export default LoadingSpinner;
