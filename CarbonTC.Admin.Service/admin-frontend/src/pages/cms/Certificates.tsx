import { Box, Typography } from '@mui/material';

function Certificates() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Certificate Management
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Manage carbon credit certificates
      </Typography>
    </Box>
  );
}

export default Certificates;
