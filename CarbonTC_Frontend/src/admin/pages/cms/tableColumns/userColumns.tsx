import { Box, Button, Chip, IconButton, Tooltip } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';

import { formatDateTime } from '../../../utils';
import type { User } from '../../../types/user.types';
import {
  getUserRoleColor,
  getUserStatusColor,
  UserRoleLabels,
  UserStatusLabels,
} from '../../../types/user.types';
import { formatPhoneGrid } from '../../../utils/number';

interface UserColumnsProps {
  onViewDetail: (user: User) => void;
  onDelete: (user: User) => void;
  onApprove?: (user: User) => void;
  onReject?: (user: User) => void;
  showVerifierActions?: boolean;
}

export const getUserColumns = ({
  onViewDetail,
  onDelete,
  onApprove,
  onReject,
  showVerifierActions = false,
}: UserColumnsProps): GridColDef[] => {
  const baseColumns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'User ID',
      minWidth: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <span>{params.value?.slice(0, 8)}...</span>
        </Tooltip>
      ),
    },
    {
      field: 'fullName',
      headerName: 'Full Name',
      width: 200,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => params.value || '-',
    },
    {
      field: 'email',
      headerName: 'Email',
      minWidth: 200,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'phoneNumber',
      headerName: 'Phone',
      minWidth: 140,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => formatPhoneGrid(params.value),
    },
    {
      field: 'role',
      headerName: 'Role',
      minWidth: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={UserRoleLabels[params.value as keyof typeof UserRoleLabels]}
          color={getUserRoleColor(params.value)}
          size="small"
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={UserStatusLabels[params.value as keyof typeof UserStatusLabels]}
          color={getUserStatusColor(params.value)}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Created At',
      minWidth: 180,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => formatDateTime(params.value),
    },
  ];

  const actionsColumn: GridColDef = {
    field: 'actions',
    headerName: 'Actions',
    align: 'center',
    headerAlign: 'center',
    minWidth: showVerifierActions ? 220 : 140,
    sortable: false,
    renderCell: (params) => {
      const user = params.row as User;
      const isVerifier = user.role === 'CVA';
      const isPending = user.status === 'INACTIVE';

      return (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetail(user);
              }}
              color="primary"
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {showVerifierActions && isVerifier && isPending && (
            <>
              <Tooltip title="Approve Verifier">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onApprove?.(user);
                  }}
                  color="success"
                >
                  <CheckCircleIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Reject Verifier">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReject?.(user);
                  }}
                  color="error"
                >
                  <CancelIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}

          {user.role !== 'ADMIN' && (
            <Tooltip title="Delete User">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(user);
                }}
                color="error"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      );
    },
  };

  return [...baseColumns, actionsColumn];
};

export const getPendingVerifierColumns = ({
  onApprove,
  onReject,
}: {
  onApprove: (user: User) => void;
  onReject: (user: User) => void;
}): GridColDef[] => [
  {
    field: 'fullName',
    headerName: 'Full Name',
    flex: 1,
    minWidth: 180,
  },
  {
    field: 'email',
    headerName: 'Email',
    flex: 1,
    minWidth: 200,
  },
  {
    field: 'phoneNumber',
    headerName: 'Phone',
    width: 140,
    renderCell: (params) => formatPhoneGrid(params.value),
  },
  {
    field: 'createdAt',
    headerName: 'Registered At',
    width: 180,
    renderCell: (params) => formatDateTime(params.value),
  },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 180,
    sortable: false,
    renderCell: (params) => {
      const user = params.row as User;
      return (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            color="success"
            size="small"
            startIcon={<CheckCircleIcon />}
            onClick={(e) => {
              e.stopPropagation();
              onApprove(user);
            }}
          >
            Approve
          </Button>
          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<CancelIcon />}
            onClick={(e) => {
              e.stopPropagation();
              onReject(user);
            }}
          >
            Reject
          </Button>
        </Box>
      );
    },
  },
];
