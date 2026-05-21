# Story 1.4: Toggle Task Completion

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to mark tasks complete or revert them to active,
so that I can track progress and fix mistakes (UJ-2).

## Acceptance Criteria

1. **Given** a todo with active status is displayed **When** I toggle its completion control **Then** the todo immediately shows as completed with visually distinct styling (FR3, FR9, NFR1) **And** no page reload occurs
2. **Given** a completed todo is displayed **When** I toggle its completion control **Then** the todo immediately returns to active status with active styling
3. **Given** a toggle succeeds **When** I refresh the browser **Then** the completion status persists (FR3)
4. **Given** the API returns an error during toggle **When** the optimistic update was applied **Then** the UI reverts to the previous status and shows an error (NFR3)
5. **Given** the API endpoint `PATCH /api/v1/todos/:id` accepts `{ "completed": true | false }` **When** a valid todo id and body are sent **Then** the server updates and returns the updated todo

## Tasks / Subtasks

- [x] API: PATCH endpoint (AC: 5)
  - [x] Add `updateTodoSchema` to `packages/shared` — partial `{ completed: boolean }` (and extensible for later fields)
  - [x] Extend `todo-service.ts` with `updateTodo(id, input)`
  - [x] Add `PATCH /api/v1/todos/:id` in `routes/todos.ts` — 404 if not found
- [x] API client (AC: 1–4)
  - [x] Add `updateTodo(id, { completed })` to `apps/web/src/api/todos.ts`
- [x] Optimistic toggle mutation (AC: 1, 2, 4)
  - [x] Add `useToggleTodo` or extend `use-todos.ts` with toggle mutation
  - [x] `onMutate`: cancel queries, snapshot previous, flip `completed` in cache
  - [x] `onError`: restore snapshot, surface error via ErrorBanner or inline toast
  - [x] `onSettled`: invalidate `['todos']`
- [x] UI wiring (AC: 1, 2, 9)
  - [x] Wire checkbox/toggle in `TaskItem.tsx` to toggle mutation
  - [x] Add distinct Tailwind styles for completed vs active (strikethrough, muted color, etc.)
  - [x] Disable toggle control while mutation `isPending` for that item
- [x] Persistence verification (AC: 3)
  - [x] Manual test: toggle → refresh → status retained

## Dev Notes

Extends existing list UI and API — do not rebuild TaskList or create flow.

### Previous Story Intelligence

Stories 1.2–1.3 provide: todos CRUD (list/create), TanStack Query cache with `['todos']`, optimistic create pattern, TaskItem with checkbox placeholder, ErrorBanner, shared Zod schemas. Follow the same optimistic mutation pattern established in 1.3.

### Technical Requirements

- **PATCH semantics:** send only changed fields — `{ "completed": true | false }`
- **Optimistic update pattern:** identical to architecture doc example (cancelQueries → setQueryData → revert on error)
- **Visual distinction (FR9):** completed todos remain visible in list — never hide them
- **404 handling:** return `{ error: { code: "NOT_FOUND", ... } }` for invalid id

### Architecture Compliance

- Mutation config lives in `hooks/use-todos.ts` — not in `TaskItem` directly
- Service layer handles DB update; route validates and returns camelCase JSON
- No full-page loader on toggle — button-level pending state only

### File Structure Requirements

**Modify (do not recreate):**
- `packages/shared/src/schemas/todo.ts` — add `updateTodoSchema`
- `apps/api/src/services/todo-service.ts` — add update
- `apps/api/src/routes/todos.ts` — add PATCH
- `apps/web/src/api/todos.ts` — add updateTodo
- `apps/web/src/features/todos/hooks/use-todos.ts` — toggle mutation
- `apps/web/src/features/todos/TaskItem.tsx` — wire toggle + styling

### Testing Requirements

- API: PATCH valid id, PATCH invalid id (404), PATCH with invalid body (400)
- UI: optimistic toggle, error revert, refresh persistence
- Co-located service test for update logic

### Anti-Patterns (DO NOT)

- ❌ Full page reload or `window.location.reload()` on toggle
- ❌ Hiding completed todos from the list
- ❌ Storing completion state in Zustand instead of TanStack Query cache
- ❌ Sending entire todo object on PATCH when only `completed` changed

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Communication Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Pattern Examples]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.4]

## Dev Agent Record

### Agent Model Used

Composer

### Debug Log References

- Fixed flaky API route GET test by locating created todo by id (parallel DB writes from multiple suites).
- Set API test runner to `--test-concurrency=1` to avoid shared-database race conditions between route and service suites.

### Completion Notes List

- Added `updateTodoSchema` and `UpdateTodoInput` type in shared package for PATCH body validation.
- Implemented `updateTodo` service and `PATCH /api/v1/todos/:id` route with `NOT_FOUND` error handling.
- Added `useToggleTodo` mutation with optimistic cache update, error rollback, and query invalidation.
- Wired `TaskItem` checkbox to toggle mutation with completed/active styling and per-item pending disable.
- Added API route tests (200/404/400), service test for update logic, and UI tests for optimistic toggle and error revert.
- Persistence (AC3) verified via API integration: PATCH persists to DB and subsequent GET returns updated `completed` state.

### File List

- packages/shared/src/schemas/todo.ts
- packages/shared/src/types/index.ts
- packages/shared/src/index.ts
- apps/api/src/lib/errors.ts
- apps/api/src/services/todo-service.ts
- apps/api/src/services/todo-service.test.ts
- apps/api/src/routes/todos.ts
- apps/api/src/routes/todos.test.ts
- apps/api/package.json
- apps/web/src/api/todos.ts
- apps/web/src/features/todos/hooks/use-todos.ts
- apps/web/src/features/todos/TaskItem.tsx
- apps/web/src/features/todos/TaskItem.test.tsx

## Change Log

- 2026-05-21: Implemented toggle task completion — PATCH API, optimistic UI mutation, styling, and tests (Story 1.4)
- 2026-05-21: Code review — per-item optimistic rollback, persistence and concurrent-toggle tests.
