import { Box, Paper, Typography } from '@mui/material';
import { useState } from 'react';
import { useAdminAction } from './hooks/useAdminAction';
import {
  AdminActionStats,
  AdminActionTable,
  AdminDetailDialog,
} from './components/AdminAction/index';

function AdminAction() {
  const {
    actions,
    statistics,
    totalCount,
    currentPage,
    pageSize,
    loading,
    statsLoading,
    handlePageChange,
    getActionDetail,
  } = useAdminAction();

  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const handleViewDetail = (actionId: string) => {
    setSelectedActionId(actionId);
    setDetailDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDetailDialogOpen(false);
    setSelectedActionId(null);
  };

  return (
    <Box>
      {/* Statistics Cards */}
      <AdminActionStats statistics={statistics} loading={statsLoading} />

      {/* Activity History Table */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Activity History
        </Typography>
        <AdminActionTable
          actions={actions}
          totalCount={totalCount}
          currentPage={currentPage}
          pageSize={pageSize}
          loading={loading}
          onPageChange={handlePageChange}
          onViewDetail={handleViewDetail}
        />
      </Paper>

      {/* Detail Dialog */}
      <AdminDetailDialog
        open={detailDialogOpen}
        onClose={handleCloseDialog}
        actionId={selectedActionId}
        fetchActionDetail={getActionDetail}
      />
    </Box>
  );
}

export default AdminAction;
