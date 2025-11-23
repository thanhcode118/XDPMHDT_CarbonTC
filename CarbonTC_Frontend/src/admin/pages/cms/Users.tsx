import { Box, Typography, Card, CardContent } from '@mui/material';

import { CustomTable } from '../../components/tables';
import { useUser } from '../cms/hooks/useUser';
import { getUserColumns } from '../cms/tableColumns/userColumns';
import {
  UserDetailDialog,
  ConfirmDeleteDialog,
  UserStatisticsCards,
  UserFilters,
} from './components/User';
import type { User } from '../../types/user.types';

function Users() {
  const {
    users,
    statistics,
    selectedUser,

    isLoading,
    isLoadingStatistics,
    isLoadingDetail,

    currentPage,
    pageSize,
    totalCount,

    filters,

    detailDialogOpen,
    deleteDialogOpen,
    userToDelete,

    fetchUserDetail,
    handleDeleteUser,
    handleApproveVerifier,
    handleRejectVerifier,
    handlePageChange,
    handleFilterChange,
    openDeleteDialog,
    closeDeleteDialog,
    closeDetailDialog,
  } = useUser();

  const columns = getUserColumns({
    onViewDetail: (user: User) => fetchUserDetail(user.id || user.userId || ''),
    onDelete: openDeleteDialog,
    onApprove: (user: User) => handleApproveVerifier(user.id || user.userId || ''),
    onReject: (user: User) => handleRejectVerifier(user.id || user.userId || ''),
    showVerifierActions: filters.role === 'CVA',
  });

  return (
    <Box sx={{ p: 1 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mb: 3
        }}
      >
        <Box>
          <Typography variant="h4" gutterBottom>
            User Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage users, verify CVA applications, and monitor user activities
          </Typography>
        </Box>
      </Box>

      <UserStatisticsCards
        statistics={statistics}
        isLoading={isLoadingStatistics}
      />

      <UserFilters filters={filters} onFilterChange={handleFilterChange} />

      <Card sx={{ p: 0 }}>
        <CardContent>
          <Box sx={{ mb: 0 }}>
            <Typography variant="h6" gutterBottom>
              Users List
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {totalCount > 0
                ? `Showing ${users.length} of ${totalCount} users`
                : 'No users found'}
            </Typography>
          </Box>

          <CustomTable
            items={users}
            columnHeaders={columns}
            totalCount={totalCount}
            currentPage={currentPage}
            maxPageSize={pageSize}
            onPageChange={handlePageChange}
            isLoading={isLoading}
            getRowId={(row) => row.id || row.userId || ''}
            noDataMessage="No users found"
          />
        </CardContent>
      </Card>

      <UserDetailDialog
        open={detailDialogOpen}
        user={selectedUser}
        isLoading={isLoadingDetail}
        onClose={closeDetailDialog}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        user={userToDelete}
        onConfirm={() => {
          if (userToDelete) {
            handleDeleteUser(userToDelete.id || userToDelete.userId || '');
          }
        }}
        onCancel={closeDeleteDialog}
      />
    </Box>
  );
}

export default Users;
