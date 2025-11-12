import { Box, Typography, Alert, IconButton } from '@mui/material';
// import RefreshIcon from '@mui/icons-material/Refresh';
import CachedRoundedIcon from '@mui/icons-material/CachedRounded';
import { useDashboard } from './hooks/useDashboard';
import { DashboardStats } from './components/Dashboard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { gray } from '../../../common/color';

function Dashboard() {
  const { overview, loading, error, refreshData } = useDashboard();

  if (loading && !overview) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ p: 0 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome to Admin Service - Carbon Credit Marketplace
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <IconButton
          onClick={refreshData}
          disabled={loading}
          sx={{
            color: gray[900],
            border: 2,
            height: 40,
            width: 55,
            // transition: 'background-color 0.3s',
            '&:hover': {
              bgcolor: gray[100],
              border: gray[100]
            },
          }}
        >
          <CachedRoundedIcon />
        </IconButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {overview && <DashboardStats overview={overview} />}

      {/* TODO: Add more dashboard sections */}
      {/* - Recent withdraw requests table */}
      {/* - Platform fees chart (using dashboardApi.getFees) */}
      {/* - Recent activities timeline */}
    </Box>
  );
}

export default Dashboard;
