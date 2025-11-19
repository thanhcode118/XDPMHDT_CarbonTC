import { useState } from 'react';
import { Box, Typography } from '@mui/material';

import { CustomTable } from '../../components/tables';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useDispute } from './hooks/useDispute';
import { getDisputeColumns } from './tableColumns/disputeColumns';
import {
  StatisticsCards,
  DisputeFilters,
  DisputeDetailDialog,
} from './components/Dispute';
import type { Dispute } from '../../types/dispute.type';

function Disputes() {
  const {
    disputes,
    statistics,
    totalCount,
    currentPage,
    pageSize,
    filters,
    isLoading,
    isStatsLoading,
    updateStatus,
    resolveDispute,
    deleteDispute,
    updateFilters,
    handlePageChange,
    fetchDisputeById,
  } = useDispute();

  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(
    null,
  );

  const handleViewDetail = (dispute: Dispute) => {
    setSelectedDisputeId(dispute.disputeId);
    setDetailDialogOpen(true);
  };

  const handleDelete = async (disputeId: string) => {
    if (!window.confirm('Are you sure you want to delete this dispute?')) {
      return;
    }

    const result = await deleteDispute(disputeId);
    if (result.success) {
      // Success feedback could be added here (toast notification)
    }
  };

  const columns = getDisputeColumns({
    onView: handleViewDetail,
    onDelete: handleDelete,
  });

  if (isLoading && disputes.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Dispute Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Review and handle buyer-seller disputes submitted by users
        </Typography>
      </Box>

      <StatisticsCards statistics={statistics} isLoading={isStatsLoading} />

      <DisputeFilters filters={filters} onFiltersChange={updateFilters} />

      <CustomTable
        items={disputes}
        columnHeaders={columns}
        totalCount={totalCount}
        currentPage={currentPage}
        maxPageSize={pageSize}
        onPageChange={handlePageChange}
        isLoading={isLoading}
        noDataMessage="No disputes found"
      />

      {/* Detail Dialog */}
      <DisputeDetailDialog
        open={detailDialogOpen}
        disputeId={selectedDisputeId}
        onClose={() => {
          setDetailDialogOpen(false);
          setSelectedDisputeId(null);
        }}
        onDelete={deleteDispute}
        onUpdateStatus={updateStatus}
        onResolve={resolveDispute}
        fetchDisputeById={fetchDisputeById}
      />
    </Box>
  );
}

export default Disputes;
