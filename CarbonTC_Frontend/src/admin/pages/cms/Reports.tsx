import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Paper,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  DeleteSweep as CleanupIcon,
  Assessment as ReportIcon,
} from '@mui/icons-material';
import { CustomTable } from '../../components/tables';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useReport } from './hooks/useReport';
import { getReportColumns } from './tableColumns/reportColumns';
import {
  CreateReportDialog,
  ReportDetailDialog,
  ReportFilters,
} from './components/Report';
import type {
  PlatformReport,
  GenerateReportRequest,
  GetReportsRequest,
  ReportFilters as ReportFiltersType,
} from '../../types/report.types';

function ReportsPage() {
  const {
    loading,
    error,
    reports,
    selectedReport,
    pagination,
    generateReport,
    fetchReports,
    fetchReportById,
    deleteReport,
    cleanupOldReports,
    setSelectedReport,
    clearError,
  } = useReport();

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [cleanupConfirmOpen, setCleanupConfirmOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<PlatformReport | null>(null);

  // Snackbar states
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Filter states
  const [filters, setFilters] = useState<ReportFiltersType>({});

  // Fetch reports on mount and when pagination/filters change
  useEffect(() => {
    loadReports();
  }, [currentPage, pageSize]);

  const loadReports = async () => {
    const params: GetReportsRequest = {
      page: currentPage + 1, // Backend uses 1-based pagination
      limit: pageSize,
      ...filters,
    };
    await fetchReports(params);
  };

  // Handle create report
  const handleCreateReport = async (data: GenerateReportRequest) => {
    const report = await generateReport(data);
    if (report) {
      setSnackbar({
        open: true,
        message: 'Report generated successfully!',
        severity: 'success',
      });
      setCreateDialogOpen(false);
      loadReports(); // Refresh list
    }
  };

  // Handle view report
  const handleViewReport = async (report: PlatformReport) => {
    await fetchReportById(report.reportId);
    setDetailDialogOpen(true);
  };

  // Handle delete report
  const handleDeleteClick = (report: PlatformReport) => {
    setReportToDelete(report);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (reportToDelete) {
      const success = await deleteReport(reportToDelete.reportId);
      if (success) {
        setSnackbar({
          open: true,
          message: 'Report deleted successfully!',
          severity: 'success',
        });
        setDeleteConfirmOpen(false);
        setReportToDelete(null);
        loadReports(); // Refresh list
      }
    }
  };

  // Handle cleanup old reports
  const handleCleanupClick = () => {
    setCleanupConfirmOpen(true);
  };

  const handleConfirmCleanup = async () => {
    const deletedCount = await cleanupOldReports(90);
    if (deletedCount !== null) {
      setSnackbar({
        open: true,
        message: `Deleted ${deletedCount} old reports`,
        severity: 'success',
      });
      setCleanupConfirmOpen(false);
      loadReports(); // Refresh list
    }
  };

  // Handle apply filters
  const handleApplyFilters = (newFilters: ReportFiltersType) => {
    setFilters(newFilters);
    setCurrentPage(0); // Reset to first page

    const params: GetReportsRequest = {
      page: 1,
      limit: pageSize,
      ...newFilters,
    };
    fetchReports(params);
  };

  // Handle pagination change
  const handlePageChange = (page: number, newPageSize: number) => {
    setCurrentPage(page);
    setPageSize(newPageSize);
  };

  // Show error in snackbar
  useEffect(() => {
    if (error) {
      setSnackbar({
        open: true,
        message: error,
        severity: 'error',
      });
    }
  }, [error]);

  // Table columns
  const columns = getReportColumns({
    onView: handleViewReport,
    onDelete: handleDeleteClick,
  });

  if (loading && reports.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
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
            <ReportIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Reports & KPI
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Generate and view platform reports
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<CleanupIcon />}
            onClick={handleCleanupClick}
          >
            Cleanup Old Reports
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Generate Report
          </Button>
        </Box>
      </Box>

      {/* Stats */}
      {pagination && (
        <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2 }}>
          <Chip
            label={`Total Reports: ${pagination.totalItems}`}
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`Page ${pagination.currentPage} of ${pagination.totalPages}`}
            variant="outlined"
          />
        </Paper>
      )}

      {/* Filters */}
      <ReportFilters onFilter={handleApplyFilters} loading={loading} />

      {/* Reports Table */}
      <CustomTable
        items={reports}
        columnHeaders={columns}
        totalCount={pagination?.totalItems || 0}
        currentPage={currentPage}
        maxPageSize={pageSize}
        onPageChange={handlePageChange}
        isLoading={loading}
        getRowId={(row) => row.reportId}
        noDataMessage="No reports found. Generate your first report!"
      />

      {/* Create Report Dialog */}
      <CreateReportDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateReport}
        loading={loading}
      />

      {/* Report Detail Dialog */}
      <ReportDetailDialog
        open={detailDialogOpen}
        onClose={() => {
          setDetailDialogOpen(false);
          setSelectedReport(null);
        }}
        report={selectedReport}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setReportToDelete(null);
        }}
      >
        <DialogTitle>Delete Report?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this report? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteConfirmOpen(false);
              setReportToDelete(null);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={loading}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cleanup Confirmation Dialog */}
      <Dialog
        open={cleanupConfirmOpen}
        onClose={() => setCleanupConfirmOpen(false)}
      >
        <DialogTitle>Cleanup Old Reports?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will delete all reports older than 90 days. Are you sure you want
            to continue?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCleanupConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmCleanup}
            color="warning"
            variant="contained"
            disabled={loading}
          >
            Cleanup
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => {
          setSnackbar({ ...snackbar, open: false });
          clearError();
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => {
            setSnackbar({ ...snackbar, open: false });
            clearError();
          }}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ReportsPage;
