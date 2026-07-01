# Frontend Architecture

This project follows a feature-sliced React structure. Keep new code inside the narrowest layer that owns the behavior.

## Layers

- `app`: application providers, theme, router, store bootstrap.
- `pages`: route-level composition only. Pages should orchestrate data and layout, not hold reusable business rules.
- `widgets`: reusable page sections that combine entities/features.
- `features`: user actions and domain workflows. Keep API clients, hooks, feature UI, utilities, and types here.
- `entities`: reusable domain objects such as product, cart, user, order.
- `shared`: framework-agnostic utilities, base UI, API client, constants, styles.

## Rules

- Move repeated filtering, mapping, formatting, and matching into `features/*/utils` or `shared/utils`.
- Move reusable route sections into `features/*/ui` or `widgets`.
- Keep `pages/*` focused on data loading, state selection, and composing sections.
- Do not import from `pages` into lower layers.
- Do not put tenant/storefront-specific behavior in `shared`.
- Prefer backend-normalized types at API boundaries, then map once into frontend domain types.

## Current Refactor Direction

- Large pages such as `HomePage`, `CatalogPage`, and admin pages should be reduced incrementally by extracting section components and feature utilities.
- Storefront merchandising logic belongs under `features/home`.
- Upload validation and other cross-page browser rules belong under `shared/utils`.
