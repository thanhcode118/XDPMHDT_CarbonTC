import { Box, Chip, IconButton, Tooltip } from '@mui/material';
import { Visibility, Delete } from '@mui/icons-material';
import type { GridColDef } from '@mui/x-data-grid';

import { formatDateTime } from '../../../utils';
import { DisputeStatus, type Dispute } from '../../../types/dispute.type';

const getStatusColor = (status: DisputeStatus) => {
  switch (status) {
    case DisputeStatus.PENDING:
      return 'warning';
    case DisputeStatus.UNDER_REVIEW:
      return 'info';
    case DisputeStatus.RESOLVED:
      return 'success';
    case DisputeStatus.REJECTED:
      return 'error';
    default:
      return 'default';
  }
};

interface DisputeColumnsProps {
  onView: (dispute: Dispute) => void;
  onDelete: (disputeId: string) => void;
}

export const getDisputeColumns = ({
  onView,
  onDelete,
}: DisputeColumnsProps): GridColDef[] => [
  {
    field: 'disputeId',
    headerName: 'ID',
    width: 120,
    renderCell: (params) => (
      <Tooltip title={params.value}>
        <span>{params.value?.substring(0, 8)}...</span>
      </Tooltip>
    ),
  },
  {
    field: 'transactionId',
    headerName: 'Transaction',
    width: 130,
    renderCell: (params) => (
      <Tooltip title={params.value}>
        <span>{params.value?.substring(0, 10)}...</span>
      </Tooltip>
    ),
  },
  {
    field: 'raisedBy',
    headerName: 'User',
    width: 150,
    renderCell: (params) => (
      <Box>
        <div>{params.row.raisedByName || params.value?.substring(0, 10)}</div>
        {params.row.raisedByEmail && (
          <div style={{ fontSize: '0.75rem', color: '#666' }}>
            {params.row.raisedByEmail}
          </div>
        )}
      </Box>
    ),
  },
  {
    field: 'reason',
    headerName: 'Reason',
    width: 150,
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 130,
    renderCell: (params) => (
      <Chip
        label={params.value}
        color={getStatusColor(params.value)}
        size="small"
      />
    ),
  },
  {
    field: 'createdAt',
    headerName: 'Created',
    width: 180,
    valueFormatter: (value) => formatDateTime(value),
  },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 120,
    sortable: false,
    renderCell: (params) => (
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Tooltip title="View Details">
          <IconButton size="small" onClick={() => onView(params.row)}>
            <Visibility fontSize="small" />
          </IconButton>
        </Tooltip>
        {(params.row.status === DisputeStatus.PENDING ||
          params.row.status === DisputeStatus.UNDER_REVIEW) && (
          <Tooltip title="Delete">
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete(params.row.disputeId)}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    ),
  },
];
