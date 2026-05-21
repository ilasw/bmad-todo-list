---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - briefs/brief-todo-list-2026-05-21/brief.md
  - prds/prd-todo-list-2026-05-21/prd.md
workflowType: 'architecture'
project_name: 'todo-list'
user_name: 'Luca'
date: '2026-05-21'
lastStep: 8
status: 'complete'
completedAt: '2026-05-21'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

16 FRs across four capability areas drive a straightforward but polished CRUD architecture:

| Area | FRs | Architectural implication |
|---|---|---|
| Task Management | FR-1–4 | REST endpoints for todo CRUD; toggle completion; delete with undo semantics |
| Tagging & Organization | FR-5–8 | Tag entity + join table; tag auto-creation on assign; single-tag filter |
| List Experience | FR-9–13 | Responsive SPA with empty/loading/error states; optimistic updates |
| Persistence & Delivery | FR-14–16 | Relational DB with volume persistence; Docker multi-container setup; README-driven deploy |

Key behavioral contracts:
- Description validation: 1–2500 characters, rejected with clear message
- Completed todos remain visible, visually distinct
- Single active tag filter; clearing restores full list
- Delete is instant; undo toast restores prior state (description, status, tags, timestamp)

**Non-Functional Requirements:**

| NFR | Requirement | Architectural driver |
|---|---|---|
| NFR-1 | Instant-feeling UI actions | Optimistic updates, minimal round-trips, efficient list fetching |
| NFR-2 | Solo-dev simplicity | Monorepo or simple two-package layout; no premature abstraction |
| NFR-3 | Graceful error handling | Structured API errors; client retry; preserve in-progress input on failed create |
| NFR-4 | Future auth extensibility | User-scoped data model placeholder or middleware hook; no auth implementation in v1 |

**Scale & Complexity:**

- Primary domain: Full-stack web (React + Fastify API + PostgreSQL/SQLite via Drizzle)
- Complexity level: **Low**
- Estimated architectural components: ~6–8 (frontend app, API server, database, shared validation/types, Docker compose, migration tooling, deployment config, documentation)

### Technical Constraints & Dependencies

From brief and PRD:
- **Stack (brief):** React, Fastify, Zod, Drizzle, Docker
- **Single user, no auth v1** — trust boundary is the host/network, not application-level identity
- **Docker-first delivery** — same container workflow for dev and deploy
- **Provider-agnostic** — no vendor lock-in; minimal provider-specific config
- **Explicit non-goals:** offline, multi-user, deadlines, subtasks, delete confirmation dialogs, multi-tag AND filtering, hiding completed todos
- **Learning project constraint:** Architecture should be clean enough to serve as a reference codebase

### Cross-Cutting Concerns Identified

1. **Shared validation** — Zod schemas for API request/response and potentially client-side forms
2. **API design** — REST resource model for todos and tags; filter query param or client-side filter decision
3. **Undo delete semantics** — Client-side optimistic delete with server reconciliation; define undo window behavior
4. **State management** — How the SPA holds list state, handles optimistic updates, and recovers from errors
5. **Database schema** — Todos, tags, todo_tags join; timestamps; future user_id column or equivalent extensibility hook
6. **Persistence volume** — Docker volume for DB data across restart/redeploy (FR-14)
7. **Error contract** — Consistent error shape from Fastify/Zod through to UI error states
8. **Deployment topology** — Frontend static serve vs API container; reverse proxy or combined image decision
9. **Documentation as deliverable** — README must reflect actual architecture choices (FR-16)

## Starter Template Evaluation

### Primary Technology Domain

Full-stack web — React SPA (Vite) + Fastify REST API + Drizzle ORM + Docker, based on project requirements and brief stack direction.

### Technical Preferences (from brief + user)

- **Package manager:** pnpm (workspaces)
- **Languages:** TypeScript throughout
- **Frontend:** React (SPA, not SSR framework)
- **Backend:** Fastify with Zod-validated endpoints
- **Database:** Relational via Drizzle ORM (PostgreSQL in Docker)
- **Deployment:** Docker containers, provider-agnostic
- **Constraints:** Solo-dev simplicity (NFR-2); no auth in v1; extensible for future auth (NFR-4)

### Starter Options Considered

| Starter | Version (verified) | Pros | Cons |
|---|---|---|---|
| create-vite (react-ts) + create-fastify | create-vite 9.x; Fastify 5.8.x; create-fastify 5.0.1 | Official, minimal, matches brief stack exactly | Requires manual monorepo wiring and Drizzle/Zod integration |
| create-t3-app | 7.40.0 | Excellent DX, Drizzle option | Next.js backend — not Fastify |
| fastify-forge | 3.0.2 | Fastify + Drizzle + Docker monorepo | Nx, Better Auth, TypeBox — over-scoped for v1 |
| fastify-drizzle-starter (community) | Mar 2026 | Fastify + Drizzle + Zod + Docker out of box | Third-party maintenance; less learning value |
| Turborepo full-stack templates | Various | Production patterns | Auth, extra libs — conflicts with v1 non-goals |

### Selected Starter: Official Dual-Scaffold (Vite + create-fastify) with pnpm workspaces

**Rationale for Selection:**

The brief explicitly targets React, Fastify, Zod, and Drizzle as learning goals. Official scaffolds provide the thinnest foundation — no auth, no tRPC, no SSR framework to remove. A pnpm workspace monorepo (`apps/web`, `apps/api`, `packages/shared`) keeps NFR-2 (solo-dev simplicity) while enabling shared Zod schemas and efficient dependency hoisting.

**Initialization Commands:**

```bash
# 1. Create monorepo root
mkdir todo-list && cd todo-list
pnpm init

# 2. Configure pnpm workspaces (pnpm-workspace.yaml)
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - 'apps/*'
  - 'packages/*'
EOF

# 3. Scaffold Fastify API (official)
mkdir -p apps
pnpm dlx create-fastify apps/api
cd apps/api && pnpm install

# 4. Scaffold React frontend (official)
cd ../..
pnpm create vite apps/web --template react-ts
cd apps/web && pnpm install

# 5. Create shared package
cd ../..
mkdir -p packages/shared
cd packages/shared
pnpm init
pnpm add zod
# Export shared Zod schemas from packages/shared

# 6. Install from root (links workspace packages)
cd ../..
pnpm install
```

**Post-scaffold additions (not provided by starter — first implementation stories):**
- Drizzle ORM + PostgreSQL driver in `apps/api`
- Zod validation plugin for Fastify (`fastify-type-provider-zod`)
- Wire `packages/shared` into both apps via `workspace:*` dependencies
- Docker Compose (api + web + postgres + volumes)
- Root `package.json` scripts for concurrent dev (`pnpm --parallel -r dev` or `concurrently`)

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
- TypeScript strict mode (Vite react-ts template; Fastify TS template)
- Node.js 20+ (Fastify 5 requirement)
- ESM module format (Fastify scaffold default)

**Package Management:**
- pnpm workspaces for monorepo linking
- `workspace:*` protocol for internal package dependencies
- Single lockfile (`pnpm-lock.yaml`) at repo root

**Styling Solution:**
- None pre-selected — add Tailwind CSS or plain CSS modules in first UI story

**Build Tooling:**
- Vite for frontend dev server and production bundle
- Fastify CLI for backend dev (`pnpm dev`) and production start

**Testing Framework:**
- Fastify scaffold includes tap test runner stub
- Frontend: add Vitest in a follow-up story

**Code Organization:**
- Monorepo: `apps/web` (React SPA), `apps/api` (Fastify plugins/routes pattern), `packages/shared` (Zod schemas/types)
- Fastify plugin architecture (routes, plugins folders from create-fastify)

**Development Experience:**
- Vite HMR for frontend
- Fastify CLI hot reload for backend
- Root-level pnpm scripts for concurrent dev across workspaces

**Note:** Project initialization using these commands should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- PostgreSQL + Drizzle ORM with Drizzle Kit migrations
- REST API under `/api/v1/` with Zod validation
- pnpm monorepo scaffold (Vite + create-fastify)
- Docker Compose with separate Dockerfiles (api, web, db)

**Important Decisions (Shape Architecture):**
- Shared Zod schemas in `packages/shared`
- Zustand + TanStack Query for frontend state
- Optimistic updates with revert-on-error; client-side delete undo (5s window)
- Tailwind CSS + React Router
- OpenAPI via `@fastify/swagger`
- Manual deploy workflow documented in README

**Deferred Decisions (Post-MVP):**
- Authentication & authorization (nullable `user_id` columns reserved)
- Rate limiting
- Caching (Redis)
- CI/CD pipeline (GitHub Actions)
- APM / metrics
- HTTPS reverse proxy (Caddy) — optional add-on for production

### Data Architecture

| Decision | Choice | Rationale |
|---|---|---|
| Database | PostgreSQL 16+ (Alpine in Docker) | Relational fit, Docker volume durability (FR-14), future multi-user |
| ORM | Drizzle ORM 0.45.x | Brief stack; type-safe, lightweight |
| Schema | `todos`, `tags`, `todo_tags` + nullable `user_id` | Matches PRD domain model; extensible for auth (NFR-4) |
| Tag filter | Client-side | Simple API; sufficient at v1 scale |
| Validation | Shared Zod in `packages/shared` + `fastify-type-provider-zod` | End-to-end type safety; single source of truth |
| Migrations | Drizzle Kit (`generate` + `migrate`) | Version-controlled SQL; run on deploy |
| Caching | None | Not needed at v1 scale |

### Authentication & Security

| Decision | Choice | Rationale |
|---|---|---|
| Authentication | None in v1 | PRD non-goal; trusted network/host boundary |
| Authorization | None — global data scope | Single user; `user_id` columns reserved for future |
| Middleware | `@fastify/helmet` + `@fastify/cors` | Security headers + frontend origin access |
| Rate limiting | None in v1 | Solo self-hosted use |
| Encryption at rest | Docker named volume for Postgres | Standard container persistence |
| Encryption in transit | HTTPS via reverse proxy (optional prod add-on) | Document in deployment guide |
| API security | Zod on all inputs; env-based config; no stack traces in prod | NFR-3 graceful error handling |

### API & Communication Patterns

| Decision | Choice | Rationale |
|---|---|---|
| API style | REST, JSON, `/api/v1/` prefix | Simple CRUD; matches scope |
| Endpoints | `GET/POST /todos`, `PATCH/DELETE /todos/:id`, `GET /tags` | Covers all FRs; tag filter client-side |
| Error format | `{ error: { code, message, details } }` | Consistent client error handling |
| HTTP status codes | 400 validation, 404 not found, 500 server | Standard REST semantics |
| Documentation | OpenAPI via `@fastify/swagger` | Learning value; auto-generated from schemas |
| Rate limiting | None in v1 | Deferred |

### Frontend Architecture

| Decision | Choice | Rationale |
|---|---|---|
| Server state | TanStack Query | Fetch/mutate with retry, cache, optimistic updates (NFR-1, NFR-3) |
| UI/local state | Zustand | Tag filter, undo toast snapshot, form draft |
| Components | Flat tree: `TaskList`, `TaskItem`, `AddTaskForm`, `TagFilter`, `DeleteToast`, `ui/` | Solo-dev simplicity (NFR-2) |
| Routing | React Router | Single main view in v1; room to grow |
| Optimistic updates | Update UI immediately → revert on API error | Instant-feeling interactions (NFR-1) |
| Delete undo | Client-side 5s toast window → DELETE on dismiss; restore from Zustand snapshot on undo | FR-4 without server soft-delete |
| Styling | Tailwind CSS | Responsive layout (FR-13); fast iteration |
| API client | Thin typed `fetch` wrapper in `apps/web/src/api/` | `VITE_API_URL` env var; shared Zod schemas |

### Infrastructure & Deployment

| Decision | Choice | Rationale |
|---|---|---|
| Orchestration | Docker Compose (preferred) | FR-15; same workflow local and prod |
| Containers | Separate: `db`, `api`, `web` (nginx static) | Clean separation; provider-agnostic |
| Dockerfiles | Separate Dockerfile per app (`apps/api`, `apps/web`) | Independent build/deploy |
| Dev workflow | `pnpm --parallel -r dev` + Compose `db` service | Fast iteration with real Postgres |
| Env config | `DATABASE_URL`, `VITE_API_URL`, `NODE_ENV`, `PORT` | `.env.example` at root; `.env` gitignored |
| CI/CD | Manual deploy | Simpler for v1 learning project |
| Logging | Fastify built-in Pino (pretty dev, JSON prod) | Structured logs without extra deps |
| Deploy target | Self-hosted VPS (primary); any Docker host (secondary) | FR-15 provider-agnostic |
| Data persistence | Named Docker volume for Postgres | FR-14 durability across restart/redeploy |

### Decision Impact Analysis

**Implementation Sequence:**
1. Monorepo scaffold (pnpm workspaces, Vite, create-fastify, shared package)
2. Database schema + Drizzle migrations
3. API routes with Zod validation + OpenAPI
4. Frontend components with TanStack Query + Zustand
5. Optimistic updates + delete undo toast
6. Docker Compose + Dockerfiles
7. README (setup, dev, deploy)

**Cross-Component Dependencies:**
- `packages/shared` Zod schemas → API validation + client forms + API client types
- Drizzle schema → migration files → API queries
- `VITE_API_URL` baked at web build → must match proxy/API routing in Compose
- Delete undo (client) → delayed DELETE call → TanStack Query cache invalidation on confirm
- Nullable `user_id` columns → no v1 logic, but migration must include them for NFR-4

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:** 12 areas where AI agents could make incompatible choices — naming, API format, file layout, state keys, error handling, and test placement.

### Naming Patterns

**Database Naming Conventions:**
- Tables: **snake_case, plural** — `todos`, `tags`, `todo_tags`
- Columns: **snake_case** — `id`, `description`, `completed`, `created_at`, `user_id`, `name`, `todo_id`, `tag_id`
- Primary keys: always `id` (UUID v4 or serial — decide at implementation, but use `id` consistently)
- Foreign keys: `{table_singular}_id` — `todo_id`, `tag_id`, `user_id`
- Indexes: `idx_{table}_{column(s)}` — e.g. `idx_tags_name`
- Drizzle schema exports: camelCase TS properties mapped to snake_case columns via Drizzle column names

**API Naming Conventions:**
- Base path: `/api/v1/`
- Resources: **plural nouns** — `/todos`, `/tags`
- Route params: `:id` (Fastify style) — `/todos/:id`
- JSON fields: **camelCase** — `createdAt`, `completed`, `tagIds`
- Query params: camelCase — `?tag=work` (reserved for future; v1 filter is client-side)
- Error codes: **SCREAMING_SNAKE_CASE** — `VALIDATION_ERROR`, `NOT_FOUND`, `INTERNAL_ERROR`

**Code Naming Conventions:**
- React components: **PascalCase** — `TaskList.tsx`, `DeleteToast.tsx`
- Non-component files: **kebab-case** — `todo-api.ts`, `use-todos.ts`
- Functions/variables: **camelCase** — `fetchTodos`, `activeTagFilter`
- Types/interfaces: **PascalCase** — `Todo`, `CreateTodoInput`
- Zustand stores: `{feature}Store` — `uiStore`, `undoStore`
- TanStack Query keys: **array, camelCase strings** — `['todos']`, `['tags']`

### Structure Patterns

**Project Organization:**
- Tests: **co-located** — `TaskList.test.tsx` next to `TaskList.tsx`
- Frontend: **by feature** under `apps/web/src/features/todos/` (components, hooks, api calls grouped)
- Shared UI primitives: `apps/web/src/components/ui/`
- API routes: `apps/api/src/routes/todos.ts`, `apps/api/src/routes/tags.ts`
- DB schema: `apps/api/src/db/schema.ts`
- Shared Zod schemas: `packages/shared/src/schemas/`
- Migrations: `apps/api/drizzle/`

**File Structure Patterns:**
- One component per file; filename matches component name
- Barrel exports (`index.ts`) only at feature boundaries, not every folder
- Env files: `.env.example` at repo root; never commit `.env`
- Docker: `docker-compose.yml` at root; `Dockerfile` in each app directory

### Format Patterns

**API Response Formats:**
- **Success:** return resource directly — no `{ data: ... }` wrapper
- **Error:** always `{ error: { code, message, details } }` — never mix error into success shape
- **Dates:** ISO 8601 strings in UTC — `"2026-05-21T12:00:00.000Z"`
- **Booleans:** JSON `true`/`false` only — never `1`/`0`
- **Nulls:** use `null` for absent optional fields; prefer explicit `null` for nullable fields in responses

**Data Exchange Formats:**
- Request bodies: camelCase JSON matching shared Zod schemas
- PATCH: send only changed fields (partial update)
- Tags on todo: array of tag name strings on create/update — `tagNames: ["work", "car"]`
- Tag list endpoint returns: `{ id, name }[]`

### Communication Patterns

**State Management Patterns:**
- **TanStack Query:** all server data (todos, tags); never duplicate server state in Zustand
- **Zustand:** UI-only state — `activeTagFilter`, `pendingDelete` (undo snapshot), `draftDescription`
- Query keys: `['todos']` for list, `['tags']` for tag list
- Mutations: use `onMutate` / `onError` / `onSettled` for optimistic updates
- Zustand updates: immutable — always return new state object

**Delete Undo Pattern (mandatory):**
1. User deletes → remove from UI immediately (optimistic)
2. Store full todo snapshot in Zustand `pendingDelete`
3. Show `DeleteToast` with 5s timer
4. Undo → restore snapshot to TanStack Query cache, clear `pendingDelete`
5. Timer expires → call `DELETE /todos/:id`, clear `pendingDelete`

### Process Patterns

**Error Handling Patterns:**
- API: catch Zod errors → 400 with `VALIDATION_ERROR`; unknown → 500 with generic message (no stack trace in prod)
- Client: TanStack Query `onError` reverts optimistic update; show `ErrorBanner` with retry action
- Failed create: preserve `draftDescription` in Zustand — never clear input on error
- Log server errors with Pino at `error` level; log client errors to console in dev only

**Loading State Patterns:**
- Use TanStack Query `isPending` / `isFetching` — no custom `isLoading` booleans for server data
- Global initial load: full-list skeleton/spinner via `isPending` on `['todos']`
- Mutations: disable action button during `isPending` on mutation; no full-page loader for toggles/deletes
- Empty state: only when `isSuccess && data.length === 0` — never show empty during loading

### Enforcement Guidelines

**All AI Agents MUST:**
- Import Zod schemas from `@todo-list/shared` — never duplicate validation rules
- Use camelCase in JSON and TypeScript; snake_case in SQL/Drizzle column definitions only
- Follow the delete-undo flow exactly — no confirmation dialogs, no immediate server DELETE
- Co-locate tests with source files
- Use TanStack Query for all API reads/writes; Zustand for UI state only

**Pattern Enforcement:**
- PR review checklist: naming, error shape, optimistic update pattern
- Shared schemas are the single source of truth — if API and client disagree, fix the shared schema first
- Pattern updates require architecture doc amendment before implementation changes

### Pattern Examples

**Good Examples:**
```typescript
// Shared schema (packages/shared)
export const createTodoSchema = z.object({
  description: z.string().min(1).max(2500),
  tagNames: z.array(z.string()).optional(),
});

// Query key
queryKey: ['todos']

// Optimistic toggle
onMutate: async (todoId) => {
  await queryClient.cancelQueries({ queryKey: ['todos'] });
  const previous = queryClient.getQueryData(['todos']);
  queryClient.setQueryData(['todos'], (old) =>
    old.map((t) => t.id === todoId ? { ...t, completed: !t.completed } : t)
  );
  return { previous };
},
onError: (_err, _vars, context) => {
  queryClient.setQueryData(['todos'], context.previous);
},
```

**Anti-Patterns:**
- ❌ `{ data: { todos: [...] } }` response wrapper
- ❌ Duplicating Zod schema in `apps/api` and `apps/web` separately
- ❌ Storing todo list in Zustand
- ❌ `DELETE` on button click before undo window expires
- ❌ snake_case in JSON responses (`created_at` in API output)
- ❌ Confirmation dialog before delete

## Project Structure & Boundaries

### Complete Project Directory Structure

```
todo-list/
├── README.md
├── .env.example
├── .gitignore
├── package.json                    # root scripts: dev, build, docker:*
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── docker-compose.yml              # db, api, web services
├── docker-compose.override.yml     # optional local dev overrides (gitignored)
│
├── apps/
│   ├── api/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── drizzle.config.ts
│   │   ├── drizzle/                # migration SQL files
│   │   │   └── meta/
│   │   └── src/
│   │       ├── app.ts              # Fastify entry, plugin registration
│   │       ├── server.ts           # listen / start
│   │       ├── plugins/
│   │       │   ├── cors.ts
│   │       │   ├── helmet.ts
│   │       │   ├── swagger.ts
│   │       │   └── db.ts           # Drizzle + Postgres connection
│   │       ├── routes/
│   │       │   ├── todos.ts        # FR-1–4
│   │       │   └── tags.ts         # FR-5–8 (tag list)
│   │       ├── services/
│   │       │   ├── todo-service.ts
│   │       │   └── tag-service.ts
│   │       ├── db/
│   │       │   └── schema.ts       # todos, tags, todo_tags
│   │       └── lib/
│   │           └── errors.ts       # error helper → standard shape
│   │
│   └── web/
│       ├── Dockerfile              # multi-stage: vite build → nginx
│       ├── nginx.conf
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── tailwind.config.js
│       ├── postcss.config.js
│       ├── index.html
│       └── src/
│           ├── main.tsx
│           ├── App.tsx
│           ├── index.css
│           ├── api/
│           │   ├── client.ts       # fetch wrapper, VITE_API_URL
│           │   ├── todos.ts
│           │   └── tags.ts
│           ├── components/
│           │   └── ui/
│           │       ├── EmptyState.tsx
│           │       ├── ErrorBanner.tsx
│           │       └── LoadingSpinner.tsx
│           ├── features/
│           │   └── todos/
│           │       ├── TaskList.tsx
│           │       ├── TaskItem.tsx
│           │       ├── AddTaskForm.tsx
│           │       ├── TagFilter.tsx
│           │       ├── DeleteToast.tsx
│           │       ├── hooks/
│           │       │   ├── use-todos.ts
│           │       │   └── use-tags.ts
│           │       └── pages/
│           │           └── TaskListPage.tsx
│           ├── routes/
│           │   └── index.tsx       # React Router config
│           └── stores/
│               └── ui-store.ts     # Zustand: filter, undo, draft
│
└── packages/
    └── shared/
        ├── package.json
        ├── tsconfig.json
        └── src/
            ├── index.ts
            ├── schemas/
            │   ├── todo.ts         # createTodoSchema, updateTodoSchema
            │   └── tag.ts
            └── types/
                └── index.ts        # inferred types from schemas
```

### Architectural Boundaries

**API Boundaries:**
- All HTTP endpoints live in `apps/api/src/routes/` — no business logic in route handlers
- Business logic in `apps/api/src/services/` — routes validate input, call service, return response
- DB access only through Drizzle in services — no raw SQL outside `db/schema.ts` + Drizzle queries
- External boundary: `/api/v1/todos`, `/api/v1/tags` — frontend communicates only via `apps/web/src/api/`

**Component Boundaries:**
- `features/todos/` owns all todo UI — no todo logic in `App.tsx`
- `components/ui/` is presentational only — no API calls, no Zustand
- `stores/ui-store.ts` holds UI state only — never todo list data
- `hooks/use-todos.ts` wraps TanStack Query — components don't call `fetch` directly

**Service Boundaries:**
- `todo-service.ts`: CRUD + tag assignment logic
- `tag-service.ts`: list tags, find-or-create tag by name
- Services don't know about HTTP — routes handle status codes

**Data Boundaries:**
- Schema defined once in `apps/api/src/db/schema.ts`
- Migrations in `apps/api/drizzle/` — never hand-edit production DB
- `user_id` columns exist but are unused in v1 service queries

### Requirements to Structure Mapping

| FR Category | Location |
|---|---|
| FR-1–4 Task Management | `routes/todos.ts` + `services/todo-service.ts` + `features/todos/` |
| FR-5–8 Tagging | `services/tag-service.ts` + `TagFilter.tsx` + client-side filter in `TaskListPage.tsx` |
| FR-9–13 List Experience | `features/todos/*` + `components/ui/*` |
| FR-14 Persistence | `db/schema.ts` + `drizzle/` + Docker volume in `docker-compose.yml` |
| FR-15–16 Docker & Docs | `docker-compose.yml`, Dockerfiles, `README.md` |

**Cross-Cutting Concerns:**

| Concern | Location |
|---|---|
| Validation | `packages/shared/src/schemas/` → API routes + client forms |
| Error handling | `apps/api/src/lib/errors.ts` + `ErrorBanner.tsx` |
| Optimistic updates | `hooks/use-todos.ts` (TanStack Query mutation config) |
| Delete undo | `DeleteToast.tsx` + `stores/ui-store.ts` |
| OpenAPI | `apps/api/src/plugins/swagger.ts` |

### Integration Points

**Internal Communication:**
```
Browser → apps/web (nginx static)
       → fetch(VITE_API_URL/api/v1/...)
       → apps/api (Fastify)
       → services/
       → Drizzle
       → PostgreSQL (db container)
```

**External Integrations:** None in v1

**Data Flow:**
1. Page load → `useTodos()` fetches `GET /api/v1/todos` → TanStack Query cache
2. Create → optimistic add → `POST /api/v1/todos` → reconcile cache
3. Toggle → optimistic update → `PATCH /api/v1/todos/:id` → revert on error
4. Delete → optimistic remove → 5s undo window → `DELETE /api/v1/todos/:id`
5. Tag filter → read `activeTagFilter` from Zustand → filter cached todos client-side

### File Organization Patterns

**Configuration Files:** Root `.env.example`; app-specific overrides in `apps/*/.env` if needed (gitignored)

**Source Organization:** Feature-based frontend; layered backend (routes → services → db)

**Test Organization:** Co-located — `todo-service.test.ts` next to `todo-service.ts`

**Asset Organization:** Static assets in `apps/web/public/` if needed; built output in `apps/web/dist/`

### Development Workflow Integration

**Development Server Structure:**
- Terminal 1: `docker compose up db` (Postgres)
- Terminal 2: `pnpm --parallel -r dev` (Vite :5173 + Fastify :3000)

**Build Process Structure:**
- `pnpm -r build` → `apps/web/dist` (static) + `apps/api/dist` (compiled JS)
- Web Docker image: copy `dist/` → nginx
- API Docker image: copy `dist/` → `node dist/server.js`

**Deployment Structure:**
- `docker compose up -d` on VPS with named volume for Postgres
- Manual deploy: pull/build locally → `docker compose up -d` → run migrations

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All technology choices are compatible: pnpm workspaces link React (Vite) + Fastify 5 + Drizzle + PostgreSQL + Zod shared schemas. TanStack Query + Zustand division is clear (server vs UI state). Docker Compose topology matches separate-container decision. No contradictory decisions found.

**Pattern Consistency:**
Naming conventions (snake_case DB, camelCase JSON/TS) align across all layers. Delete-undo pattern matches FR-4 and API REST design. Error shape consistent from `errors.ts` through to `ErrorBanner.tsx`. Structure patterns (routes → services → db) enforce boundaries defined in step 6.

**Structure Alignment:**
Every FR category maps to specific directories. Shared validation lives in `packages/shared`. Integration flow (browser → nginx → Fastify → Drizzle → Postgres) is fully traced. Project tree is concrete — no placeholder directories.

### Requirements Coverage Validation ✅

**Functional Requirements Coverage:**

| FR | Architectural Support |
|---|---|
| FR-1 Create | `POST /api/v1/todos` + `createTodoSchema` + `AddTaskForm` + optimistic add |
| FR-2 View list | `GET /api/v1/todos` + `TaskList` + TanStack Query |
| FR-3 Toggle | `PATCH /api/v1/todos/:id` + optimistic update with revert |
| FR-4 Delete undo | Optimistic remove + `DeleteToast` + 5s delayed `DELETE` |
| FR-5 Assign tags | `tagNames` in body + `tag-service` find-or-create |
| FR-6 Remove tags | `PATCH` with updated `tagNames` array |
| FR-7 Filter by tag | `activeTagFilter` in Zustand + client-side filter |
| FR-8 Clear filter | Clear Zustand filter state |
| FR-9 Completed visual | `TaskItem` styling (Tailwind) |
| FR-10 Empty state | `EmptyState.tsx` |
| FR-11 Loading | `LoadingSpinner` + TanStack Query `isPending` |
| FR-12 Error + retry | `ErrorBanner` + preserve `draftDescription` |
| FR-13 Responsive | Tailwind CSS |
| FR-14 Persistence | PostgreSQL + Docker named volume + Drizzle migrations |
| FR-15 Docker | `docker-compose.yml` + separate Dockerfiles |
| FR-16 Documentation | `README.md` at root (implementation deliverable) |

**Non-Functional Requirements Coverage:**

| NFR | Support |
|---|---|
| NFR-1 Responsiveness | Optimistic updates, TanStack Query cache, minimal round-trips |
| NFR-2 Simplicity | Flat components, layered backend, no premature abstraction |
| NFR-3 Error handling | Standard error shape, revert-on-error, input preservation |
| NFR-4 Extensibility | Nullable `user_id` columns; middleware hook point in Fastify plugins |

### Implementation Readiness Validation ✅

**Decision Completeness:** All critical and important decisions documented with rationale. Version references included where verified (Drizzle 0.45.x, Fastify 5.x, create-vite 9.x).

**Structure Completeness:** Full directory tree with file-level specificity. Boundaries, integration points, and FR mapping complete.

**Pattern Completeness:** Naming, format, state, error, loading, and delete-undo patterns documented with good/anti-pattern examples.

### Gap Analysis Results

**Critical Gaps:** None

**Important Gaps (resolve during implementation):**
- Primary key type (UUID v4 vs serial) — decide in first DB schema story
- nginx proxy config for API requests in production Docker setup — decide in Docker story

**Nice-to-Have Gaps (deferred):**
- Vitest setup for frontend tests
- CI/CD pipeline (GitHub Actions)
- HTTPS reverse proxy (Caddy) for production

### Validation Issues Addressed

No blocking issues found. Important gaps are explicitly deferred to first implementation stories where the decision context is available.

### Architecture Completeness Checklist

**Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High

**Key Strengths:**
- Clear stack aligned with brief learning goals
- Shared Zod schemas prevent validation drift
- Explicit delete-undo pattern prevents common FR-4 misimplementation
- Concrete project tree gives agents unambiguous file targets
- Extensibility hooks (user_id) without v1 complexity

**Areas for Future Enhancement:**
- Authentication layer
- CI/CD automation
- HTTPS / reverse proxy hardening
- Frontend test suite (Vitest)

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and boundaries
- Refer to this document for all architectural questions

**First Implementation Priority:**
Scaffold monorepo with pnpm workspaces, then `pnpm dlx create-fastify apps/api` + `pnpm create vite apps/web --template react-ts` + `packages/shared` — as documented in Starter Template Evaluation.
