# Admin Dashboard API

## Functionality From Screens

- Dashboard: tenant summary, catalog count, order count, revenue, weekly sales chart, work queue, low stock alerts, recent orders.
- Products: search/filter products, list SKU/name/category/price/stock/rating, create product, update product, soft-delete product.
- Categories: search categories, list storefront category cards with icon/color/item count/subcategories, create category, update category, soft-delete category.
- Orders: order KPIs, search/filter by status/date/customer/township, list orders, update fulfillment status, cancel orders through status update.
- Customers: search/filter customers by name/email/segment/date fields, list segment/order/spend/last-order data.
- Promotions: search promotions, list code/discount/date/status/uses, create promotion, update promotion, soft-delete promotion.
- Delivery fees: search/filter delivery fees by region, list township/fee/free-over/ETA/status, create delivery fee, update delivery fee, soft-delete delivery fee.

## Routes

All routes are tenant-aware. Send `x-tenant-id: demo` unless using token/subdomain tenancy.

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/v1/admin/dashboard` | Dashboard summary, charts, queues, alerts |
| GET | `/api/v1/admin/products` | List products with `search`, `category`, `stock=low`, `rating` filters |
| POST | `/api/v1/admin/products` | Create product |
| PUT | `/api/v1/admin/products/:id` | Update product |
| DELETE | `/api/v1/admin/products/:id` | Soft-delete product |
| GET | `/api/v1/admin/categories` | List categories with `search` filter |
| POST | `/api/v1/admin/categories` | Create category |
| PUT | `/api/v1/admin/categories/:id` | Update category |
| DELETE | `/api/v1/admin/categories/:id` | Soft-delete category |
| GET | `/api/v1/admin/orders/stats` | Order KPI cards |
| GET | `/api/v1/admin/orders` | List orders with `search`, `status`, `from`, `to` filters |
| PATCH | `/api/v1/admin/orders/:id/status` | Change order status |
| GET | `/api/v1/admin/customers` | List customers with `search`, `segment` filters |
| GET | `/api/v1/admin/promotions` | List promotions with `search` filter |
| POST | `/api/v1/admin/promotions` | Create promotion |
| PUT | `/api/v1/admin/promotions/:id` | Update promotion |
| DELETE | `/api/v1/admin/promotions/:id` | Soft-delete promotion |
| GET | `/api/v1/admin/delivery-fees` | List delivery fees with `search`, `region` filters |
| POST | `/api/v1/admin/delivery-fees` | Create delivery fee |
| PUT | `/api/v1/admin/delivery-fees/:id` | Update delivery fee |
| DELETE | `/api/v1/admin/delivery-fees/:id` | Soft-delete delivery fee |
