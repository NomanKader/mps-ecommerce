import type { SvgIconComponent } from '@mui/icons-material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import DiscountOutlinedIcon from '@mui/icons-material/DiscountOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import ViewListOutlinedIcon from '@mui/icons-material/ViewListOutlined';

import { routePaths } from '@routes/routePaths';

export type NavigationItem = {
  icon: SvgIconComponent;
  label: string;
  path: string;
};

export const dashboardNavigation: NavigationItem[] = [
  { icon: DashboardOutlinedIcon, label: 'Dashboard', path: routePaths.tenantAdmin.dashboard },
  { icon: Inventory2OutlinedIcon, label: 'Products', path: routePaths.tenantAdmin.products },
  { icon: ViewListOutlinedIcon, label: 'Categories', path: routePaths.tenantAdmin.categories },
  { icon: ReceiptLongOutlinedIcon, label: 'Orders', path: routePaths.tenantAdmin.orders },
  { icon: PeopleAltOutlinedIcon, label: 'Customers', path: routePaths.tenantAdmin.customers },
  { icon: DiscountOutlinedIcon, label: 'Promotions', path: routePaths.tenantAdmin.promotions },
  { icon: SettingsOutlinedIcon, label: 'Settings', path: routePaths.tenantAdmin.settings },
];
