import { Box, Typography } from '@mui/material';

function Dashboard() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Welcome to Admin Service - Carbon Credit Marketplace
      </Typography>
    </Box>
  );
}

export default Dashboard;
