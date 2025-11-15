import { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Add } from '@mui/icons-material';

import { CustomTable } from '../../components/tables';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useDispute } from './hooks/useDispute';
import { getDisputeColumns } from './tableColumns/disputeColumns';
import {
  StatisticsCards,
  DisputeFilters,
  CreateDisputeDialog,
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
    createDispute,
    updateStatus,
    resolveDispute,
    deleteDispute,
    updateFilters,
    handlePageChange,
    fetchDisputeById,
  } = useDispute();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
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

  const handleCreateSubmit = async (data: any) => {
    const result = await createDispute(data);
    if (result.success) {
      setCreateDialogOpen(false);
      // Success feedback could be added here
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
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >q

        <Box>
          <Typography variant="h4" gutterBottom>
            Dispute Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Handle buyer-seller disputes
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateDialogOpen(true)}
        >
          New Dispute
        </Button>
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

      {/* Create Dialog */}
      <CreateDisputeDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateSubmit}
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
