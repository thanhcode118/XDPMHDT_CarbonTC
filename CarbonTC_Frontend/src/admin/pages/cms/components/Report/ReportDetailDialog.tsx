// ============================================
// ReportDetailDialog Component
// ============================================

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  Chip,
  Grid,
  Paper,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  Assessment as ReportIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import {
  getReportTypeLabel,
  getReportPeriodLabel,
  type PlatformReport,
  ReportType,
} from '../../../../types/report.types';
import { formatDateTime } from '../../../../utils/dateTime';
import { formatNumber, formatCurrencyUSD } from '../../../../utils';

interface ReportDetailDialogProps {
  open: boolean;
  onClose: () => void;
  report: PlatformReport | null;
}

export const ReportDetailDialog = ({
  open,
  onClose,
  report,
}: ReportDetailDialogProps) => {
  if (!report) return null;

  const data = report.dataJson;

  const renderUserStats = () => (
    <Grid container spacing={2}>
      <Grid size={{ xs: 6, md: 3 }}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h4" color="primary">
            {formatNumber(data.totalUsers)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Users
          </Typography>
        </Paper>
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h4" color="success.main">
            {formatNumber(data.newUsers)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            New Users
          </Typography>
        </Paper>
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h4" color="info.main">
            {formatNumber(data.activeUsers)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Active Users
          </Typography>
        </Paper>
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h4">
            {formatNumber(data.totalUsers || 0)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            All Roles
          </Typography>
        </Paper>
      </Grid>
      {data.usersByRole && (
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" gutterBottom>
            Users by Role
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {Object.entries(data.usersByRole).map(([role, count]) => (
              <Chip
                key={role}
                label={`${role}: ${count}`}
                variant="outlined"
                size="small"
              />
            ))}
          </Box>
        </Grid>
      )}
    </Grid>
  );

  const renderTransactionStats = () => (
    <Grid container spacing={2}>
      <Grid size={{ xs: 6, md: 4 }}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h4" color="primary">
            {formatNumber(data.totalTransactions)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Transactions
          </Typography>
        </Paper>
      </Grid>
      <Grid size={{ xs: 6, md: 4 }}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h4" color="success.main">
            {formatNumber(data.completedTransactions)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Completed
          </Typography>
        </Paper>
      </Grid>
      <Grid size={{ xs: 6, md: 4 }}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h4" color="warning.main">
            {formatNumber(data.pendingTransactions)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Pending
          </Typography>
        </Paper>
      </Grid>
      <Grid size={{ xs: 6, md: 4 }}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h4" color="error.main">
            {formatNumber(data.failedTransactions)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Failed
          </Typography>
        </Paper>
      </Grid>
      <Grid size={{ xs: 6, md: 4 }}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h4">{formatNumber(data.totalVolume)}</Typography>
          <Typography variant="body2" color="text.secondary">
            Total Volume
          </Typography>
        </Paper>
      </Grid>
      <Grid size={{ xs: 6, md: 4 }}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h4">
            {data.averageTransactionValue?.toFixed(2) || '0.00'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Avg Value
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderRevenueStats = () => (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 4 }}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h4" color="primary">
            {formatCurrencyUSD(data.totalRevenue)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Revenue
          </Typography>
        </Paper>
      </Grid>
      <Grid size={{ xs: 6, md: 4 }}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h4" color="success.main">
            {formatCurrencyUSD(data.netRevenue)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Net Revenue
          </Typography>
        </Paper>
      </Grid>
      <Grid size={{ xs: 6, md: 4 }}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h4" color="warning.main">
            {formatCurrencyUSD(data.platformFees)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Platform Fees
          </Typography>
        </Paper>
      </Grid>
      <Grid size={{ xs: 6 }}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h4">
            {formatNumber(data.transactionCount)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Transaction Count
          </Typography>
        </Paper>
      </Grid>
      <Grid size={{ xs: 6 }}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h4">
            {formatCurrencyUSD(data.averageRevenuePerTransaction)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Avg Revenue/Transaction
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderCarbonStats = () => (
    <Grid container spacing={2}>
      <Grid size={{ xs: 6, md: 3 }}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h4" color="primary">
            {formatNumber(data.totalCreditsIssued)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Credits Issued
          </Typography>
        </Paper>
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h4" color="success.main">
            {formatNumber(data.totalCreditsTraded)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Credits Traded
          </Typography>
        </Paper>
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h4" color="info.main">
            {formatNumber(data.totalCO2Reduced)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            CO2 Reduced (kg)
          </Typography>
        </Paper>
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h4">
            {formatCurrencyUSD(data.averageCreditPrice)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Avg Credit Price
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderReportData = () => {
    if (data.error) {
      return (
        <Alert severity="error">
          Failed to generate report data: {data.error}
        </Alert>
      );
    }

    switch (report.type) {
      case ReportType.USER_STATS:
        return renderUserStats();
      case ReportType.TRANSACTION_STATS:
        return renderTransactionStats();
      case ReportType.REVENUE_STATS:
        return renderRevenueStats();
      case ReportType.CARBON_STATS:
        return renderCarbonStats();
      default:
        return <Typography>No data available</Typography>;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReportIcon />
          <span>Report Details</span>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip
              label={getReportTypeLabel(report.type)}
              color="primary"
              icon={<ReportIcon />}
            />
            <Chip label={getReportPeriodLabel(report.period)} variant="outlined" />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CalendarIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Generated: {formatDateTime(report.generatedAt)}
              </Typography>
            </Box>
            {report.startDate && report.endDate && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CalendarIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  Range: {new Date(report.startDate).toLocaleDateString('vi-VN')}{' '}
                  - {new Date(report.endDate).toLocaleDateString('vi-VN')}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {renderReportData()}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} startIcon={<CloseIcon />}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReportDetailDialog;
