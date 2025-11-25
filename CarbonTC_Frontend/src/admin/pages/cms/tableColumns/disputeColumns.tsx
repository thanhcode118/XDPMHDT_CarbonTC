import { Box, Chip, IconButton, Tooltip } from '@mui/material';
import { Visibility, Delete } from '@mui/icons-material';
import type { GridColDef } from '@mui/x-data-grid';

import { formatDateTime } from '../../../utils';
import { DisputeStatus, type Dispute } from '../../../types/dispute.type';
import { red } from '../../../../common/color';

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
    minWidth: 150,
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => (
      <Tooltip title={params.value}>
        <span>{params.value?.substring(0, 12)}...</span>
      </Tooltip>
    ),
  },
  {
    field: 'transactionId',
    headerName: 'Transaction',
    minWidth: 150,
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => (
      <Tooltip title={params.value}>
        <span>{params.value?.substring(0, 12)}...</span>
      </Tooltip>
    ),
  },
  {
    field: 'raisedBy',
    headerName: 'User',
    minWidth: 150,
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => (
      <Box>
        <div>{params.row.raisedByName || params.value?.substring(0, 12)}...</div>
        {params.row.raisedByEmail && (
          <div>
            {params.row.raisedByEmail}
          </div>
        )}
      </Box>
    ),
  },
  {
    field: 'reason',
    headerName: 'Reason',
    minWidth: 220,
    align: 'center',
    headerAlign: 'center',
  },
  {
    field: 'status',
    headerName: 'Status',
    minWidth: 130,
    align: 'center',
    headerAlign: 'center',
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
    minWidth: 200,
    align: 'center',
    headerAlign: 'center',
    valueFormatter: (value) => formatDateTime(value),
  },
  {
    field: 'actions',
    headerName: 'Actions',
    minWidth: 120,
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    renderCell: (params) => (
      <Box
        sx={{
            display: 'flex',
            gap: 1,
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%'
        }}
      >
        <Tooltip title="View Details">
          <IconButton size="small" onClick={() => onView(params.row)}>
            <Visibility />
          </IconButton>
        </Tooltip>
        {(params.row.status === DisputeStatus.PENDING ||
          params.row.status === DisputeStatus.UNDER_REVIEW) && (
          <Tooltip title="Delete">
            <IconButton
              // size="small"
              sx={{
                color: red[500],
                '&:hover': { backgroundColor: red[100] },
              }}
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
