import { Box, Typography } from '@mui/material';

function ListingsAndOrders() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Listing & Orders Management
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Manage carbon credit listings and orders
      </Typography>
    </Box>
  );
}

export default ListingsAndOrders;
