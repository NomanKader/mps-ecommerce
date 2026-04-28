# AV's Store Frontend

Production-ready SaaS e-commerce frontend starter built directly in the current folder with React, TypeScript, Vite, Material UI, Redux Toolkit, and React Query.

## Tech Stack

- React 19 + TypeScript
- Vite
- React Router
- Redux Toolkit + React Redux
- TanStack React Query
- Axios
- React Hook Form + Zod
- Material UI
- Vitest + Testing Library
- ESLint + Prettier

## Getting Started

### Install

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

### Test

```bash
npm run test
```

## Available Scripts

- `npm run dev` starts Vite.
- `npm run build` performs type-checking and production build.
- `npm run preview` serves the production bundle locally.
- `npm run lint` runs ESLint.
- `npm run lint:fix` runs ESLint with auto-fixes.
- `npm run format` runs Prettier.
- `npm run test` runs Vitest once.
- `npm run test:watch` runs Vitest in watch mode.

## Architecture

This project uses a feature-first layered structure designed for multi-developer enterprise work and SaaS growth.

- `src/app`: application bootstrap, providers, app shell, theme, and global styles.
- `src/pages`: route-level screens.
- `src/widgets`: page sections assembled from reusable domain pieces.
- `src/features`: business use cases and interaction-focused modules.
- `src/entities`: reusable domain models, types, and domain UI blocks.
- `src/shared`: generic APIs, components, validators, utilities, enums, and common helpers.
- `src/services`: cross-cutting integrations such as auth, tenant, storage, and analytics.
- `src/store`: Redux Toolkit state, slices, selectors, and typed hooks.
- `src/config`: environment parsing, navigation config, and app-level constants.

## Routing Model

- Public storefront routes under `MainLayout`
- Public auth routes under `AuthLayout`
- Authenticated customer routes guarded with `ProtectedRoute`
- Tenant admin routes guarded with `ProtectedRoute` and tenant admin roles under `DashboardLayout`

## Naming Conventions

- Components: `PascalCase`
- Hooks: `camelCase` prefixed with `use`
- Utilities and helpers: `camelCase`
- Shared constants and enums: descriptive domain-focused names
- Feature folders: singular business domain names where possible

## Folder Responsibilities

### `app`

Contains root providers, theme registration, app composition, and global styles.

### `features`

Contains domain actions, API wrappers, feature hooks, validators, and small UI pieces tied to user flows.

### `entities`

Contains reusable domain types and presentational blocks for business concepts such as product, tenant, and order.

### `shared`

Contains framework-agnostic or cross-domain building blocks, including UI primitives, API setup, helpers, and common validators.

### `services`

Contains integration-oriented modules that will later support token management, analytics, tenant branding, and SaaS configuration.

## SaaS Readiness Notes

- Tenant-aware config is centralized in `src/config/env.ts`, `src/config/app.config.ts`, and the tenant slice.
- Role placeholders are prepared for `super_admin`, `tenant_admin`, `staff`, and `customer`.
- Tenant settings, branding overrides, onboarding, subscription planning, and future RBAC can expand without restructuring the project.

## Current Scope

This setup intentionally focuses on the frontend foundation only:

- scalable source structure
- shared UI foundation
- routing and layouts
- store and query providers
- axios client and interceptor hooks
- sample domain types, APIs, hooks, validation schemas, and mock-backed screens

Backend logic, full authentication flows, and production integrations are intentionally deferred.
