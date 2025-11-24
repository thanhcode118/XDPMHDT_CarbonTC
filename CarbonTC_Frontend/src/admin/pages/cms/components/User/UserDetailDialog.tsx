import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  Grid,
  Chip,
  CircularProgress,
} from '@mui/material';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import ContactPhoneRoundedIcon from '@mui/icons-material/ContactPhoneRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import LabelRoundedIcon from '@mui/icons-material/LabelRounded';
import BadgeIcon from '@mui/icons-material/Badge';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';

import type { UserDetail } from '../../../../types/user.types';
import {
  getUserRoleColor,
  getUserStatusColor,
  UserRoleLabels,
  UserStatusLabels,
} from '../../../../types/user.types';
import { formatDateTime } from '../../../../utils';
import { formatPhoneGrid } from '../../../../utils/number';

interface UserDetailDialogProps {
  open: boolean;
  user: UserDetail | null;
  isLoading?: boolean;
  onClose: () => void;
}

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null | undefined;
}) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
    <Box sx={{  mt: 0.5 }}>{icon}</Box>
    <Box sx={{ flex: 1 }}>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {label}
      </Typography>
      <Typography variant="body1">{value || '-'}</Typography>
    </Box>
  </Box>
);

export const UserDetailDialog = ({
  open,
  user,
  isLoading = false,
  onClose,
}: UserDetailDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <PersonRoundedIcon />
          <Typography variant="h6">User Details</Typography>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent>
        {isLoading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 200,
            }}
          >
            <CircularProgress />
          </Box>
        ) : user ? (
          <Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <InfoRow
                    icon={<PersonRoundedIcon />}
                    label="Full Name"
                    value={user.fullName}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <InfoRow
                    icon={<EmailRoundedIcon />}
                    label="Email"
                    value={user.email}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <InfoRow
                    icon={<ContactPhoneRoundedIcon />}
                    label="Phone Number"
                    value={formatPhoneGrid(user.phoneNumber)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                    <Box sx={{ mt: 0.5 }}>
                      <BadgeIcon />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Role
                      </Typography>
                      <Chip
                        label={UserRoleLabels[user.role]}
                        color={getUserRoleColor(user.role)}
                        size="small"
                      />
                    </Box>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                    <Box sx={{ mt: 0.5 }}>
                      <LabelRoundedIcon />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Status
                      </Typography>
                      <Chip
                        label={UserStatusLabels[user.status]}
                        color={getUserStatusColor(user.status)}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Additional Information
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <InfoRow
                    icon={<HomeRoundedIcon />}
                    label="Address"
                    value={user.address}
                  />
                </Grid>
                {(user.role === 'BUYER' || user.companyName) && (
                  <>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <InfoRow
                        icon={<BusinessRoundedIcon />}
                        label="Company Name"
                        value={user.companyName}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <InfoRow
                        icon={<BadgeIcon />}
                        label="Tax Code"
                        value={user.taxCode}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box>
              <Typography variant="h6" gutterBottom>
                Timestamps
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <InfoRow
                    icon={<CalendarMonthRoundedIcon />}
                    label="Created At"
                    value={formatDateTime(user.createdAt)}
                  />
                </Grid>
                {user.updatedAt && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <InfoRow
                      icon={<CalendarMonthRoundedIcon />}
                      label="Updated At"
                      value={formatDateTime(user.updatedAt)}
                    />
                  </Grid>
                )}
              </Grid>
            </Box>
          </Box>
        ) : (
          <Typography color="text.secondary" align="center">
            No user data available
          </Typography>
        )}
      </DialogContent>

      <Divider />

      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserDetailDialog;
