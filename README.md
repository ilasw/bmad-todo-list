# todo-list

Full-stack todo app monorepo: React (Vite) + Fastify API + PostgreSQL.

## Prerequisites

- Node.js 20+
- pnpm
- Docker (for local PostgreSQL)

## Setup

1. **Clone and install dependencies**

   ```bash
   git clone <repo-url> todo-list
   cd todo-list
   pnpm install
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` if you need different ports or database credentials.

3. **Start PostgreSQL**

   ```bash
   docker compose up db
   ```

   The database listens on `localhost:5432` by default (override with `POSTGRES_HOST_PORT` in `.env` if port 5432 is already in use — update `DATABASE_URL` to use the same port).

5. **Run database migrations**

   ```bash
   pnpm --filter @todo-list/api db:migrate
   ```

6. **Run the dev servers**

   ```bash
   pnpm dev
   ```

   This starts all workspaces in parallel (api, web, and shared type-check watcher):

   - **API:** http://localhost:3000
   - **Web:** http://localhost:5173

## Verify

```bash
curl http://localhost:3000/health
# {"status":"ok"}

curl http://localhost:3000/api/v1/todos
# []

curl -X POST http://localhost:3000/api/v1/todos \
  -H 'Content-Type: application/json' \
  -d '{"description":"Buy groceries"}'
# HTTP 201 with todo JSON (id, description, completed, createdAt, tagIds)

curl -X POST http://localhost:3000/api/v1/todos \
  -H 'Content-Type: application/json' \
  -d '{"description":"<string longer than 2500 characters>"}'
# HTTP 400 with {"error":{"code":"VALIDATION_ERROR",...}}
```

Open http://localhost:5173 in your browser — you should see the placeholder page.

## Project structure

```
apps/
  api/     Fastify 5 API (TypeScript, ESM)
  web/     Vite React SPA (TypeScript)
packages/
  shared/  Shared Zod schemas and types
```

## Scripts

| Command      | Description                          |
|--------------|--------------------------------------|
| `pnpm dev`   | Start API and web dev servers        |
| `pnpm build` | Build all workspace packages         |
