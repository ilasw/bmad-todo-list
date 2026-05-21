# Story 1.3: View & Create Tasks in the UI

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to see my task list immediately on open and add new tasks,
so that I can capture todos without friction (UJ-1).

## Acceptance Criteria

1. **Given** I open the app with no login required **When** the page loads **Then** I see a loading indicator while todos are being fetched (FR11) **And** once loaded, I see all my todos with description, completion status, tags, and creation timestamp (FR2)
2. **Given** the task list is displayed **When** I type a description and submit the add form **Then** the new todo appears in the list immediately with active status (FR1, NFR1) **And** the creation timestamp is visible on the todo
3. **Given** I enter an empty description or one exceeding 2500 characters **When** I attempt to submit **Then** I see a clear validation message and the todo is not created
4. **Given** the initial todo fetch fails **When** the error occurs **Then** I see an error message with a retry action (FR12) **And** the app does not crash (NFR3)
5. **Given** a create request fails after I typed a description **When** the error occurs **Then** my typed description is preserved in the form so I can retry (FR12, NFR3)

## Tasks / Subtasks

- [x] Frontend dependencies & setup (AC: 1–5)
  - [x] Add TanStack Query, Zustand, React Router, Tailwind CSS to `apps/web`
  - [x] Configure Tailwind + PostCSS; set up `QueryClientProvider` in `main.tsx`
  - [x] Add React Router with single route to `TaskListPage`
- [x] API client layer (AC: 1, 2, 4, 5)
  - [x] Create `apps/web/src/api/client.ts` — typed fetch wrapper using `VITE_API_URL`
  - [x] Create `apps/web/src/api/todos.ts` — `fetchTodos()`, `createTodo(input)`
  - [x] Import shared Zod schemas for client-side validation before submit
- [x] Zustand UI store (AC: 5)
  - [x] Create `apps/web/src/stores/ui-store.ts` with `draftDescription` + setter
  - [x] Persist draft on failed create; clear on successful create
- [x] TanStack Query hooks (AC: 1, 2, 4)
  - [x] Create `apps/web/src/features/todos/hooks/use-todos.ts`
  - [x] Query key: `['todos']`; use `isPending` for loading state
  - [x] Create mutation with optimistic add via `onMutate`/`onError`/`onSettled`
- [x] UI components (AC: 1–5)
  - [x] `LoadingSpinner`, `ErrorBanner`, `EmptyState` in `components/ui/`
  - [x] `TaskList`, `TaskItem`, `AddTaskForm` in `features/todos/`
  - [x] `TaskListPage` — orchestrates loading/error/empty/list states
  - [x] Show description, completion checkbox (read-only toggle wiring in 1.4), tags placeholder (empty until 1.6), `createdAt` formatted
- [x] Wire CORS (AC: 1)
  - [x] Ensure API cors plugin allows `http://localhost:5173`

### Review Findings

- [x] [Review][Patch] Optimistic todos not shown while query is pending or errored — `TaskListPage` renders `TaskList` only when `isSuccess && data.length > 0`, so optimistic cache updates from `useCreateTodo` are invisible during initial load (`isPending`) or after a failed fetch (`isError`). Violates AC2/NFR1 immediate appearance. [`apps/web/src/features/todos/pages/TaskListPage.tsx:38-40`]
- [x] [Review][Patch] No automated test for failed-create draft preservation (AC5) — `AddTaskForm.test.tsx` covers validation only; no test mocks a failed mutation and asserts the input retains the typed description. [`apps/web/src/features/todos/AddTaskForm.test.tsx`]
- [x] [Review][Patch] No automated test for fetch failure + retry (AC4) — no test covers `TaskListPage`/`useTodos` error banner and retry callback when `fetchTodos` rejects. [`apps/web/src/features/todos/pages/TaskListPage.tsx`]
- [x] [Review][Patch] Untrimmed description sent to mutation — `AddTaskForm` passes raw `draftDescription` while optimistic UI trims via `input.description.trim()`; submit should use schema-parsed/trimmed value for consistency. [`apps/web/src/features/todos/AddTaskForm.tsx:43-44`, `apps/web/src/features/todos/hooks/use-todos.ts:26`]
- [x] [Review][Defer] Redundant refetch after every create — `onSettled` calls `invalidateQueries` after optimistic create already updates cache; may cause unnecessary network churn. [`apps/web/src/features/todos/hooks/use-todos.ts:51-53`] — deferred, pre-existing

## Dev Notes

First UI story — establishes frontend patterns for all remaining Epic 1 stories.

### Previous Story Intelligence

Story 1.2 provides: `GET/POST /api/v1/todos`, shared Zod schemas, Drizzle `todos` table, standard error shape. API returns `tagIds: []` until Story 1.6. Do not reimplement API endpoints.

### Technical Requirements

- **TanStack Query:** all server data — query key `['todos']`
- **Zustand:** UI-only — `draftDescription` only in this story (filter/undo added later)
- **Optimistic create:** add to cache immediately; revert on API error
- **Loading:** use `isPending` on todos query — never show empty state while loading
- **Empty state:** only when `isSuccess && data.length === 0`
- **VITE_API_URL:** `http://localhost:3000` in dev (document in `.env.example`)

### Architecture Compliance

- Components in `features/todos/` — no todo logic in `App.tsx`
- `components/ui/` is presentational only — no API calls
- Components use hooks — never call `fetch` directly from components
- Import validation from `@todo-list/shared` — single source of truth
- Co-locate tests: `AddTaskForm.test.tsx` next to component (optional but preferred)

### File Structure Requirements

```
apps/web/src/
├── api/           client.ts, todos.ts
├── components/ui/ LoadingSpinner.tsx, ErrorBanner.tsx, EmptyState.tsx
├── features/todos/
│   ├── TaskList.tsx, TaskItem.tsx, AddTaskForm.tsx
│   ├── hooks/use-todos.ts
│   └── pages/TaskListPage.tsx
├── routes/index.tsx
└── stores/ui-store.ts
```

### Testing Requirements

- Manual: load app → spinner → list; create todo → appears immediately; invalid input blocked; kill API → error banner + retry; failed create preserves draft
- Verify no page reload on create (SPA behavior)

### Anti-Patterns (DO NOT)

- ❌ Storing todo list in Zustand
- ❌ Custom `isLoading` boolean instead of TanStack Query `isPending`
- ❌ Showing empty state during initial fetch
- ❌ Clearing form input on failed create
- ❌ Implementing toggle/delete/tag/filter yet (later stories)

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Process Patterns]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.3]

## Dev Agent Record

### Agent Model Used

Composer (Cursor)

### Debug Log References

### Implementation Plan

- TanStack Query owns server state (`['todos']`); Zustand holds `draftDescription` only.
- Optimistic create via `onMutate` with rollback on `onError` and server ID replace on `onSuccess`.
- `TaskListPage` uses `isPending` for spinner, `isSuccess && length === 0` for empty state, `ErrorBanner` + `refetch` on fetch failure.
- Client validation via `createTodoSchema` before POST; API errors surfaced without clearing draft.

### Completion Notes List

- Implemented full task list UI: load spinner, list with description/completed/tags placeholder/createdAt, add form with validation, error retry, draft preservation on failed create.
- Added Vitest tests: `AddTaskForm.test.tsx` (validation), `client.test.ts` (API error parsing).
- CORS in dev explicitly allows `http://localhost:5173` and `http://127.0.0.1:5173`.
- All web tests (5) and API tests (7) pass; web build and lint pass.

### File List

- apps/web/package.json
- apps/web/tsconfig.app.json
- apps/web/tsconfig.node.json
- apps/web/vite.config.ts
- apps/web/src/main.tsx
- apps/web/src/App.tsx
- apps/web/src/index.css
- apps/web/src/api/client.ts
- apps/web/src/api/client.test.ts
- apps/web/src/api/types.ts
- apps/web/src/api/todos.ts
- apps/web/src/stores/ui-store.ts
- apps/web/src/routes/index.tsx
- apps/web/src/components/ui/LoadingSpinner.tsx
- apps/web/src/components/ui/ErrorBanner.tsx
- apps/web/src/components/ui/EmptyState.tsx
- apps/web/src/features/todos/hooks/use-todos.ts
- apps/web/src/features/todos/TaskList.tsx
- apps/web/src/features/todos/TaskItem.tsx
- apps/web/src/features/todos/AddTaskForm.tsx
- apps/web/src/features/todos/AddTaskForm.test.tsx
- apps/web/src/features/todos/pages/TaskListPage.tsx
- apps/web/src/test/setup.ts
- apps/api/src/app.ts
- apps/web/src/App.css (deleted)

## Change Log

- 2026-05-21: Code review — fixed optimistic list visibility, trimmed submit payload, added AC4/AC5 tests.
