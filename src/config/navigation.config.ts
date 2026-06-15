import type { SvgIconComponent } from '@mui/icons-material';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import DiscountOutlinedIcon from '@mui/icons-material/DiscountOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import SegmentOutlinedIcon from '@mui/icons-material/SegmentOutlined';
import ShoppingBasketOutlinedIcon from '@mui/icons-material/ShoppingBasketOutlined';
import ViewAgendaOutlinedIcon from '@mui/icons-material/ViewAgendaOutlined';
import ViewCarouselOutlinedIcon from '@mui/icons-material/ViewCarouselOutlined';
import ViewListOutlinedIcon from '@mui/icons-material/ViewListOutlined';
import WidgetsOutlinedIcon from '@mui/icons-material/WidgetsOutlined';

import { routePaths } from '@routes/routePaths';

export type NavigationItem = {
  children?: NavigationItem[];
  icon: SvgIconComponent;
  label: string;
  path?: string;
};

export const dashboardNavigation: NavigationItem[] = [
  { icon: DashboardOutlinedIcon, label: 'Dashboard', path: routePaths.tenantAdmin.dashboard },
  {
    icon: ManageAccountsOutlinedIcon,
    label: 'User',
    path: routePaths.tenantAdmin.adminUser,
  },
  { icon: ViewCarouselOutlinedIcon, label: 'Carousel', path: routePaths.tenantAdmin.carousel },
  {
    icon: WidgetsOutlinedIcon,
    label: 'Icon',
    path: routePaths.tenantAdmin.storefrontIcons,
  },
  {
    icon: ShoppingBasketOutlinedIcon,
    label: 'Products',
    path: routePaths.tenantAdmin.products,
  },
  {
    icon: ViewListOutlinedIcon,
    label: 'Primary Category',
    path: routePaths.tenantAdmin.primaryCategory,
  },
  {
    icon: SegmentOutlinedIcon,
    label: 'Sub Category',
    path: routePaths.tenantAdmin.subCategory,
  },
  {
    icon: SegmentOutlinedIcon,
    label: 'Secondary Category',
    path: routePaths.tenantAdmin.secondaryCategory,
  },
  {
    icon: ViewAgendaOutlinedIcon,
    label: 'Product Sessions',
    path: routePaths.tenantAdmin.productSections,
  },
  { icon: DiscountOutlinedIcon, label: 'Promotion', path: routePaths.tenantAdmin.promotions },
  { icon: ReceiptLongOutlinedIcon, label: 'Orders', path: routePaths.tenantAdmin.orders },
  {
    icon: PeopleAltOutlinedIcon,
    label: 'Customers',
    path: routePaths.tenantAdmin.customers,
  },
  {
    icon: AccountTreeOutlinedIcon,
    label: 'Master',
    children: [
      {
        icon: MapOutlinedIcon,
        label: 'Regions',
        path: routePaths.tenantAdmin.regions,
      },
      {
        icon: PlaceOutlinedIcon,
        label: 'Townships',
        path: routePaths.tenantAdmin.townships,
      },
      {
        icon: LocalShippingOutlinedIcon,
        label: 'Delivery Fees',
        path: routePaths.tenantAdmin.deliveryFees,
      },
    ],
  },
];
