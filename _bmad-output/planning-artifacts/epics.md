---
stepsCompleted: [1, 2]
inputDocuments:
  - prds/prd-todo-list-2026-05-21/prd.md
  - architecture.md
---

# todo-list - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for todo-list, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Create todo — User can add a Todo with a textual description. New Todo appears in the Task list with active completion status and a creation timestamp. Description must be non-empty and no longer than 2500 characters; submissions outside that range are rejected with a clear validation message.

FR2: View task list — User sees the Task list immediately on open — all Todos subject to the active Tag filter, including active and completed. Each Todo shows description, completion status, Tags, and creation timestamp. Task list loads without login or onboarding steps.

FR3: Toggle completion status — User can mark an active Todo as completed or mark a completed Todo back to active (toggle). Status updates immediately in the Task list without page reload and persists after browser refresh.

FR4: Delete todo with undo — User can remove a Todo from the Task list with instant delete (no confirmation dialog). Immediately after delete, a Delete toast appears with the message "Task deleted" and an Undo control. Undo restores the deleted Todo with its prior description, completion status, Tags, and creation timestamp. If Undo is not used, deletion persists after browser refresh.

FR5: Assign tags — User can attach one or more Tags to a Todo when creating or editing it. Tags not yet in the system are created automatically. A Todo may carry multiple Tags simultaneously.

FR6: Remove tags — User can remove a Tag from a Todo without deleting that Tag from other Todos.

FR7: Filter by tag — User can activate a Tag filter to show only Todos carrying that Tag. Only one Tag filter is active at a time. Todos without the selected Tag are hidden while the filter is active.

FR8: Clear tag filter — User can clear the active Tag filter to restore the full Task list. All Todos reappear when the filter is cleared.

FR9: Distinguish completed todos — Completed Todos are always visible and visually distinct from active Todos in the Task list. User can tell active from completed Todos at a glance without interacting.

FR10: Empty state — When the Task list has no Todos, or none match the active Tag filter, user sees a clear empty-state message — not a blank screen.

FR11: Loading state — While Todos are being fetched, user sees a loading indicator instead of a broken or empty list.

FR12: Error state — When a load or save fails, user sees an error message and can retry without losing in-progress input. Failed create does not silently discard the description the user entered.

FR13: Responsive layout — Task list and core actions are usable on desktop and mobile viewports without horizontal scrolling or clipped controls.

FR14: Durable persistence — Todos and Tags persist across browser refresh, application restart, and redeploy. No data loss under normal operation. Todos and Tags survive container restart when using the documented Docker setup.

FR15: Docker deployment — Application ships as Docker containers as the primary delivery unit. Local development and production run via the same Docker-based workflow. Deployment is provider-agnostic. App runs locally using documented Docker commands without provider-specific tooling. At least one non-local deployment is documented using the same container images.

FR16: Technical documentation — README covers local setup, development workflow, Docker build/run, and deployment to at least one target environment using the standard container configuration — not a provider-specific fork of the application.

### NonFunctional Requirements

NFR1: Responsiveness — User actions (create, toggle completion, delete, tag, filter) reflect in the UI without perceptible delay under normal network conditions.

NFR2: Simplicity — Solution remains understandable and maintainable by a solo developer — no unnecessary abstraction in v1.

NFR3: Error handling — Client and server handle failures gracefully; errors do not crash the app or silently discard user input.

NFR4: Extensibility — v1 design does not preclude adding authentication or multi-user support in a future version.

### Additional Requirements

- **Starter template (Epic 1 Story 1):** Official dual-scaffold monorepo — pnpm workspaces with `apps/web` (Vite react-ts), `apps/api` (create-fastify), and `packages/shared` (Zod schemas). Initialization commands documented in architecture.
- **Stack:** TypeScript throughout; Node.js 20+; pnpm workspaces; React SPA (Vite); Fastify 5 with plugin architecture; Drizzle ORM 0.45.x; PostgreSQL 16+ (Alpine in Docker).
- **Database schema:** Tables `todos`, `tags`, `todo_tags` with nullable `user_id` columns reserved for future auth (NFR4). Drizzle Kit migrations (`generate` + `migrate`) version-controlled in `apps/api/drizzle/`.
- **API design:** REST JSON under `/api/v1/` prefix. Endpoints: `GET/POST /todos`, `PATCH/DELETE /todos/:id`, `GET /tags`. Tag filter is client-side in v1.
- **Validation:** Shared Zod schemas in `packages/shared` imported by both API (`fastify-type-provider-zod`) and client — single source of truth, no duplication.
- **API error contract:** `{ error: { code, message, details } }` with SCREAMING_SNAKE_CASE codes (`VALIDATION_ERROR`, `NOT_FOUND`, `INTERNAL_ERROR`). HTTP 400/404/500. No stack traces in production.
- **API security:** `@fastify/helmet` + `@fastify/cors`; Zod on all inputs; env-based config.
- **OpenAPI documentation:** `@fastify/swagger` auto-generated from schemas.
- **Frontend state:** TanStack Query for all server data (todos, tags); Zustand for UI-only state (`activeTagFilter`, `pendingDelete` undo snapshot, `draftDescription`). Never store todo list in Zustand.
- **Optimistic updates:** Update UI immediately on create/toggle/delete; revert on API error via TanStack Query `onMutate`/`onError`.
- **Delete undo pattern (mandatory):** Optimistic remove → store snapshot in Zustand → show DeleteToast with 5s timer → Undo restores cache → timer expiry calls `DELETE /todos/:id`. No confirmation dialogs; no immediate server DELETE on click.
- **Frontend styling & routing:** Tailwind CSS for responsive layout; React Router (single main view in v1).
- **Frontend components:** `TaskList`, `TaskItem`, `AddTaskForm`, `TagFilter`, `DeleteToast` under `features/todos/`; shared UI primitives `EmptyState`, `ErrorBanner`, `LoadingSpinner` under `components/ui/`.
- **API client:** Thin typed `fetch` wrapper in `apps/web/src/api/` using `VITE_API_URL` env var.
- **Naming conventions:** snake_case DB tables/columns; camelCase JSON/TypeScript; plural REST resources; co-located tests.
- **Docker infrastructure:** Docker Compose with separate `db`, `api`, `web` (nginx static) services; separate Dockerfile per app; named Docker volume for Postgres persistence (FR14).
- **Environment config:** Root `.env.example` with `DATABASE_URL`, `VITE_API_URL`, `NODE_ENV`, `PORT`; `.env` gitignored.
- **Dev workflow:** `docker compose up db` + `pnpm --parallel -r dev` (Vite :5173 + Fastify :3000).
- **Logging:** Fastify built-in Pino (pretty dev, JSON prod).
- **Deployment:** Manual deploy workflow documented in README; provider-agnostic (self-hosted VPS primary).
- **Implementation gaps to resolve in stories:** Primary key type (UUID v4 vs serial); nginx proxy config for API requests in production Docker setup.
- **Deferred (not v1 stories):** Authentication, rate limiting, Redis caching, CI/CD, APM/metrics, HTTPS reverse proxy (Caddy), Vitest frontend setup.

### UX Design Requirements

None — no UX Design Specification document found. UI requirements are covered by PRD FR-9 through FR-13 and Architecture frontend component decisions (Tailwind CSS, responsive layout, EmptyState/ErrorBanner/LoadingSpinner/DeleteToast components).

### FR Coverage Map

FR1: Epic 1 — Create todo
FR2: Epic 1 — View task list
FR3: Epic 1 — Toggle completion status
FR4: Epic 1 — Delete todo with undo toast
FR5: Epic 1 — Assign tags to todos
FR6: Epic 1 — Remove tags from todos
FR7: Epic 1 — Filter task list by tag
FR8: Epic 1 — Clear tag filter
FR9: Epic 1 — Visually distinguish completed todos
FR10: Epic 1 — Empty state messaging
FR11: Epic 1 — Loading state indicator
FR12: Epic 1 — Error state with retry and input preservation
FR13: Epic 1 — Responsive layout (desktop + mobile)
FR14: Epic 1 + Epic 2 — Dev persistence (Epic 1); redeploy durability via Docker volume (Epic 2)
FR15: Epic 2 — Docker deployment
FR16: Epic 2 — Technical documentation (README)

## Epic List

### Epic 1: Personal Task Management

User can open the app and manage personal tasks across life contexts — capture, complete, delete with undo, tag, filter — with a polished responsive experience and data that survives refresh and restart.

**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR8, FR9, FR10, FR11, FR12, FR13, FR14 (refresh/restart persistence)

### Epic 2: Containerized Deployment

User can build, run, and deploy the application using Docker on any host, with data surviving redeploy and full setup/deploy documentation.

**FRs covered:** FR14 (container redeploy durability), FR15, FR16

## Epic 1: Personal Task Management

User can open the app and manage personal tasks across life contexts — capture, complete, delete with undo, tag, filter — with a polished responsive experience and data that survives refresh and restart.

### Story 1.1: Monorepo Scaffold & Dev Environment

As a developer,
I want a working monorepo foundation with web, API, and shared packages,
So that I can run the full-stack app locally and build features on a consistent structure.

**Acceptance Criteria:**

**Given** a fresh clone of the repository
**When** I run the documented setup commands (`pnpm install`, `docker compose up db`, `pnpm --parallel -r dev`)
**Then** the Fastify API starts on port 3000 and the Vite dev server starts on port 5173
**And** the monorepo contains `apps/web` (Vite react-ts), `apps/api` (create-fastify), and `packages/shared` (Zod) linked via pnpm workspaces
**And** root `package.json` includes scripts for concurrent dev across workspaces
**And** `.env.example` at repo root documents `DATABASE_URL`, `VITE_API_URL`, `NODE_ENV`, and `PORT`

### Story 1.2: Todo Data Layer & Create/List API

As a user,
I want my todos stored persistently and accessible via a REST API,
So that tasks survive refresh and the frontend can load and create them reliably.

**Acceptance Criteria:**

**Given** PostgreSQL is running and migrations have been applied
**When** I call `GET /api/v1/todos`
**Then** I receive a JSON array of todos with `id`, `description`, `completed`, `createdAt`, and `tagIds` (empty array initially) in camelCase
**And** each todo includes a `createdAt` ISO 8601 UTC timestamp

**Given** a valid request body `{ "description": "Buy groceries" }`
**When** I call `POST /api/v1/todos`
**Then** a new todo is created with `completed: false` and returned with HTTP 201
**And** the description is persisted in the `todos` table

**Given** a request with an empty description or description exceeding 2500 characters
**When** I call `POST /api/v1/todos`
**Then** the API returns HTTP 400 with error shape `{ error: { code: "VALIDATION_ERROR", message, details } }`

**Given** the Drizzle schema is defined
**When** migrations are generated and run
**Then** the `todos` table exists with snake_case columns including nullable `user_id` for future auth (NFR4)
**And** shared Zod schemas in `packages/shared` validate create/list inputs and are used by the API via `fastify-type-provider-zod`

### Story 1.3: View & Create Tasks in the UI

As a user,
I want to see my task list immediately on open and add new tasks,
So that I can capture todos without friction (UJ-1).

**Acceptance Criteria:**

**Given** I open the app with no login required
**When** the page loads
**Then** I see a loading indicator while todos are being fetched (FR11)
**And** once loaded, I see all my todos with description, completion status, tags, and creation timestamp (FR2)

**Given** the task list is displayed
**When** I type a description and submit the add form
**Then** the new todo appears in the list immediately with active status (FR1, NFR1)
**And** the creation timestamp is visible on the todo

**Given** I enter an empty description or one exceeding 2500 characters
**When** I attempt to submit
**Then** I see a clear validation message and the todo is not created

**Given** the initial todo fetch fails
**When** the error occurs
**Then** I see an error message with a retry action (FR12)
**And** the app does not crash (NFR3)

**Given** a create request fails after I typed a description
**When** the error occurs
**Then** my typed description is preserved in the form so I can retry (FR12, NFR3)

### Story 1.4: Toggle Task Completion

As a user,
I want to mark tasks complete or revert them to active,
So that I can track progress and fix mistakes (UJ-2).

**Acceptance Criteria:**

**Given** a todo with active status is displayed
**When** I toggle its completion control
**Then** the todo immediately shows as completed with visually distinct styling (FR3, FR9, NFR1)
**And** no page reload occurs

**Given** a completed todo is displayed
**When** I toggle its completion control
**Then** the todo immediately returns to active status with active styling

**Given** a toggle succeeds
**When** I refresh the browser
**Then** the completion status persists (FR3)

**Given** the API returns an error during toggle
**When** the optimistic update was applied
**Then** the UI reverts to the previous status and shows an error (NFR3)

**Given** the API endpoint `PATCH /api/v1/todos/:id` accepts `{ "completed": true | false }`
**When** a valid todo id and body are sent
**Then** the server updates and returns the updated todo

### Story 1.5: Delete Task with Undo Toast

As a user,
I want to delete tasks instantly with the option to undo,
So that I can remove stale items quickly without fear of permanent loss (UJ-2).

**Acceptance Criteria:**

**Given** a todo is displayed in the task list
**When** I click delete
**Then** the todo is removed from the list immediately with no confirmation dialog (FR4)
**And** a toast appears with the message "Task deleted" and an Undo button

**Given** the delete toast is visible
**When** I click Undo within the 5-second window
**Then** the todo reappears with its prior description, completion status, tags, and creation timestamp restored

**Given** the delete toast is visible
**When** 5 seconds elapse without clicking Undo
**Then** the API `DELETE /api/v1/todos/:id` is called and the deletion persists after refresh

**Given** the delete toast is visible
**When** I do not click Undo and refresh after the timer expires
**Then** the todo remains deleted (FR4)

**Given** the API returns an error after optimistic delete
**When** the error occurs
**Then** the todo is restored in the list and an error is shown (NFR3)

**And** the implementation follows the mandatory delete-undo pattern: optimistic remove → Zustand snapshot → 5s timer → delayed DELETE (no immediate server DELETE on click)

### Story 1.6: Tag Tasks on Create & Edit

As a user,
I want to assign and remove tags on my todos,
So that I can organize tasks by life context (UJ-3).

**Acceptance Criteria:**

**Given** I am creating or editing a todo
**When** I add tag names (e.g. `work`, `car`)
**Then** those tags are attached to the todo and displayed on the task item (FR5)
**And** tags not yet in the system are created automatically

**Given** a todo carries multiple tags
**When** I remove one tag from that todo
**Then** the tag is removed from this todo only (FR6)
**And** other todos carrying the same tag are unaffected

**Given** the database schema
**When** tag migrations are applied
**Then** `tags` and `todo_tags` tables exist alongside `todos`

**Given** the API
**When** I create or update a todo with `tagNames: ["work", "car"]`
**Then** tags are find-or-created via tag service and associated via the join table
**And** `GET /api/v1/tags` returns `{ id, name }[]` for all tags in the system

### Story 1.7: Filter Tasks by Tag

As a user,
I want to filter my task list by a single tag,
So that I can focus on one context at a time (UJ-3).

**Acceptance Criteria:**

**Given** todos exist with various tags
**When** I select a tag filter (e.g. `work`)
**Then** only todos carrying that tag are visible (FR7)
**And** only one tag filter is active at a time

**Given** an active tag filter
**When** I clear the filter
**Then** all todos reappear in the full task list (FR8)

**Given** an active tag filter
**When** no todos match the selected tag
**Then** I see a clear empty-state message indicating no matching tasks (FR10)

**Given** todos are loaded in TanStack Query cache
**When** I change the tag filter
**Then** filtering happens client-side via Zustand `activeTagFilter` without an additional API call

### Story 1.8: Polished List Experience

As a user,
I want a responsive, polished task list with graceful empty, loading, and error states,
So that the app feels complete and usable on any device (FR9–FR13).

**Acceptance Criteria:**

**Given** the task list has no todos and no active filter
**When** the list renders after loading completes
**Then** I see a clear empty-state message — not a blank screen (FR10)

**Given** I am on a mobile viewport (≤768px) or desktop viewport (≥1024px)
**When** I use the task list and core actions (add, toggle, delete, tag, filter)
**Then** all controls are usable without horizontal scrolling or clipped elements (FR13)

**Given** Tailwind CSS is configured
**When** I view active vs completed todos
**Then** completed todos remain visible and are visually distinct at a glance (FR9)

**Given** a server operation fails (load or mutation)
**When** the error occurs
**Then** I see an `ErrorBanner` with a retry action (FR12, NFR3)
**And** failed create preserves my draft description in Zustand

**Given** todos are being fetched
**When** `isPending` is true on the todos query
**Then** a loading indicator is shown — not an empty state (FR11)

## Epic 2: Containerized Deployment

User can build, run, and deploy the application using Docker on any host, with data surviving redeploy and full setup/deploy documentation.

### Story 2.1: Docker Compose & Container Images

As a user,
I want to run the entire application stack via Docker,
So that I can deploy consistently on any Docker-capable host (FR15).

**Acceptance Criteria:**

**Given** the repository with Docker configuration
**When** I run `docker compose up` with the documented commands
**Then** `db` (PostgreSQL 16), `api` (Fastify), and `web` (nginx serving Vite build) services start successfully
**And** the web app is accessible and communicates with the API via `VITE_API_URL`

**Given** separate Dockerfiles in `apps/api` and `apps/web`
**When** I build container images
**Then** each image builds independently without provider-specific tooling

**Given** a named Docker volume for PostgreSQL data
**When** I restart the containers
**Then** todos and tags persist with zero data loss (FR14)

**Given** the production web container uses nginx
**When** API requests are made from the browser
**Then** nginx proxies `/api/v1/*` requests to the API container

**Given** environment configuration
**When** I copy `.env.example` to `.env` and set required values
**Then** all three services start with the documented env vars (`DATABASE_URL`, `VITE_API_URL`, `NODE_ENV`, `PORT`)

**And** Drizzle migrations run as part of the documented deploy workflow

### Story 2.2: README & Deployment Guide

As a developer,
I want complete setup, development, and deployment documentation,
So that I (or another developer) can run, develop, and deploy the app without guesswork (FR16).

**Acceptance Criteria:**

**Given** the root `README.md`
**When** I follow the local setup section
**Then** I can install dependencies, start Postgres, run dev servers, and use the app locally

**Given** the README Docker section
**When** I follow the build and run instructions
**Then** I can start the full stack via Docker Compose without provider-specific tooling (FR15)

**Given** the README deployment section
**When** I follow the guide for at least one non-local target (e.g. self-hosted VPS)
**Then** I can deploy using the same container images with minimal provider-specific configuration
**And** the guide documents env vars, migration steps, and volume persistence

**Given** the documented architecture
**When** I review the README
**Then** it reflects the actual stack (pnpm monorepo, Fastify, React/Vite, Drizzle, PostgreSQL, Docker Compose)
**And** it does not describe a provider-specific fork of the application

