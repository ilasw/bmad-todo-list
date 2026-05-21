# Story 1.1: Monorepo Scaffold & Dev Environment

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want a working monorepo foundation with web, API, and shared packages,
so that I can run the full-stack app locally and build features on a consistent structure.

## Acceptance Criteria

1. **Given** a fresh clone of the repository **When** I run the documented setup commands (`pnpm install`, start PostgreSQL, `pnpm --parallel -r dev`) **Then** the Fastify API starts on port 3000 and the Vite dev server starts on port 5173
2. **And** the monorepo contains `apps/web` (Vite react-ts), `apps/api` (create-fastify), and `packages/shared` (Zod) linked via pnpm workspaces
3. **And** root `package.json` includes scripts for concurrent dev across workspaces
4. **And** `.env.example` at repo root documents `DATABASE_URL`, `VITE_API_URL`, `NODE_ENV`, and `PORT`
5. **And** a minimal `docker-compose.yml` with a `db` service (PostgreSQL 16 + named volume) is included for local development — full api/web services are added in Epic 2

## Tasks / Subtasks

- [x] Initialize monorepo root (AC: 1, 2)
  - [x] Create root `package.json`, `pnpm-workspace.yaml`, `.gitignore`
  - [x] Add root scripts: `dev` → `pnpm --parallel -r dev`, `build` → `pnpm -r build`
- [x] Scaffold API with create-fastify (AC: 1, 2)
  - [x] Run `pnpm dlx create-fastify apps/api`; ensure Fastify 5 + TypeScript + ESM
  - [x] Configure `apps/api` dev script on port 3000; add health route `GET /health` returning `{ status: "ok" }`
- [x] Scaffold web with Vite react-ts (AC: 1, 2)
  - [x] Run `pnpm create vite apps/web --template react-ts`
  - [x] Configure Vite dev server on port 5173; show placeholder page confirming app loads
- [x] Create shared package (AC: 2)
  - [x] Create `packages/shared` with `zod` dependency
  - [x] Export placeholder schema from `packages/shared/src/index.ts`
  - [x] Wire `workspace:*` deps in both apps; verify imports compile
- [x] Environment & Docker db only (AC: 4, 5)
  - [x] Add root `.env.example` with documented vars
  - [x] Add `docker-compose.yml` with `db` service: PostgreSQL 16 Alpine, named volume, port 5432
  - [x] Document setup in root `README.md` (minimal: clone, install, env, db, dev)

### Review Findings

- [x] [Review][Decision] API not scaffolded with create-fastify — **Resolved:** keep hand-rolled server; remove empty `plugins/`/`routes/` dirs and stale Fastify-CLI READMEs (see patch item below).

- [x] [Review][Decision] Shared package distribution strategy — **Resolved:** keep source-first exports (`./src/index.ts`); acceptable monorepo dev pattern with tsx/Vite.

- [x] [Review][Patch] `.env` file not loaded by API [apps/api/src/server.ts:4] — added `dotenv` loading repo root `.env`.

- [x] [Review][Patch] README understates dev processes [README.md:43] — updated to list all three workspaces.

- [x] [Review][Patch] TypeScript version mismatch [apps/web/package.json:27] — aligned web to `^5.8.0`.

- [x] [Review][Patch] `@types/node` version mismatch — aligned web to `^22.15.0`.

- [x] [Review][Patch] Invalid `PORT` silently mishandled [apps/api/src/server.ts:4] — added `parsePort` validation.

- [x] [Review][Patch] Vite port not enforced [apps/web/vite.config.ts:7] — added `strictPort: true`.

- [x] [Review][Patch] Stale Fastify-CLI boilerplate [apps/api/README.md] — removed plugins/routes READMEs; rewrote api README.

- [x] [Review][Patch] Unused Vite template cruft [apps/web/] — removed unused assets and simplified `index.css`.

- [x] [Review][Patch] No `packageManager` pin [package.json] — added `packageManager: pnpm@10.27.0`.

- [x] [Review][Patch] Story completion artifacts missing — tasks, file list, and status updated.

- [x] [Review][Patch] No engine enforcement [package.json:9] — added `.npmrc` with `engine-strict=true`.

- [x] [Review][Defer] docker-compose credentials hardcoded [docker-compose.yml:7] — deferred, README implies `.env` drives DB creds but compose uses inline `POSTGRES_*`; acceptable for story 1.1 db-only scaffold.

- [x] [Review][Defer] `VITE_API_URL` unused [.env.example:5] — deferred, web does not call API yet; expected in later stories.

- [x] [Review][Defer] No CORS configuration [apps/api/src/server.ts] — deferred, needed when web calls API in story 1.3+.

- [x] [Review][Defer] No graceful shutdown handlers [apps/api/src/server.ts] — deferred, container lifecycle handling deferred to Epic 2.

- [x] [Review][Defer] `DATABASE_URL` unused [.env.example:2] — deferred, API does not connect to DB yet; story 1.2 scope.

## Dev Notes

Greenfield project — no application code exists yet. This story establishes the foundation every later Epic 1 story builds on.

### Technical Requirements

- **Node.js:** 20+ (Fastify 5 requirement)
- **Package manager:** pnpm workspaces only — no npm/yarn
- **Module format:** ESM throughout (Fastify scaffold default)
- **TypeScript:** strict mode in all packages
- **Do NOT add in this story:** Drizzle, TanStack Query, Zustand, Tailwind, React Router, api/web Docker services (Epic 2)

### Architecture Compliance

- Monorepo layout MUST match architecture doc exactly: `apps/web`, `apps/api`, `packages/shared`
- Internal deps use `"@todo-list/shared": "workspace:*"` (or equivalent scoped name — pick one and use consistently)
- `.env` gitignored; only `.env.example` committed
- Docker Compose: **db service only** — do not add api/web containers yet (Story 2.1 extends this file)

### File Structure Requirements

Create at minimum:

```
todo-list/
├── README.md
├── .env.example
├── .gitignore
├── package.json
├── pnpm-workspace.yaml
├── docker-compose.yml          # db only
├── apps/api/                   # create-fastify output + minimal health route
├── apps/web/                   # vite react-ts output
└── packages/shared/
    ├── package.json
    └── src/index.ts
```

### Testing Requirements

- Manual verification only for this story: `pnpm install`, `docker compose up db`, `pnpm --parallel -r dev`
- API health check: `curl http://localhost:3000/health`
- Web loads at `http://localhost:5173`
- No automated test suite required yet (Vitest deferred)

### Anti-Patterns (DO NOT)

- ❌ Adding Next.js, tRPC, Nx, or auth libraries
- ❌ Putting business logic in root `package.json` scripts beyond orchestration
- ❌ Committing `.env` with secrets
- ❌ Replacing docker-compose db service in Epic 2 — only extend it later

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Starter Template Evaluation]
- [Source: _bmad-output/planning-artifacts/architecture.md#Complete Project Directory Structure]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.1]

## Dev Agent Record

### Agent Model Used

Composer

### Debug Log References

### Completion Notes List

- Monorepo scaffold implemented with pnpm workspaces (api, web, shared).
- API uses hand-rolled Fastify 5 server with `/health` route (accepted deviation from create-fastify scaffold).
- Shared package uses source-first TypeScript exports consumed by tsx/Vite.
- Code review patches applied: dotenv loading, PORT validation, strictPort, version alignment, boilerplate cleanup, `.npmrc` engine-strict, packageManager pin.

### File List

- `.env.example`
- `.gitignore`
- `.npmrc`
- `README.md`
- `docker-compose.yml`
- `package.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- `apps/api/package.json`
- `apps/api/README.md`
- `apps/api/src/server.ts`
- `apps/api/tsconfig.json`
- `apps/web/package.json`
- `apps/web/index.html`
- `apps/web/vite.config.ts`
- `apps/web/src/App.tsx`
- `apps/web/src/App.css`
- `apps/web/src/index.css`
- `apps/web/src/main.tsx`
- `packages/shared/package.json`
- `packages/shared/src/index.ts`
- `packages/shared/tsconfig.json`
