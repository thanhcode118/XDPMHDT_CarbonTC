import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { Box, Typography } from '@mui/material';

interface SidebarHeaderProps {
  open: boolean;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({ open }) => {
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        pl: open ? 2 : 0,
        justifyContent: open ? 'flex-start' : 'center',
      }}
    >
      <AdminPanelSettingsIcon
        sx={{
          fontSize: 32,
          color: '#1976d2',
        }}
      />
      {open && (
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              color: '#1976d2',
              lineHeight: 1.2,
            }}
          >
            Carbon Admin
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: '#666',
              fontSize: '0.7rem',
            }}
          >
            Service Management
          </Typography>
        </Box>
      )}
    </Box>
  );
};
