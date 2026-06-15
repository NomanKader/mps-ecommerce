import { createBrowserRouter } from 'react-router-dom';

import { App } from '@app/App';
import { AuthLayout } from '@layouts/AuthLayout/AuthLayout';
import { DashboardLayout } from '@layouts/DashboardLayout/DashboardLayout';
import { MainLayout } from '@layouts/MainLayout/MainLayout';
import { ForgotPasswordPage } from '@pages/Auth/ForgotPasswordPage/ForgotPasswordPage';
import { LoginPage } from '@pages/Auth/LoginPage/LoginPage';
import { RegisterPage } from '@pages/Auth/RegisterPage/RegisterPage';
import { CartPage } from '@pages/CartPage/CartPage';
import { CatalogPage } from '@pages/CatalogPage/CatalogPage';
import { CheckoutPage } from '@pages/CheckoutPage/CheckoutPage';
import { AccountMenuPage } from '@pages/FavouritesPage/FavouritesPage';
import { HomePage } from '@pages/HomePage/HomePage';
import { NotFoundPage } from '@pages/NotFoundPage/NotFoundPage';
import { OrdersPage } from '@pages/OrdersPage/OrdersPage';
import { ProductDetailsPage } from '@pages/ProductDetailsPage/ProductDetailsPage';
import { AdminUserPage } from '@pages/TenantAdmin/AdminUserPage/AdminUserPage';
import { CarouselPage } from '@pages/TenantAdmin/CarouselPage/CarouselPage';
import { CategoriesPage } from '@pages/TenantAdmin/CategoriesPage/CategoriesPage';
import { CustomersPage } from '@pages/TenantAdmin/CustomersPage/CustomersPage';
import { DashboardPage } from '@pages/TenantAdmin/DashboardPage/DashboardPage';
import { DeliveryFeesPage } from '@pages/TenantAdmin/DeliveryFeesPage/DeliveryFeesPage';
import { OrdersManagementPage } from '@pages/TenantAdmin/OrdersManagementPage/OrdersManagementPage';
import { ProductsPage } from '@pages/TenantAdmin/ProductsPage/ProductsPage';
import { ProductSectionsPage } from '@pages/TenantAdmin/ProductSectionsPage/ProductSectionsPage';
import { PromotionsPage } from '@pages/TenantAdmin/PromotionsPage/PromotionsPage';
import { RegionsPage } from '@pages/TenantAdmin/RegionsPage/RegionsPage';
import { SecondaryCategoriesPage } from '@pages/TenantAdmin/SecondaryCategoriesPage/SecondaryCategoriesPage';
import { StorefrontIconsPage } from '@pages/TenantAdmin/StorefrontIconsPage/StorefrontIconsPage';
import { TownshipsPage } from '@pages/TenantAdmin/TownshipsPage/TownshipsPage';
import { ProtectedRoute } from '@routes/ProtectedRoute';
import { PublicRoute } from '@routes/PublicRoute';
import { routePaths } from '@routes/routePaths';

const accountRoutes = [
  { element: <AccountMenuPage />, path: routePaths.account },
  { element: <AccountMenuPage />, path: routePaths.accountAddresses },
  { element: <AccountMenuPage />, path: routePaths.accountAwards },
  { element: <AccountMenuPage />, path: routePaths.accountBrand },
  { element: <AccountMenuPage />, path: routePaths.accountCares },
  { element: <AccountMenuPage />, path: routePaths.accountChangePassword },
  { element: <AccountMenuPage />, path: routePaths.accountCollectionService },
  { element: <AccountMenuPage />, path: routePaths.accountDeleteAccount },
  { element: <AccountMenuPage />, path: routePaths.accountDeliveryMembership },
  { element: <AccountMenuPage />, path: routePaths.accountFavourites },
  { element: <AccountMenuPage />, path: routePaths.accountKitchen },
  { element: <AccountMenuPage />, path: routePaths.accountMedia },
  { element: <AccountMenuPage />, path: routePaths.accountOrders },
  { element: <AccountMenuPage />, path: routePaths.accountQuality },
  { element: <AccountMenuPage />, path: routePaths.accountReferFriends },
  { element: <AccountMenuPage />, path: routePaths.accountRegulars },
  { element: <AccountMenuPage />, path: routePaths.accountRewardPoints },
  { element: <AccountMenuPage />, path: routePaths.accountShoppingList },
  { element: <AccountMenuPage />, path: routePaths.accountStatement },
  { element: <AccountMenuPage />, path: routePaths.accountStatus },
  { element: <AccountMenuPage />, path: routePaths.accountStory },
  { element: <AccountMenuPage />, path: routePaths.accountVouchers },
  { element: <AccountMenuPage />, path: routePaths.accountVision },
  { element: <AccountMenuPage />, path: routePaths.accountWallet },
  { element: <AccountMenuPage />, path: routePaths.accountWioBank },
];

export const router = createBrowserRouter([
  {
    children: [
      {
        element: <MainLayout />,
        children: [
          { element: <HomePage />, path: routePaths.home },
          { element: <CatalogPage />, path: routePaths.catalog },
          { element: <CartPage />, path: routePaths.cart },
          { element: <ProductDetailsPage />, path: routePaths.productDetails },
        ],
      },
      {
        element: <PublicRoute />,
        children: [
          {
            element: <AuthLayout />,
            children: [
              { element: <LoginPage />, path: routePaths.auth.login },
              { element: <RegisterPage />, path: routePaths.auth.register },
              { element: <ForgotPasswordPage />, path: routePaths.auth.forgotPassword },
            ],
          },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={['customer', 'tenant_admin']} />,
        children: [
          {
            element: <MainLayout />,
            children: [
              { element: <CheckoutPage />, path: routePaths.checkout },
              { element: <OrdersPage />, path: routePaths.orders },
            ],
          },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={['customer']} />,
        children: [
          {
            element: <MainLayout />,
            children: accountRoutes,
          },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={['tenant_admin']} />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              { element: <DashboardPage />, path: routePaths.tenantAdmin.dashboard },
              { element: <AdminUserPage />, path: routePaths.tenantAdmin.adminUser },
              { element: <ProductsPage />, path: routePaths.tenantAdmin.products },
              { element: <CategoriesPage />, path: routePaths.tenantAdmin.categories },
              { element: <CategoriesPage />, path: routePaths.tenantAdmin.primaryCategory },
              {
                element: <SecondaryCategoriesPage />,
                path: routePaths.tenantAdmin.secondaryCategory,
              },
              { element: <CategoriesPage />, path: routePaths.tenantAdmin.subCategory },
              { element: <OrdersManagementPage />, path: routePaths.tenantAdmin.orders },
              { element: <CustomersPage />, path: routePaths.tenantAdmin.customers },
              { element: <ProductSectionsPage />, path: routePaths.tenantAdmin.productSections },
              { element: <CarouselPage />, path: routePaths.tenantAdmin.carousel },
              { element: <StorefrontIconsPage />, path: routePaths.tenantAdmin.storefrontIcons },
              { element: <PromotionsPage />, path: routePaths.tenantAdmin.promotions },
              { element: <RegionsPage />, path: routePaths.tenantAdmin.regions },
              { element: <TownshipsPage />, path: routePaths.tenantAdmin.townships },
              { element: <DeliveryFeesPage />, path: routePaths.tenantAdmin.deliveryFees },
            ],
          },
        ],
      },
      {
        element: <NotFoundPage />,
        path: routePaths.notFound,
      },
    ],
    element: <App />,
  },
]);
