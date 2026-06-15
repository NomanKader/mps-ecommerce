# Storefront Authentication API

The storefront registration screen uses phone verification before creating an account. Send the fixed tenant id in `x-tenant-id`, for example `x-tenant-id: 6a2b8308c464d5a188a259eb`.

## Registration Flow

### 1. Request OTP

`POST /api/v1/auth/otp/request`

```json
{
  "phone": "+959123456789"
}
```

The OTP expires after five minutes by default. Resend requests are rate-limited. In development and test environments, the response includes `developmentOtp` so the flow can be tested without an SMS provider. Production responses do not expose the OTP; connect an SMS provider before production deployment.

### 2. Register User

`POST /api/v1/auth/register`

```json
{
  "name": "Ayesha Rahman",
  "email": "ayesha@example.com",
  "phone": "+959123456789",
  "otp": "123456",
  "password": "password123"
}
```

Registration verifies and consumes the OTP, creates a customer account, and returns `user` and `accessToken`. Public registration always creates a `customer` role.

## Sign-In Flow

### Sign In

`POST /api/v1/auth/login`

For tenant storefront sign-in, send `x-tenant-id` with the fixed tenant id that was loaded when the site booted. System-user sign-in should not send `x-tenant-id`.

```json
{
  "email": "ayesha@example.com",
  "password": "password123",
  "rememberMe": true
}
```

The response includes `user` and `accessToken`. Store `user.tenantId` after login and send it as `x-tenant-id` for later tenant-scoped requests. `rememberMe: true` uses the longer token duration configured by `JWT_REMEMBER_ME_EXPIRES_IN`.

### Restore Session

`GET /api/v1/auth/me`

Send `Authorization: Bearer <accessToken>`.

### Sign Out

`POST /api/v1/auth/logout`

Send `Authorization: Bearer <accessToken>`. Access tokens are stateless, so the frontend must remove its stored token after a successful response.

## Follow-Up Features

- SMS provider delivery for production OTP messages.
- Forgot-password OTP and reset-password endpoints.
- Google OAuth configuration and callback endpoints.
