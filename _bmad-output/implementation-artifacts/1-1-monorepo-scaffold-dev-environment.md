# Story 1.1: Monorepo Scaffold & Dev Environment

Status: ready-for-dev

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

- [ ] Initialize monorepo root (AC: 1, 2)
  - [ ] Create root `package.json`, `pnpm-workspace.yaml`, `.gitignore`
  - [ ] Add root scripts: `dev` → `pnpm --parallel -r dev`, `build` → `pnpm -r build`
- [ ] Scaffold API with create-fastify (AC: 1, 2)
  - [ ] Run `pnpm dlx create-fastify apps/api`; ensure Fastify 5 + TypeScript + ESM
  - [ ] Configure `apps/api` dev script on port 3000; add health route `GET /health` returning `{ status: "ok" }`
- [ ] Scaffold web with Vite react-ts (AC: 1, 2)
  - [ ] Run `pnpm create vite apps/web --template react-ts`
  - [ ] Configure Vite dev server on port 5173; show placeholder page confirming app loads
- [ ] Create shared package (AC: 2)
  - [ ] Create `packages/shared` with `zod` dependency
  - [ ] Export placeholder schema from `packages/shared/src/index.ts`
  - [ ] Wire `workspace:*` deps in both apps; verify imports compile
- [ ] Environment & Docker db only (AC: 4, 5)
  - [ ] Add root `.env.example` with documented vars
  - [ ] Add `docker-compose.yml` with `db` service: PostgreSQL 16 Alpine, named volume, port 5432
  - [ ] Document setup in root `README.md` (minimal: clone, install, env, db, dev)

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

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
