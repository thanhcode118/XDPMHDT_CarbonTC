import { Box, Typography, Alert, IconButton } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useDashboard } from './hooks/useDashboard';
import { DashboardStats } from './components/Dashboard';
import LoadingSpinner from '../../components/LoadingSpinner';

function Dashboard() {
  const { overview, loading, error, refreshData } = useDashboard();

  if (loading && !overview) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
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
        <IconButton
          onClick={refreshData}
          disabled={loading}
          color="primary"
          sx={{
            bgcolor: 'primary.light',
            '&:hover': { bgcolor: 'primary.main', color: 'white' },
          }}
        >
          <RefreshIcon />
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
