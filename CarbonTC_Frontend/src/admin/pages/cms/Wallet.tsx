import { useState } from 'react';
import { Box, Card, Tab, Tabs, Typography, Alert, Snackbar } from '@mui/material';
import { useWallet, type WithdrawStatus } from './hooks/useWallet';
import { getWalletColumns } from './tableColumns/walletColumns';
import { CustomTable } from '../../components/tables';
import { StatsCards, FilterBar, ConfirmDialog } from './components/Wallet';
import LoadingSpinner from '../../components/LoadingSpinner';

function Wallet() {
  const {
    filteredRequests,
    loading,
    error,
    selectedStatus,
    searchTerm,
    dateRange,
    setSelectedStatus,
    setSearchTerm,
    setDateRange,
    handleApprove,
    handleReject,
    stats,
  } = useWallet();

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'approve' | 'reject' | null;
    requestId: number | null;
  }>({
    open: false,
    type: null,
    requestId: null,
  });

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleTabChange = (
    _event: React.SyntheticEvent,
    newValue: WithdrawStatus
  ) => {
    setSelectedStatus(newValue);
  };

  const openConfirmDialog = (
    type: 'approve' | 'reject',
    requestId: number
  ) => {
    setConfirmDialog({
      open: true,
      type,
      requestId,
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({
      open: false,
      type: null,
      requestId: null,
    });
  };

  const handleConfirm = async () => {
    if (!confirmDialog.requestId || !confirmDialog.type) return;

    try {
      if (confirmDialog.type === 'approve') {
        await handleApprove(confirmDialog.requestId);
        setSnackbar({
          open: true,
          message: 'Request approved successfully',
          severity: 'success',
        });
      } else {
        await handleReject(confirmDialog.requestId);
        setSnackbar({
          open: true,
          message: 'Request rejected successfully',
          severity: 'success',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to process request',
        severity: 'error',
      });
    } finally {
      closeConfirmDialog();
    }
  };

  const columns = getWalletColumns({
    onApprove: (requestId) => openConfirmDialog('approve', requestId),
    onReject: (requestId) => openConfirmDialog('reject', requestId),
  });

  if (loading && filteredRequests.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ p: 0 }}>
      <Typography variant="h4" gutterBottom>
        Wallet Management
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage withdraw requests and e-wallets
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <StatsCards stats={stats} />

      <Card sx={{ p: 2 }}>
        <Tabs
          value={selectedStatus}
          onChange={handleTabChange}
          sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="All" value="All" />
          <Tab label="Pending" value="Pending" />
          <Tab label="Approved" value="Approved" />
          <Tab label="Rejected" value="Rejected" />
        </Tabs>

        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />

        <CustomTable
          items={filteredRequests}
          columnHeaders={columns}
          totalCount={filteredRequests.length}
          currentPage={0}
          maxPageSize={10}
          onPageChange={() => {}}
          isLoading={loading}
          getRowId={(row) => row.requestId}
          noDataMessage="No withdraw requests found"
        />
      </Card>

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.type === 'approve'
          ? 'Approve Request'
          : 'Reject Request'
        }
        message={
          confirmDialog.type === 'approve'
            ? 'Are you sure you want to approve this withdraw request?'
            : 'Are you sure you want to reject this withdraw request?'
        }
        confirmText={confirmDialog.type === 'approve' ? 'Approve' : 'Reject'}
        confirmColor={confirmDialog.type === 'approve' ? 'success' : 'error'}
        onConfirm={handleConfirm}
        onCancel={closeConfirmDialog}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Wallet;
