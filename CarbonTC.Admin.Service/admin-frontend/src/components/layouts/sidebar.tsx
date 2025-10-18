import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MenuIcon from '@mui/icons-material/Menu';
import { Box, Divider, IconButton, useMediaQuery, Drawer } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { primaryBackgroundSidebar, borderLine } from '../../common/color';
import { DRAWER_WIDTH } from '../../common/constants';

import { SidebarHeader } from './components/sidebarHeader';
import { SidebarNavigation } from './components/sidebarNavigation';
import { SidebarUserMenu } from './components/sidebarUserMenu';

interface SidebarProps {
  open: boolean;
  // eslint-disable-next-line no-unused-vars
  setOpen: (v: boolean) => void;
}

const Sidebar = ({ open, setOpen }: SidebarProps) => {
  console.log('Sidebar - open:', open);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        anchor="left"
        open={open}
        onClose={handleDrawerClose}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            backgroundColor: primaryBackgroundSidebar,
            borderRight: `1px solid ${borderLine}`,
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            minHeight: 70,
          }}
        >
          <SidebarHeader open={true} />
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </Box>

        <Divider />

        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <SidebarNavigation open={true} />
        </Box>

        <Divider />
        <SidebarUserMenu open={true} />
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? DRAWER_WIDTH : 64,
        flexShrink: 0,
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        '& .MuiDrawer-paper': {
          width: open ? DRAWER_WIDTH : 64,
          backgroundColor: primaryBackgroundSidebar,
          borderRight: `1px solid ${borderLine}`,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: 'hidden',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          p: 1,
          minHeight: 70,
        }}
      >
        <SidebarHeader open={open} />
        <IconButton onClick={handleDrawerToggle}>
          {open ? (
            theme.direction === 'rtl' ? (
              <ChevronRightIcon />
            ) : (
              <ChevronLeftIcon />
            )
          ) : (
            <MenuIcon />
          )}
        </IconButton>
      </Box>

      <Divider />

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <SidebarNavigation open={open} />
      </Box>

      <Divider />
      <SidebarUserMenu open={open} />
    </Drawer>
  );
};

export default Sidebar;
