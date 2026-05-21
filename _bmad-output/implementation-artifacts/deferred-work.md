# Deferred Work

## Deferred from: code review of 1-1-monorepo-scaffold-dev-environment (2026-05-21)

- **docker-compose credentials hardcoded** — README implies `.env` drives DB creds but compose uses inline `POSTGRES_*`; acceptable for story 1.1 db-only scaffold.

- **`VITE_API_URL` unused** — web does not call API yet; expected in later stories.

- **No CORS configuration** — needed when web calls API in story 1.3+.

- **No graceful shutdown handlers** — container lifecycle handling deferred to Epic 2.

- **`DATABASE_URL` unused** — API does not connect to DB yet; story 1.2 scope.

## Deferred from: code review of 1-2-todo-data-layer-create-list-api (2026-05-21)

- **CORS configured with `origin: true` for all environments** — Dev convenience; tighten before production deploy.

- **GET list has no pagination or result cap** — Out of story 1.2 scope; revisit when list size grows.

- **Swagger UI registered unconditionally at `/docs`** — Acceptable for v1 dev; gate by environment later.

- **No index on `created_at` despite list ordering** — Optimize when query performance becomes an issue.

- **`user_id` stored but not scoped in queries** — Intentional until auth (NFR4).

- **cors/helmet/swagger registered inline instead of separate plugin files** — File-structure preference, not an AC violation.

- **Health endpoint does not verify database connectivity** — Story 1.1 health check scope; extend when ops require it.

- **No graceful shutdown handlers (SIGINT/SIGTERM)** — Epic 2 container lifecycle scope.
