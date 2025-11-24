import { Chip, IconButton, Tooltip } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { formatDateTime, formatRelativeTime } from '../../../utils/dateTime';
import type { AdminAction } from '../../../types/adminaction.types';
import {
  ActionTypeLabels,
  getActionTypeColor,
} from '../../../types/adminaction.types';

export const adminActionColumns = (
  onViewDetail?: (actionId: string) => void,
): GridColDef[] => [
  {
    field: 'actionType',
    headerName: 'Action Type',
    width: 180,
    align: 'center',
    headerAlign: 'center',
    renderCell: (params: GridRenderCellParams<AdminAction>) => {
      const actionType = params.value as string;
      const label = ActionTypeLabels[actionType] || actionType;
      const color = getActionTypeColor(actionType);

      return (
        <Chip
          label={label}
          color={color}
          size="small"
          sx={{ fontWeight: 600 }}
        />
      );
    },
  },
  {
    field: 'description',
    headerName: 'Description',
    flex: 1,
    minWidth: 250,
    align: 'center',
    headerAlign: 'center',
    renderCell: (params: GridRenderCellParams<AdminAction>) => (
      <Tooltip title={params.value || ''} arrow>
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {params.value || '-'}
        </span>
      </Tooltip>
    ),
  },
  {
    field: 'targetId',
    headerName: 'Target ID',
    width: 200,
    align: 'center',
    headerAlign: 'center',
    renderCell: (params: GridRenderCellParams<AdminAction>) => (
      <Tooltip title={params.value || ''} arrow>
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontFamily: 'monospace',
            fontSize: '0.875rem',
          }}
        >
          {params.value ? `${String(params.value).substring(0, 20)}...` : '-'}
        </span>
      </Tooltip>
    ),
  },
  {
    field: 'createdAt',
    headerName: 'Date',
    width: 200,
    align: 'center',
    headerAlign: 'center',
    renderCell: (params: GridRenderCellParams<AdminAction>) => (
      <Tooltip title={formatDateTime(params.value)} arrow>
        <span>{formatRelativeTime(params.value)}</span>
      </Tooltip>
    ),
  },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 100,
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
    renderCell: (params: GridRenderCellParams<AdminAction>) => (
      <IconButton
        size="small"
        color="primary"
        onClick={() => onViewDetail?.(params.row.actionId)}
      >
        <VisibilityIcon fontSize="small" />
      </IconButton>
    ),
  },
];

export default adminActionColumns;
