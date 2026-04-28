import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Stack, Typography } from '@mui/material';
import { NavLink } from 'react-router-dom';

import { dashboardNavigation } from '@config/navigation.config';
import logoImage from '@assets/images/logo.png';

const drawerWidth = 280;

type SidebarProps = {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

const sidebarContent = (
  <Stack sx={{ height: '100%' }}>
    <Stack spacing={1} sx={{ alignItems: 'flex-start', px: 3, py: 2.5 }}>
      <Box
        alt="AV's Store"
        component="img"
        src={logoImage}
        sx={{ display: 'block', height: 76, maxWidth: '100%', objectFit: 'contain' }}
      />
      <Typography color="text.secondary" variant="caption">
        Admin Console
      </Typography>
    </Stack>
    <List sx={{ flex: 1, px: 2, py: 1 }}>
      {dashboardNavigation.map(({ icon: Icon, label, path }) => (
        <ListItemButton
          key={path}
          component={NavLink}
          sx={{
            '&.active': {
              backgroundColor: 'action.selected',
            },
            borderRadius: 1,
            mb: 0.5,
            minHeight: 48,
          }}
          to={path}
        >
          <ListItemIcon sx={{ minWidth: 42 }}>
            <Icon />
          </ListItemIcon>
          <ListItemText primary={label} />
        </ListItemButton>
      ))}
    </List>
  </Stack>
);

export const Sidebar = ({ mobileOpen = false, onMobileClose }: SidebarProps) => {
  const paperSx = {
    borderColor: 'divider',
    borderRight: '1px solid',
    boxSizing: 'border-box',
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
        {sidebarContent}
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
        {sidebarContent}
      </Drawer>
    </>
  );
};

export const adminSidebarWidth = drawerWidth;
