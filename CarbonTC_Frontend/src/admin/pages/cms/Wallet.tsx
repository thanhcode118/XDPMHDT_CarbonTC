import { Box, Typography } from '@mui/material';

function Wallet() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Wallet Management
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Manage e-wallets and transactions
      </Typography>
    </Box>
  );
}

export default Wallet;
