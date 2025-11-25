import type { GridColDef } from '@mui/x-data-grid';
import { Chip, IconButton, Tooltip, Box } from '@mui/material';
import {
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Assessment as ReportIcon,
} from '@mui/icons-material';
import {
  getReportTypeLabel,
  getReportPeriodLabel,
  type PlatformReport,
  ReportType,
  ReportPeriod,
} from '../../../types/report.types';
import { formatDateTime } from '../../../utils/dateTime';
import { gray, red } from '../../../../common/color';

interface ReportColumnParams {
  onView: (report: PlatformReport) => void;
  onDelete: (report: PlatformReport) => void;
}

export const getReportColumns = ({
  onView,
  onDelete,
}: ReportColumnParams): GridColDef[] => [
  {
    field: 'type',
    headerName: 'Report Type',
    minWidth: 200,
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => {
      const typeColors: Record<ReportType, string> = {
        [ReportType.USER_STATS]: 'primary',
        [ReportType.TRANSACTION_STATS]: 'secondary',
        [ReportType.REVENUE_STATS]: 'success',
        [ReportType.CARBON_STATS]: 'info',
      };

      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center' ,
            alignItems: 'center',
            gap: 1,
            height: '100%'
          }}
        >
          <ReportIcon fontSize="small" />
          <Chip
            label={getReportTypeLabel(params.value as ReportType)}
            color={typeColors[params.value as ReportType] || 'default'}
            size="small"
            variant="outlined"
          />
        </Box>
      );
    },
  },
  {
    field: 'period',
    headerName: 'Period',
    minWidth: 120,
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => (
      <Chip
        label={getReportPeriodLabel(params.value as ReportPeriod)}
        size="small"
        variant="filled"
        sx={{
          color: gray[600],
          fontWeight: 600,
        }}
      />
    ),
  },
  {
    field: 'generatedAt',
    headerName: 'Generated At',
    minWidth: 180,
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => (
      <span>
        {formatDateTime(params.value)}
      </span>
    ),
  },
  {
    field: 'dateRange',
    headerName: 'Date Range',
    minWidth: 200,
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => {
      const report = params.row as PlatformReport;
      if (report.startDate && report.endDate) {
        return (
          <span>
            {new Date(report.startDate).toLocaleDateString('vi-VN')} -{' '}
            {new Date(report.endDate).toLocaleDateString('vi-VN')}
          </span>
        );
      }
      return <span>-</span>;
    },
  },
  {
    field: 'summary',
    headerName: 'Summary',
    flex: 1,
    minWidth: 200,
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => {
      const report = params.row as PlatformReport;
      const data = report.dataJson;

      let summaryText = '';

      if (report.type === ReportType.USER_STATS && data.totalUsers !== undefined) {
        summaryText = `${data.totalUsers} total users, ${data.newUsers || 0} new`;
      } else if (report.type === ReportType.TRANSACTION_STATS && data.totalTransactions !== undefined) {
        summaryText = `${data.totalTransactions} transactions, ${data.totalVolume || 0} volume`;
      } else if (report.type === ReportType.REVENUE_STATS && data.totalRevenue !== undefined) {
        summaryText = `Revenue: ${data.totalRevenue?.toLocaleString('vi-VN')} USD`;
      } else if (report.type === ReportType.CARBON_STATS && data.totalCreditsIssued !== undefined) {
        summaryText = `${data.totalCreditsIssued} credits issued, ${data.totalCO2Reduced || 0} kg CO2 reduced`;
      } else {
        summaryText = 'View for details';
      }

      return (
        <Tooltip title={summaryText}>
          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {summaryText}
          </span>
        </Tooltip>
      );
    },
  },
  {
    field: 'actions',
    headerName: 'Actions',
    minWidth: 120,
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    renderCell: (params) => {
      const report = params.row as PlatformReport;

      return (
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
            <IconButton
              size="small"
              onClick={() => onView(report)}
              sx={{
                '&:hover': { backgroundColor: gray[300] },
              }}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Report">
            <IconButton
              size="small"
              onClick={() => onDelete(report)}
              sx={{
                color: red[500],
                '&:hover': { backgroundColor: red[100] },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      );
    },
  },
];

export default getReportColumns;
