import { Box, Typography } from '@mui/material';

function Disputes() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dispute Management
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Handle buyer-seller disputes
      </Typography>
    </Box>
  );
}

export default Disputes;
