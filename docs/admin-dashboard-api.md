# Admin Dashboard API

## Functionality From Screens

- Dashboard: tenant summary, catalog count, order count, revenue, weekly sales chart, work queue, low stock alerts, recent orders.
- Products: search/filter products, list SKU/name/category/subcategory/price/stock/rating, create product, update product, soft-delete product.
- Categories: search categories, list storefront category cards with icon/color/item count/subcategories, create category, update category, soft-delete category.
- Orders: order KPIs, search/filter by status/date/customer/township, list orders, update fulfillment status, cancel orders through status update.
- Customers: search/filter customers by name/email/segment/date fields, list segment/order/spend/last-order data.
- Promotions: search promotions, list code/discount/date/status/uses, create promotion, update promotion, soft-delete promotion.
- Delivery fees: search/filter delivery fees by region, list township/fee/free-over/ETA/status, create delivery fee, update delivery fee, soft-delete delivery fee.
- Admin user/header settings: edit tenant admin name/email/active status and storefront top-bar copy/phone fields.
- Carousel: manage tenant-scoped hero/showcase slides with optional uploaded images.
- Storefront icons: manage featured/merchandising highlight icons with labels, colors, targets, order, and status.
- Product sections: assign existing tenant products into homepage sections.

## Routes

All routes are tenant-aware. Send the fixed tenant id in `x-tenant-id`, for example `x-tenant-id: 6a2b8308c464d5a188a259eb`, unless using token/subdomain tenancy.

Product create/update supports `multipart/form-data` with an optional `image` file field. Images must be `image/*` and no larger than 5MB. Product image files are uploaded to S3; configure `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, and `S3_BUCKET_NAME` for server-side S3 uploads. API responses include a signed `imageUrl`.

Admin routes require `Authorization: Bearer <tenant_admin token>`; the token includes the fixed tenant id. Storefront routes require tenant context from `x-tenant-id` or subdomain and only return active storefront records.

| Method | Route                                             | Purpose                                                                 |
| ------ | ------------------------------------------------- | ----------------------------------------------------------------------- |
| GET    | `/api/v1/admin/dashboard`                         | Dashboard summary, charts, queues, alerts                               |
| GET    | `/api/v1/admin/products`                          | List products with `search`, `category`, `stock=low`, `rating` filters  |
| POST   | `/api/v1/admin/products`                          | Create product                                                          |
| PUT    | `/api/v1/admin/products/:id`                      | Update product                                                          |
| DELETE | `/api/v1/admin/products/:id`                      | Soft-delete product                                                     |
| GET    | `/api/v1/admin/profile`                           | Fetch current tenant admin and header settings                          |
| PUT    | `/api/v1/admin/profile`                           | Update current tenant admin and header settings                         |
| GET    | `/api/v1/admin/carousel?placement=hero`           | List carousel slides                                                    |
| POST   | `/api/v1/admin/carousel`                          | Create carousel slide, optional multipart `image`                       |
| PUT    | `/api/v1/admin/carousel/:id`                      | Update carousel slide, optional multipart `image` or `removeImage=true` |
| DELETE | `/api/v1/admin/carousel/:id`                      | Soft-delete carousel slide                                              |
| GET    | `/api/v1/admin/storefront-icons?section=featured` | List storefront icons                                                   |
| POST   | `/api/v1/admin/storefront-icons`                  | Create storefront icon                                                  |
| PUT    | `/api/v1/admin/storefront-icons/:id`              | Update storefront icon                                                  |
| DELETE | `/api/v1/admin/storefront-icons/:id`              | Soft-delete storefront icon                                             |
| GET    | `/api/v1/admin/product-sections`                  | List section definitions and assignments                                |
| POST   | `/api/v1/admin/product-sections/assignments`      | Assign an existing product to a section                                 |
| PUT    | `/api/v1/admin/product-sections/assignments/:id`  | Update section assignment                                               |
| DELETE | `/api/v1/admin/product-sections/assignments/:id`  | Soft-delete section assignment                                          |
| GET    | `/api/v1/admin/page-segments`                     | List homepage page segments                                             |
| POST   | `/api/v1/admin/page-segments`                     | Create page segment with optional nested images                         |
| PUT    | `/api/v1/admin/page-segments/:id`                 | Update page segment with optional nested images/removals                |
| DELETE | `/api/v1/admin/page-segments/:id`                 | Soft-delete page segment                                                |
| GET    | `/api/v1/admin/categories`                        | List categories with `search` filter                                    |
| POST   | `/api/v1/admin/categories`                        | Create category                                                         |
| PUT    | `/api/v1/admin/categories/:id`                    | Update category                                                         |
| DELETE | `/api/v1/admin/categories/:id`                    | Soft-delete category                                                    |
| GET    | `/api/v1/admin/orders/stats`                      | Order KPI cards                                                         |
| GET    | `/api/v1/admin/orders`                            | List orders with `search`, `status`, `from`, `to` filters               |
| PATCH  | `/api/v1/admin/orders/:id/status`                 | Change order status                                                     |
| GET    | `/api/v1/admin/customers`                         | List customers with `search`, `segment` filters                         |
| GET    | `/api/v1/admin/promotions`                        | List promotions with `search` filter                                    |
| POST   | `/api/v1/admin/promotions`                        | Create promotion                                                        |
| PUT    | `/api/v1/admin/promotions/:id`                    | Update promotion                                                        |
| DELETE | `/api/v1/admin/promotions/:id`                    | Soft-delete promotion                                                   |
| GET    | `/api/v1/admin/delivery-fees`                     | List delivery fees with `search`, `region` filters                      |
| POST   | `/api/v1/admin/delivery-fees`                     | Create delivery fee                                                     |
| PUT    | `/api/v1/admin/delivery-fees/:id`                 | Update delivery fee                                                     |
| DELETE | `/api/v1/admin/delivery-fees/:id`                 | Soft-delete delivery fee                                                |

## Storefront Routes

| Method | Route                                            | Purpose                                          |
| ------ | ------------------------------------------------ | ------------------------------------------------ |
| GET    | `/api/v1/storefront/header-settings`             | Header admin/profile settings for current tenant |
| GET    | `/api/v1/storefront/carousel?placement=hero`     | Active hero slides sorted by `sortOrder`         |
| GET    | `/api/v1/storefront/carousel?placement=showcase` | Active showcase slides sorted by `sortOrder`     |
| GET    | `/api/v1/storefront/icons?section=featured`      | Active featured icons                            |
| GET    | `/api/v1/storefront/icons?section=merchandising` | Active merchandising icons                       |
| GET    | `/api/v1/storefront/product-sections`            | Active products grouped by homepage section      |
| GET    | `/api/v1/storefront/page-segments`               | Active homepage page segments                    |

## Merchandising Payloads

`PUT /api/v1/admin/profile`

```json
{
  "firstName": "Tenant",
  "lastName": "Admin",
  "email": "admin@demo.com",
  "isActive": true,
  "deliveryHeadline": "Delivery all over UAE",
  "supportPhoneCountryCode": "+971",
  "supportPhoneNumber": "800 287",
  "topBarTagline": "Sustainable Grocery Shopping"
}
```

`POST /api/v1/admin/carousel` accepts JSON or multipart form data:

```json
{
  "placement": "hero",
  "title": "Fresh organic picks",
  "description": "Seasonal produce delivered fast.",
  "eyebrow": "New",
  "cta": "Shop now",
  "targetCategoryId": "produce",
  "targetSearch": "organic",
  "sortOrder": 1,
  "status": "active",
  "startsAt": "2026-06-09T00:00:00.000Z"
}
```

`POST /api/v1/admin/storefront-icons`

```json
{
  "section": "featured",
  "label": "New arrivals",
  "icon": "🆕",
  "color": "#166534",
  "surfaceColor": "#dcfce7",
  "status": "active"
}
```

`POST /api/v1/admin/product-sections/assignments`

```json
{
  "sectionId": "top-offers",
  "productId": "PRODUCT_ID",
  "sortOrder": 1,
  "status": "active"
}
```

`POST /api/v1/admin/page-segments` accepts multipart form data. Use `image` for the segment image and nested fields such as `topCarousel.0.image`, `afterNewProductsCarousel.0.image`, and `haveYouSeenCards.0.image` for slide/card images.

```json
{
  "title": "Featured smartphone gallery",
  "primaryCategoryId": "category-id",
  "displaySlot": "after-storefront-icons",
  "icon": "🛍️",
  "sortOrder": 1,
  "status": "active",
  "topCarousel": [{ "text": "Launch offers", "sortOrder": 0 }],
  "afterNewProductsCarousel": [],
  "haveYouSeenCards": [{ "text": "Accessories you may like", "sortOrder": 0 }]
}
```
