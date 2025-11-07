import { Box, Typography } from '@mui/material';
import React from 'react';

interface TableNoDataProps {
  message?: string;
}

export const TableNoData: React.FC<TableNoDataProps> = ({
  message = 'No data to display',
}) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      py: 4,
    }}
  >
    <Typography variant="h6" color="text.secondary">
      {message}
    </Typography>
  </Box>
);

export default TableNoData;
