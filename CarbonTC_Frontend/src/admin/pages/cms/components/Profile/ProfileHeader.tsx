import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
} from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../../store';
import { formatDate } from '../../../../utils';
import type { ProfileData, UpdateProfileData } from '../../hooks/useProfile';
import EditProfileDialog from './EditProfileDialog';

interface ProfileHeaderProps {
  profileData: ProfileData;
  onUpdate: (data: UpdateProfileData) => Promise<{
    success: boolean;
    message: string;
  }>;
}

interface InfoRowProps {
  label: string;
  value: string | React.ReactNode;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <Box sx={{ mb: 1.5, display: 'flex', gap: 1 }}>
      <Typography
        variant="body1"
        sx={{
          color: 'text.secondary',
          fontWeight: 600,
          mb: 0.5,
        }}
      >
        {label}:
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: 'text.primary',
          fontSize: '1rem',
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function ProfileHeader({ profileData, onUpdate }: ProfileHeaderProps) {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const [openDialog, setOpenDialog] = useState(false);

  const handleOpenDialog = () => {
    setOpenDialog(true);
    // setFormData({
    //   fullName: profileData.fullName,
    //   phoneNumber: profileData.phoneNumber || '',
    // });
    // handleResetForm();
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    // handleResetForm();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'primary';
      case 'CVA':
        return 'secondary';
      case 'BUYER':
        return 'info';
      case 'EV_OWNER':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusColor = (
    status: string
  ): 'success' | 'error' | 'default' => {
    return status === 'ACTIVE' ? 'success' : 'error';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <Avatar
                    src={profileData.avatarUrl}
                    alt={profileData.fullName}
                    sx={{
                      width: 120,
                      height: 120,
                      mb: 2,
                    }}
                  >
                    {!profileData.avatarUrl && getInitials(profileData.fullName)}
                  </Avatar>

                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{
                      mb: 1.5,
                      textAlign: 'center',
                      wordBreak: 'break-all',
                    }}
                  >
                    ID: {profileData.userId}
                  </Typography>

                  <Box
                    sx={{
                      display: 'flex',
                      gap: 1,
                      flexWrap: 'wrap',
                      justifyContent: 'center',
                    }}
                  >
                    <Chip
                      label={profileData.role}
                      color={getRoleColor(profileData.role)}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                    <Chip
                      label={profileData.status}
                      color={getStatusColor(profileData.status)}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                  }}
                >
                  <Grid container spacing={2} sx={{ flexGrow: 1 }}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <InfoRow label="Full Name" value={profileData.fullName} />
                      <InfoRow
                        label="Phone Number"
                        value={profileData.phoneNumber || '-'}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <InfoRow
                        label="Created At"
                        value={formatDate(profileData.createdAt)}
                      />
                      <InfoRow
                        label="Role"
                        value={
                          <Chip
                            label={profileData.role}
                            color={getRoleColor(profileData.role)}
                            size="small"
                            sx={{ fontWeight: 600, height: 24 }}
                          />
                        }
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <InfoRow
                        label="Status"
                        value={
                          <Chip
                            label={profileData.status}
                            color={getStatusColor(profileData.status)}
                            size="small"
                            sx={{ fontWeight: 600, height: 24 }}
                            icon={
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  backgroundColor:
                                    profileData.status === 'ACTIVE'
                                      ? '#4caf50'
                                      : '#f44336',
                                  ml: 1,
                                }}
                              />
                            }
                          />
                        }
                      />
                    </Grid>
                  </Grid>

                  <Box
                    sx={{
                      display: 'flex',
                      gap: 1.5,
                      justifyContent: 'flex-end',
                      pt: 2,
                      borderTop: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Button
                      variant="contained"
                      startIcon={<EditRoundedIcon />}
                      onClick={handleOpenDialog}
                      sx={{ minWidth: 120, fontWeight: 600 }}
                    >
                      Edit Profile
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<LogoutRoundedIcon />}
                      onClick={handleLogout}
                      sx={{ minWidth: 120, fontWeight: 600 }}
                    >
                      Logout
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
      <EditProfileDialog
        open={openDialog}
        onClose={handleCloseDialog}
        profileData={profileData}
        onUpdate={onUpdate}
      />
    </>
  );
}

export default ProfileHeader;
