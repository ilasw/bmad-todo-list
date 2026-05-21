# Deferred Work

## Deferred from: code review of 1-1-monorepo-scaffold-dev-environment (2026-05-21)

- **docker-compose credentials hardcoded** — README implies `.env` drives DB creds but compose uses inline `POSTGRES_*`; acceptable for story 1.1 db-only scaffold.

- **`VITE_API_URL` unused** — web does not call API yet; expected in later stories.

- **No CORS configuration** — needed when web calls API in story 1.3+.

- **No graceful shutdown handlers** — container lifecycle handling deferred to Epic 2.

- **`DATABASE_URL` unused** — API does not connect to DB yet; story 1.2 scope.
