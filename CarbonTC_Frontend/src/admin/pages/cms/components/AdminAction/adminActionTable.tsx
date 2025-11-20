import { Box } from '@mui/material';
import { CustomTable } from '../../../../components/tables';
import { adminActionColumns } from '../../tableColumns/adminActionColumns';
import type { AdminAction } from '../../../../types/adminaction.types';

interface AdminActionTableProps {
  actions: AdminAction[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  loading?: boolean;
  onPageChange: (page: number, pageSize: number) => void;
  onViewDetail?: (actionId: string) => void;
}

function AdminActionTable({
  actions,
  totalCount,
  currentPage,
  pageSize,
  loading = false,
  onPageChange,
  onViewDetail,
}: AdminActionTableProps) {
  const columns = adminActionColumns(onViewDetail);

  return (
    <Box sx={{ width: '100%' }}>
      <CustomTable
        items={actions}
        columnHeaders={columns}
        totalCount={totalCount}
        currentPage={currentPage}
        maxPageSize={pageSize}
        onPageChange={onPageChange}
        isLoading={loading}
        rowHeight={60}
        noDataMessage="No admin actions found"
        sx={{
          '& .MuiDataGrid-row': {
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          },
        }}
      />
    </Box>
  );
}

export default AdminActionTable;
