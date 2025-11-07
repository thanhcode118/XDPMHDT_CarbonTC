import { Box, Typography } from '@mui/material';

function Profile() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Profile
      </Typography>
      <Typography variant="body2" color="text.secondary">
        View and edit your profile information
      </Typography>
    </Box>
  );
}

export default Profile;
