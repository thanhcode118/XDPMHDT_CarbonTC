import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { ROUTES } from '../../common/constants';

function NotFound() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      <Typography variant="h1" sx={{ fontSize: '6rem', fontWeight: 'bold' }}>
        404
      </Typography>
      <Typography variant="h5" gutterBottom>
        Page Not Found
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        The page you are looking for does not exist.
      </Typography>
      <Button
        variant="contained"
        onClick={() => navigate(ROUTES.ADMIN.DASHBOARD)}
      >
        Back to Dashboard
      </Button>
    </Box>
  );
}

export default NotFound;
