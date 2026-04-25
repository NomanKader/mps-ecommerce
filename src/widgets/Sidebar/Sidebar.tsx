import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
import { NavLink } from 'react-router-dom';

import { dashboardNavigation } from '@config/navigation.config';

const drawerWidth = 280;

export const Sidebar = () => (
  <Drawer
    slotProps={{
      paper: {
        sx: {
          borderColor: 'divider',
          borderRight: '1px solid',
          boxSizing: 'border-box',
          width: drawerWidth,
        },
      },
    }}
    sx={{ display: { md: 'block', xs: 'none' }, width: drawerWidth }}
    variant="permanent"
  >
    <Toolbar />
    <List sx={{ px: 2, py: 3 }}>
      {dashboardNavigation.map(({ icon: Icon, label, path }) => (
        <ListItemButton
          key={path}
          component={NavLink}
          sx={{
            '&.active': {
              backgroundColor: 'action.selected',
            },
            borderRadius: 3,
            mb: 0.5,
          }}
          to={path}
        >
          <ListItemIcon>
            <Icon />
          </ListItemIcon>
          <ListItemText primary={label} />
        </ListItemButton>
      ))}
    </List>
  </Drawer>
);
