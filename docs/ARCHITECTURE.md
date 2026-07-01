# Backend Architecture

This server uses modular Express services with tenant-scoped Mongoose models. Keep modules small and isolate infrastructure concerns from domain workflows.

## Layers

- `config`: environment and infrastructure configuration.
- `core`: database setup, response primitives, base abstractions.
- `middlewares`: transport-level request processing.
- `modules`: domain modules. Each module owns routes, validation, controller, service, model/types where applicable.
- `shared`: cross-module constants, libraries, mappers, and infrastructure services.
- `scripts`: operational data setup and migrations. Keep scripts idempotent and avoid account mutation unless explicitly required.

## Rules

- Controllers should validate request shape and delegate to services.
- Services should own domain workflows, not Express concerns.
- Shared upload, storage, and third-party concerns belong in `shared`.
- Avoid new logic in `admin.service.ts` when it can be isolated into smaller domain services.
- Use tenant-scoped models through `getTenantModels` for tenant data.
- Keep seed data idempotent and scoped to the intended tenant database.

## Current Refactor Direction

- Split `admin.service.ts` by merchandising, products, customers, delivery, and page segments.
- Split `scripts/seed-admin-dashboard.ts` into seed-data factories and orchestration steps.
- Keep upload size limits and upload error handling centralized in `shared/constants` and `shared/lib`.
