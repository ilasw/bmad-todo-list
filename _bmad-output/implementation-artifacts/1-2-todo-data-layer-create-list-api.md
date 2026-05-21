# Story 1.2: Todo Data Layer & Create/List API

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want my todos stored persistently and accessible via a REST API,
so that tasks survive refresh and the frontend can load and create them reliably.

## Acceptance Criteria

1. **Given** PostgreSQL is running and migrations have been applied **When** I call `GET /api/v1/todos` **Then** I receive a JSON array of todos with `id`, `description`, `completed`, `createdAt`, and `tagIds` (empty array initially) in camelCase **And** each todo includes a `createdAt` ISO 8601 UTC timestamp
2. **Given** a valid request body `{ "description": "Buy groceries" }` **When** I call `POST /api/v1/todos` **Then** a new todo is created with `completed: false` and returned with HTTP 201 **And** the description is persisted in the `todos` table
3. **Given** a request with an empty description or description exceeding 2500 characters **When** I call `POST /api/v1/todos` **Then** the API returns HTTP 400 with error shape `{ error: { code: "VALIDATION_ERROR", message, details } }`
4. **Given** the Drizzle schema is defined **When** migrations are generated and run **Then** the `todos` table exists with snake_case columns including nullable `user_id` for future auth (NFR4) **And** shared Zod schemas in `packages/shared` validate create/list inputs and are used by the API via `fastify-type-provider-zod`

## Tasks / Subtasks

- [ ] Decide primary key type (AC: 4) — **use UUID v4** for `todos.id` (architecture gap resolution; consistent extensibility)
- [ ] Add Drizzle ORM + Postgres driver to `apps/api` (AC: 1, 4)
  - [ ] Create `apps/api/src/db/schema.ts` with `todos` table
  - [ ] Add `drizzle.config.ts`; migrations output to `apps/api/drizzle/`
  - [ ] Create `apps/api/src/plugins/db.ts` — Drizzle connection from `DATABASE_URL`
- [ ] Shared Zod schemas (AC: 3, 4)
  - [ ] Add `packages/shared/src/schemas/todo.ts`: `createTodoSchema` (description min 1, max 2500)
  - [ ] Export inferred types from `packages/shared/src/types/`
- [ ] API infrastructure (AC: 1–3)
  - [ ] Register plugins: cors, helmet, swagger, db, zod type provider
  - [ ] Add `apps/api/src/lib/errors.ts` — standard error helper
  - [ ] Prefix all routes with `/api/v1`
- [ ] Todo routes & service (AC: 1–3)
  - [ ] `apps/api/src/services/todo-service.ts` — list + create (no tags yet; return `tagIds: []`)
  - [ ] `apps/api/src/routes/todos.ts` — `GET /api/v1/todos`, `POST /api/v1/todos`
  - [ ] Map DB snake_case → JSON camelCase in service layer
- [ ] Run migrations & verify (AC: 1–4)
  - [ ] Document migration commands in README
  - [ ] Manual test with curl/httpie

## Dev Notes

Builds directly on Story 1.1 monorepo. PostgreSQL must be running via `docker compose up db`.

### Previous Story Intelligence

Story 1.1 provides: monorepo scaffold, `docker-compose.yml` db service, `.env.example`, workspace linking. Use existing `DATABASE_URL` from `.env.example`. Do not re-scaffold apps.

### Technical Requirements

- **Drizzle ORM:** 0.45.x
- **PostgreSQL:** 16+ (existing db container)
- **Validation:** `fastify-type-provider-zod` + schemas from `@todo-list/shared` — never duplicate validation in API
- **Error format:** `{ error: { code, message, details } }` with SCREAMING_SNAKE_CASE codes
- **HTTP status:** 201 create, 400 validation, 500 internal (no stack traces in prod)
- **JSON fields:** camelCase only — `createdAt`, not `created_at`
- **Response shape:** return resource directly — no `{ data: ... }` wrapper

### Schema (todos table)

```typescript
// Drizzle — snake_case columns, camelCase TS properties
todos: {
  id: uuid PK default gen_random_uuid(),  // UUID v4 decision
  description: text not null,
  completed: boolean not null default false,
  created_at: timestamp not null default now(),
  user_id: uuid nullable  // unused in v1, required for NFR4
}
```

### Architecture Compliance

- Routes → services → Drizzle only (no business logic in route handlers)
- DB access only through services using Drizzle — no raw SQL
- OpenAPI via `@fastify/swagger` auto-generated from Zod schemas
- Co-locate API tests: `todo-service.test.ts` next to service (tap runner from Fastify scaffold)

### File Structure Requirements

```
apps/api/src/
├── plugins/       cors.ts, helmet.ts, swagger.ts, db.ts
├── routes/        todos.ts
├── services/      todo-service.ts
├── db/            schema.ts
└── lib/           errors.ts
packages/shared/src/
├── schemas/       todo.ts
└── types/         index.ts
apps/api/drizzle/  # generated migrations
```

### Testing Requirements

- Co-located service tests for create validation and list mapping
- Manual API verification: GET empty array, POST valid todo, POST invalid (empty, >2500 chars)

### Anti-Patterns (DO NOT)

- ❌ Duplicating Zod schema in `apps/api` separately from shared package
- ❌ snake_case in JSON responses
- ❌ Implementing tags/todo_tags tables yet (Story 1.6)
- ❌ PATCH/DELETE endpoints yet (Stories 1.4, 1.5)

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#API & Communication Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Format Patterns]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.2]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
