# @todo-list/api

Fastify 5 API (TypeScript, ESM) with Drizzle ORM and PostgreSQL.

## Scripts

| Command            | Description                         |
|--------------------|-------------------------------------|
| `pnpm dev`         | Start dev server with hot reload    |
| `pnpm build`       | Compile TypeScript to `dist/`       |
| `pnpm start`       | Run compiled server                 |
| `pnpm test`        | Run API tests                       |
| `pnpm db:generate` | Generate Drizzle migrations         |
| `pnpm db:migrate`  | Apply migrations to the database    |

## Database migrations

Ensure PostgreSQL is running (`docker compose up db` from the repo root) and `DATABASE_URL` is set in the root `.env`.

```bash
pnpm db:generate   # after schema changes in src/db/schema.ts
pnpm db:migrate    # apply pending migrations
```

Migration SQL files are stored in `drizzle/`.

## Endpoints

- `GET /health` — returns `{ "status": "ok" }`
- `GET /api/v1/todos` — list todos (camelCase JSON)
- `POST /api/v1/todos` — create todo (`{ "description": "..." }`, HTTP 201)
- `GET /docs` — Swagger UI (OpenAPI from Zod schemas)

Loads environment variables from the repo root `.env` file (see root `.env.example`).

## Manual verification

```bash
curl http://localhost:3000/api/v1/todos
curl -X POST http://localhost:3000/api/v1/todos \
  -H 'Content-Type: application/json' \
  -d '{"description":"Buy groceries"}'
curl -X POST http://localhost:3000/api/v1/todos \
  -H 'Content-Type: application/json' \
  -d '{"description":""}'
```
