import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import {
  Box,
  Collapse,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import { Fragment } from 'react';
import { useSelector } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';

import { dashboardNavigation, type NavigationItem } from '@config/navigation.config';
import logoImage from '@assets/images/logo.png';
import type { RootState } from '@store/index';

const drawerWidth = 280;

type SidebarProps = {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

type SidebarContentProps = {
  onMobileClose?: () => void;
};

const SidebarContent = ({ onMobileClose }: SidebarContentProps) => {
  const location = useLocation();
  const user = useSelector((state: RootState) => state.auth.user);
  const logoUrl = user?.logoUrl;
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const canViewItem = (item: NavigationItem) =>
    !item.requiredRoles?.length || (user ? item.requiredRoles.includes(user.role) : false);

  const toggleGroup = (label: string) => {
    setOpenGroups((current) => ({ ...current, [label]: !current[label] }));
  };

  const renderNavigationItem = ({ children, icon: Icon, label, path }: NavigationItem) => {
    const visibleChildren = children?.filter(canViewItem);

    if (visibleChildren?.length) {
      const hasActiveChild = visibleChildren.some((child) => child.path === location.pathname);
      const isOpen = openGroups[label] ?? hasActiveChild;

      return (
        <Fragment key={label}>
          <ListItemButton
            aria-expanded={isOpen}
            component="button"
            onClick={() => toggleGroup(label)}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              minHeight: 48,
              width: '100%',
            }}
          >
            <ListItemIcon sx={{ minWidth: 42 }}>
              <Icon />
            </ListItemIcon>
            <ListItemText primary={label} />
            {isOpen ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
          </ListItemButton>
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {visibleChildren.map((child) => {
                const ChildIcon = child.icon;

                return (
                  <ListItemButton
                    key={child.path ?? child.label}
                    component={NavLink}
                    onClick={onMobileClose}
                    sx={{
                      '&.active': {
                        backgroundColor: 'action.selected',
                      },
                      borderRadius: 1,
                      mb: 0.5,
                      minHeight: 44,
                      pl: 4,
                    }}
                    to={child.path ?? '#'}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <ChildIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={child.label} />
                  </ListItemButton>
                );
              })}
            </List>
          </Collapse>
        </Fragment>
      );
    }

    return (
      <ListItemButton
        key={path ?? label}
        component={NavLink}
        onClick={onMobileClose}
        sx={{
          '&.active': {
            backgroundColor: 'action.selected',
          },
          borderRadius: 1,
          mb: 0.5,
          minHeight: 48,
        }}
        to={path ?? '#'}
      >
        <ListItemIcon sx={{ minWidth: 42 }}>
          <Icon />
        </ListItemIcon>
        <ListItemText primary={label} />
      </ListItemButton>
    );
  };

  return (
    <Stack sx={{ height: '100%' }}>
      <Stack spacing={1} sx={{ alignItems: 'flex-start', px: 3, py: 2.5 }}>
        <Box
          alt="AV's Store"
          component="img"
          src={logoUrl || logoImage}
          sx={{ display: 'block', height: 76, maxWidth: '100%', objectFit: 'contain' }}
        />
        <Typography color="text.secondary" variant="caption">
          Admin Console
        </Typography>
      </Stack>
      <List sx={{ flex: 1, px: 2, py: 1 }}>
        {dashboardNavigation.filter(canViewItem).map(renderNavigationItem)}
      </List>
    </Stack>
  );
};

export const Sidebar = ({ mobileOpen = false, onMobileClose }: SidebarProps) => {
  const paperSx = {
    backdropFilter: 'blur(28px) saturate(145%)',
    background: 'linear-gradient(180deg, rgba(255,255,255,0.72) 0%, rgba(255,247,239,0.54) 100%)',
    borderColor: 'rgba(255, 255, 255, 0.64)',
    borderRight: '1px solid',
    boxSizing: 'border-box',
    boxShadow: '18px 0 54px rgba(83, 36, 23, 0.08)',
    width: drawerWidth,
  } as const;

  return (
    <>
      <Drawer
        ModalProps={{ keepMounted: true }}
        onClose={onMobileClose}
        open={mobileOpen}
        slotProps={{
          paper: {
            sx: paperSx,
          },
        }}
        sx={{ display: { md: 'none', xs: 'block' } }}
        variant="temporary"
      >
        <SidebarContent onMobileClose={onMobileClose} />
      </Drawer>
      <Drawer
        slotProps={{
          paper: {
            sx: paperSx,
          },
        }}
        sx={{ display: { md: 'block', xs: 'none' }, width: drawerWidth }}
        variant="permanent"
      >
        <SidebarContent />
      </Drawer>
    </>
  );
};
