# Access Management API

## Create System User

`POST /api/v1/users`

This endpoint bootstraps a tenantless `system_admin` user. It does not require an access token or tenant header.

Request body:

```json
{
  "email": "system.admin@example.com",
  "firstName": "System",
  "lastName": "Admin",
  "password": "password123"
}
```

The API always creates this user with the `system_admin` role. `tenantSlug`, `tenantId`, and `role` are not accepted in this request.

## Sign In System User

`POST /api/v1/auth/login`

Do not send a tenant header for system-user sign in.

Request body:

```json
{
  "email": "system.admin@example.com",
  "password": "password123",
  "rememberMe": true
}
```

Use the returned access token as the system user token for tenant and tenant-admin creation.

## Create Tenant Admin

`POST /api/v1/tenants/admins`

Send a `system_admin` access token:

```text
Authorization: Bearer <accessToken>
```

Request body:

```json
{
  "tenantId": "6a2b8308c464d5a188a259eb",
  "email": "tenant.admin@example.com",
  "firstName": "Tenant",
  "lastName": "Admin",
  "password": "password123"
}
```

The tenant must already exist. Use the `tenantId` returned by `POST /api/v1/tenants`; it is fixed for that tenant, its tenant database, JWT tenant claims, and all tenant-scoped operations. The API always creates the user with the `tenant_admin` role for that tenant. The role cannot be overridden in the request body.
