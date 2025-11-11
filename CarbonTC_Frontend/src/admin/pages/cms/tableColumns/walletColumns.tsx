import { Box, Chip, IconButton, Tooltip } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { formatNumber, formatDateTime } from '../../../utils';
import type { WithdrawRequest } from '../../../services/wallet.service';

interface WalletColumnsProps {
  onApprove: (requestId: number) => void;
  onReject: (requestId: number) => void;
}

export const getWalletColumns = ({
  onApprove,
  onReject
}: WalletColumnsProps): GridColDef<WithdrawRequest>[] => [
  {
    field: 'userId',
    headerName: 'User ID',
    width: 200,
    renderCell: (params) => (
      <Tooltip title={params.value}>
        <span>{params.value?.slice(0, 8)}...</span>
      </Tooltip>
    ),
  },
  {
    field: 'amount',
    headerName: 'Amount (VND)',
    width: 150,
    align: 'right',
    headerAlign: 'right',
    renderCell: (params) => (
      <Box sx={{ fontWeight: 600, color: 'primary.main' }}>
        {formatNumber(params.value)}
      </Box>
    ),
  },
  {
    field: 'bankAccountNumber',
    headerName: 'Bank Account',
    width: 180,
  },
  {
    field: 'bankName',
    headerName: 'Bank Name',
    width: 150,
  },
  {
    field: 'requestedAt',
    headerName: 'Requested At',
    width: 180,
    renderCell: (params) => formatDateTime(params.value),
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 120,
    renderCell: (params) => {
      const statusColors = {
        Pending: 'warning',
        Approved: 'success',
        Rejected: 'error',
        Paid: 'info',
      } as const;

      return (
        <Chip
          label={params.value}
          color={statusColors[params.value as keyof typeof statusColors]}
          size="small"
        />
      );
    },
  },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 120,
    sortable: false,
    renderCell: (params) => {
      const isPending = params.row.status === 'Pending';

      if (!isPending) {
        return <span style={{ color: '#9e9e9e' }}>—</span>;
      }

      return (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Approve">
            <IconButton
              size="small"
              color="success"
              onClick={(e) => {
                e.stopPropagation();
                onApprove(params.row.requestId);
              }}
            >
              <CheckCircleIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reject">
            <IconButton
              size="small"
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                onReject(params.row.requestId);
              }}
            >
              <CancelIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      );
    },
  },
];
