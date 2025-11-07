import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import GavelRoundedIcon from '@mui/icons-material/GavelRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import SpaceDashboardRoundedIcon from '@mui/icons-material/SpaceDashboardRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import { Box, List } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

import { ROUTES } from '../../../../common/constants';

import { SidebarMenuItem } from './sidebarMenuItems';

interface MenuItem {
  text: string;
  icon: React.ReactElement;
  path: string;
  badge?: number;
}

// TODO: Integrate with store to get real badge counts
const menuItems: MenuItem[] = [
  {
    text: 'Dashboard',
    icon: <SpaceDashboardRoundedIcon />,
    path: ROUTES.ADMIN.DASHBOARD,
  },
  {
    text: 'Users',
    icon: <GroupRoundedIcon />,
    path: ROUTES.ADMIN.USERS,
  },
  {
    text: 'Listings & Orders',
    icon: <ShoppingCartRoundedIcon />,
    path: ROUTES.ADMIN.LISTING_AND_ORDERS,
  },
  {
    text: 'Disputes',
    icon: <GavelRoundedIcon />,
    path: ROUTES.ADMIN.DISPUTES,
    badge: 3, // Example: pending disputes count
  },
  {
    text: 'Certificates',
    icon: <VerifiedRoundedIcon />,
    path: ROUTES.ADMIN.CERTIFICATES,
  },
  {
    text: 'Reports & KPI',
    icon: <AssessmentRoundedIcon />,
    path: ROUTES.ADMIN.REPORTS,
  },
  {
    text: 'Wallet',
    icon: <AccountBalanceWalletRoundedIcon />,
    path: ROUTES.ADMIN.WALLET,
  },
];

const bottomMenuItems: MenuItem[] = [
  {
    text: 'Settings',
    icon: <SettingsRoundedIcon />,
    path: ROUTES.ADMIN.SETTINGS,
  },
];

interface SidebarNavigationProps {
  open: boolean;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  open,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      <Box sx={{ flex: 1 }}>
        <List>
          {menuItems.map((item) => (
            <SidebarMenuItem
              key={item.text}
              item={item}
              isActive={isActive(item.path)}
              onNavigate={handleNavigation}
              open={open}
            />
          ))}
        </List>
      </Box>
      <Box>
        <List>
          {bottomMenuItems.map((item) => (
            <SidebarMenuItem
              key={item.text}
              item={item}
              isActive={isActive(item.path)}
              onNavigate={handleNavigation}
              open={open}
            />
          ))}
        </List>
      </Box>
    </>
  );
};
