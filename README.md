# MPS Ecommerce Server

Production-ready backend starter for a multi-tenant SaaS e-commerce platform built with Node.js, Express, MongoDB, Mongoose, and TypeScript.

## Overview

This repository provides the backend foundation for a Kibsons-style multi-tenant commerce platform. It focuses on maintainable architecture, strong typing, shared cross-cutting concerns, and SaaS-ready module boundaries rather than full business workflows.

## Tech Stack

- Node.js
- Express.js
- TypeScript
- MongoDB + Mongoose
- Zod validation
- Winston logging
- Jest + Supertest
- ESLint + Prettier

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template:

```bash
cp .env.example .env
```

3. Update the environment variables.

4. Start development:

```bash
npm run dev
```

## Scripts

- `npm run dev` - Start the API in development with hot reload
- `npm run build` - Compile TypeScript and rewrite path aliases
- `npm start` - Run the compiled production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix lint issues where possible
- `npm run format` - Format the codebase with Prettier
- `npm test` - Run tests once
- `npm run test:watch` - Run tests in watch mode

## Environment Variables

See `.env.example` for the full template.

- `NODE_ENV` - Runtime mode
- `PORT` - HTTP server port
- `API_PREFIX` - Versioned API prefix, default `/api/v1`
- `MONGODB_URI` - MongoDB connection string
- `JWT_ACCESS_SECRET` - Access token signing secret
- `JWT_ACCESS_EXPIRES_IN` - Access token lifetime
- `CORS_ORIGIN` - Allowed origin for browser clients
- `APP_NAME` - App display name for logs and docs
- `LOG_LEVEL` - Winston log level
- `TENANT_HEADER_KEY` - Header used to resolve tenant context

## Folder Structure

```text
src/
  app.ts
  server.ts
  config/
  common/
  core/
  middlewares/
  modules/
  routes/
  docs/
  shared/
  utils/
  tests/
```

### Architecture Notes

- `config`: environment parsing, constants, logger, database connection
- `common`: enums, shared types, interfaces, lightweight helpers
- `core`: reusable base abstractions and platform-level primitives
- `middlewares`: cross-cutting HTTP concerns such as auth, tenancy, validation, error handling
- `modules`: domain-oriented feature modules with controller, service, repository, model, validation, and route layers
- `routes`: centralized API route registration
- `shared`: future-ready SaaS extension points such as feature flags and DTO mappers
- `utils`: generic response, error, async, password, and JWT helpers

## Current Modules

- `auth`
- `users`
- `tenants`
- `products`
- `categories`
- `carts`
- `orders`

Each module contains sample code and placeholders designed for future expansion.

## SaaS Readiness

The starter already prepares the codebase for:

- tenant resolution through header, subdomain, or token claims
- tenant-aware data models with `tenantId`
- RBAC roles: `system_admin`, `super_admin`, `tenant_admin`, `staff`, `customer`
- future subscription plans, tenant settings, branding, and feature flags
- clean separation between route, controller, service, and repository responsibilities

## Running in Production

```bash
npm run build
npm start
```

## Testing

The project includes Jest + Supertest setup. Expand `src/tests/unit` and `src/tests/integration` as modules gain business logic.

## Future Extension Notes

- add refresh token strategy and session management
- add tenant onboarding and subscription plan workflows
- add product catalog, inventory, checkout, and payment domain rules
- add RBAC policy enforcement and feature-flag evaluation
- add observability, metrics, and tracing integration
