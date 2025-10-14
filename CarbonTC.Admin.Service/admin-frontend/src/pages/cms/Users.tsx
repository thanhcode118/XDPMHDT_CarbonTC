import { Box, Typography } from '@mui/material';

function Users() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        User Management
      </Typography>
      <Typography variant="body2" color="text.secondary">
        List of all users in the system
      </Typography>
    </Box>
  );
}

export default Users;
