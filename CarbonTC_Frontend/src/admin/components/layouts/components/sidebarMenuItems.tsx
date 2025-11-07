/* eslint-disable no-unused-vars */
import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  keyframes,
  Badge,
} from '@mui/material';

import { gray } from '../../../../common/color';

import ConditionalTooltip from './conditionalTooltip';

interface MenuItem {
  text: string;
  icon: React.ReactElement;
  path: string;
  badge?: number; // Optional badge count
}

interface SidebarMenuItemProps {
  item: MenuItem;
  isActive: boolean;
  onNavigate: (path: string) => void;
  open: boolean;
}

const pulse = keyframes`
  0% {
    transform: translateY(-50%) scale(1);
    opacity: 1;
  }
  50% {
    transform: translateY(-50%) scale(1.2);
    opacity: 0.7;
  }
  100% {
    transform: translateY(-50%) scale(1);
    opacity: 1;
  }
`;

export const SidebarMenuItem: React.FC<SidebarMenuItemProps> = ({
  item,
  isActive,
  onNavigate,
  open,
}) => {
  const menuButton = (
    <ListItemButton
      onClick={() => onNavigate(item.path)}
      sx={[
        {
          minHeight: 48,
          px: 2.5,
          backgroundColor: isActive ? gray[300] : 'transparent',
          borderRadius: 2,
          mb: 0.5,
          position: 'relative',
          overflow: 'hidden',

          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',

          '&:hover': {
            backgroundColor: isActive ? gray[200] : gray[50],
            transform: open ? 'translateX(4px)' : 'translateX(2px)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',

            '& .MuiListItemIcon-root': {
              transform: 'scale(1.1) rotate(5deg)',
              color: isActive ? gray[700] : gray[500],
            },

            '& .MuiListItemText-primary': {
              transform: open ? 'translateX(2px)' : 'none',
              fontWeight: 500,
            },

            '&::before': {
              transform: 'scaleY(1)',
            },
          },

          '&::before': {
            content: '""',
            position: 'absolute',
            left: 0,
            top: '50%',
            width: '3px',
            height: '70%',
            backgroundColor: isActive ? gray[600] : gray[400],
            transform: isActive ? 'scaleY(1)' : 'scaleY(0)',
            transformOrigin: 'center',
            transition: 'transform 0.3s ease',
            borderRadius: '0 2px 2px 0',
          },

          '& .MuiListItemIcon-root': {
            color: isActive ? gray[800] : gray[500],
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            minWidth: 50,
          },

          '& .MuiListItemText-primary': {
            color: isActive ? gray[900] : gray[700],
            fontWeight: isActive ? 600 : 400,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          },

          ...(isActive && {
            '&::after': {
              content: '""',
              position: 'absolute',
              right: open ? 8 : '-50%',
              top: '50%',
              width: '6px',
              height: '6px',
              backgroundColor: gray[800],
              borderRadius: '50%',
              transform: open ? 'translateY(-50%)' : 'translate(50%, -50%)',
              animation: `${pulse} 2s infinite`,
            },
          }),
        },
        open ? { justifyContent: 'initial' } : { justifyContent: 'center' },
      ]}
    >
      <ListItemIcon
        sx={[
          {
            minWidth: 0,
            justifyContent: 'center',
            color: isActive ? gray[700] : gray[500],
          },
          open ? { mr: 3 } : { mr: 'auto' },
        ]}
      >
        {item.badge && item.badge > 0 ? (
          <Badge badgeContent={item.badge} color="error" max={99}>
            {item.icon}
          </Badge>
        ) : (
          item.icon
        )}
      </ListItemIcon>
      <ListItemText
        primary={item.text}
        sx={[
          {
            color: isActive ? gray[900] : gray[700],
            fontWeight: isActive ? 600 : 400,
          },
          open ? { opacity: 1 } : { opacity: 0 },
        ]}
      />
    </ListItemButton>
  );

  return (
    <ListItem disablePadding>
      <ConditionalTooltip
        show={!open}
        title={item.text}
        placement="right"
        arrow
      >
        {menuButton}
      </ConditionalTooltip>
    </ListItem>
  );
};
