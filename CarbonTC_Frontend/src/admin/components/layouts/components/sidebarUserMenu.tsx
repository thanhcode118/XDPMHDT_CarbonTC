import {
  Person as PersonIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ROUTES } from '../../../../common/constants';
import { useAuthStore } from '../../../store';
// import ToastMessage from '../../toastMessage';

import ConditionalTooltip from './conditionalTooltip';

interface SidebarUserMenuProps {
  open: boolean;
}

export const SidebarUserMenu: React.FC<SidebarUserMenuProps> = ({ open }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [anchorEL, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleUserMenuClose();
    navigate(ROUTES.ADMIN.PROFILE || '/profile');
  };

  const handleLogout = () => {
    handleUserMenuClose();
    logout();
    // ToastMessage('success', 'Logout successfully!');
    // navigate(ROUTES.AUTH.SIGNIN);
  };

  const userMenuContent = (
    <Box
      sx={[
        {
          p: 2,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          '&:hover': {
            backgroundColor: '#f5f5f5',
          },
        },
        open
          ? {
              justifyContent: 'flex-start',
              gap: 2,
            }
          : {
              justifyContent: 'center',
              gap: 0,
            },
      ]}
      onClick={handleUserMenuOpen}
    >
      <Avatar sx={{ width: 32, height: 32, bgcolor: '#1976d2' }}>
        <PersonIcon sx={{ fontSize: 20 }} />
      </Avatar>
      {open && (
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: '#333',
              opacity: open ? 1 : 0,
            }}
          >
            {user?.name || 'Admin User'}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: '#666',
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              opacity: open ? 1 : 0,
            }}
          >
            {user?.email || 'admin@carbon.com'}
          </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      <ConditionalTooltip
        show={!open}
        title={user?.name || 'Admin User'}
        placement="right"
        arrow
      >
        {userMenuContent}
      </ConditionalTooltip>

      <Menu
        anchorEl={anchorEL}
        open={Boolean(anchorEL)}
        onClose={handleUserMenuClose}
        transformOrigin={{ horizontal: 'center', vertical: 'bottom' }}
        anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
        slotProps={{
          paper: {
            sx: {
              width: 200,
              mt: -1,
            },
          },
        }}
      >
        <MenuItem onClick={handleProfile}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};
