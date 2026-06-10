import type { SvgIconComponent } from '@mui/icons-material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import DiscountOutlinedIcon from '@mui/icons-material/DiscountOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import ViewAgendaOutlinedIcon from '@mui/icons-material/ViewAgendaOutlined';
import ViewCarouselOutlinedIcon from '@mui/icons-material/ViewCarouselOutlined';
import ViewListOutlinedIcon from '@mui/icons-material/ViewListOutlined';
import WidgetsOutlinedIcon from '@mui/icons-material/WidgetsOutlined';

import { routePaths } from '@routes/routePaths';

export type NavigationItem = {
  icon: SvgIconComponent;
  label: string;
  path: string;
};

export const dashboardNavigation: NavigationItem[] = [
  { icon: DashboardOutlinedIcon, label: 'Dashboard', path: routePaths.tenantAdmin.dashboard },
  { icon: ManageAccountsOutlinedIcon, label: 'Admin User', path: routePaths.tenantAdmin.adminUser },
  { icon: Inventory2OutlinedIcon, label: 'Products', path: routePaths.tenantAdmin.products },
  { icon: ViewListOutlinedIcon, label: 'Categories', path: routePaths.tenantAdmin.categories },
  { icon: ReceiptLongOutlinedIcon, label: 'Orders', path: routePaths.tenantAdmin.orders },
  { icon: PeopleAltOutlinedIcon, label: 'Customers', path: routePaths.tenantAdmin.customers },
  {
    icon: ViewAgendaOutlinedIcon,
    label: 'Product Sections',
    path: routePaths.tenantAdmin.productSections,
  },
  { icon: ViewCarouselOutlinedIcon, label: 'Carousel', path: routePaths.tenantAdmin.carousel },
  {
    icon: WidgetsOutlinedIcon,
    label: 'Storefront Icons',
    path: routePaths.tenantAdmin.storefrontIcons,
  },
  { icon: DiscountOutlinedIcon, label: 'Promotions', path: routePaths.tenantAdmin.promotions },
  {
    icon: LocalShippingOutlinedIcon,
    label: 'Delivery Fees',
    path: routePaths.tenantAdmin.deliveryFees,
  },
];
