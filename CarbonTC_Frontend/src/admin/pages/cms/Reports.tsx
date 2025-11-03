import { Box, Typography } from '@mui/material';

function Report() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Report Generator
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Generate and export reports
      </Typography>
    </Box>
  );
}

export default Report;
