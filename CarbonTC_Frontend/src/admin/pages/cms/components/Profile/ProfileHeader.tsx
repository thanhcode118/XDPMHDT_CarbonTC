import { Box, Avatar, Typography, Chip, Button } from '@mui/material';
import { Logout as LogoutIcon, Edit as EditIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../../store';
import { formatDate } from '../../../../utils';
import type { ProfileData } from '../../hooks/useProfile';

interface ProfileHeaderProps {
  profileData: ProfileData;
}

function ProfileHeader({ profileData }: ProfileHeaderProps) {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

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
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        p: 3,
        backgroundColor: 'background.paper',
        borderRadius: 2,
        mb: 3,
        border: '1px solid',
        borderColor: 'divider',
        flexWrap: 'wrap',
      }}
    >
      {/* Avatar */}
      <Avatar
        src={profileData.avatarUrl}
        alt={profileData.fullName}
        sx={{
          width: { xs: 80, md: 100 },
          height: { xs: 80, md: 100 },
          fontSize: '2rem',
          fontWeight: 600,
          bgcolor: 'primary.main',
        }}
      >
        {!profileData.avatarUrl && getInitials(profileData.fullName)}
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 200 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 600, mb: 0.5, fontSize: { xs: '1.5rem', md: '2rem' } }}
        >
          {profileData.fullName}
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 1, fontSize: '1rem' }}
        >
          {profileData.email}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
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
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            Member since: {formatDate(profileData.createdAt)}
          </Typography>
        </Box>
      </Box>

      {/* Actions */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          flexDirection: { xs: 'column', sm: 'row' },
          width: { xs: '100%', sm: 'auto' },
        }}
      >
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          sx={{ minWidth: 120 }}
        >
          Edit Profile
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{ minWidth: 120 }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
}

export default ProfileHeader;
