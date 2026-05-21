# Story 1.3: View & Create Tasks in the UI

Status: ready-for-dev

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

- [ ] Frontend dependencies & setup (AC: 1–5)
  - [ ] Add TanStack Query, Zustand, React Router, Tailwind CSS to `apps/web`
  - [ ] Configure Tailwind + PostCSS; set up `QueryClientProvider` in `main.tsx`
  - [ ] Add React Router with single route to `TaskListPage`
- [ ] API client layer (AC: 1, 2, 4, 5)
  - [ ] Create `apps/web/src/api/client.ts` — typed fetch wrapper using `VITE_API_URL`
  - [ ] Create `apps/web/src/api/todos.ts` — `fetchTodos()`, `createTodo(input)`
  - [ ] Import shared Zod schemas for client-side validation before submit
- [ ] Zustand UI store (AC: 5)
  - [ ] Create `apps/web/src/stores/ui-store.ts` with `draftDescription` + setter
  - [ ] Persist draft on failed create; clear on successful create
- [ ] TanStack Query hooks (AC: 1, 2, 4)
  - [ ] Create `apps/web/src/features/todos/hooks/use-todos.ts`
  - [ ] Query key: `['todos']`; use `isPending` for loading state
  - [ ] Create mutation with optimistic add via `onMutate`/`onError`/`onSettled`
- [ ] UI components (AC: 1–5)
  - [ ] `LoadingSpinner`, `ErrorBanner`, `EmptyState` in `components/ui/`
  - [ ] `TaskList`, `TaskItem`, `AddTaskForm` in `features/todos/`
  - [ ] `TaskListPage` — orchestrates loading/error/empty/list states
  - [ ] Show description, completion checkbox (read-only toggle wiring in 1.4), tags placeholder (empty until 1.6), `createdAt` formatted
- [ ] Wire CORS (AC: 1)
  - [ ] Ensure API cors plugin allows `http://localhost:5173`

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

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
