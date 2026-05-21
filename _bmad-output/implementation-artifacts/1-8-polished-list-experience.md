# Story 1.8: Polished List Experience

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want a responsive, polished task list with graceful empty, loading, and error states,
so that the app feels complete and usable on any device (FR9–FR13).

## Acceptance Criteria

1. **Given** the task list has no todos and no active filter **When** the list renders after loading completes **Then** I see a clear empty-state message — not a blank screen (FR10)
2. **Given** I am on a mobile viewport (≤768px) or desktop viewport (≥1024px) **When** I use the task list and core actions (add, toggle, delete, tag, filter) **Then** all controls are usable without horizontal scrolling or clipped elements (FR13)
3. **Given** Tailwind CSS is configured **When** I view active vs completed todos **Then** completed todos remain visible and are visually distinct at a glance (FR9)
4. **Given** a server operation fails (load or mutation) **When** the error occurs **Then** I see an `ErrorBanner` with a retry action (FR12, NFR3) **And** failed create preserves my draft description in Zustand
5. **Given** todos are being fetched **When** `isPending` is true on the todos query **Then** a loading indicator is shown — not an empty state (FR11)

## Tasks / Subtasks

- [ ] Audit & refine loading/empty/error states (AC: 1, 4, 5)
  - [ ] Verify `LoadingSpinner` shows during initial `isPending` — never empty state while loading
  - [ ] Global empty: friendly message + optional CTA to add first task
  - [ ] Filtered empty: distinct message (from 1.7) — confirm copy is clear
  - [ ] `ErrorBanner` on fetch failure with retry (`refetch()`)
  - [ ] Mutation errors: inline or banner with retry where appropriate
  - [ ] Failed create preserves `draftDescription` in Zustand
- [ ] Responsive layout polish (AC: 2)
  - [ ] Mobile (≤768px): stack layout, full-width inputs, touch-friendly tap targets (min 44px)
  - [ ] Desktop (≥1024px): comfortable spacing, readable line lengths
  - [ ] Test add form, toggle, delete, tags, filter at both breakpoints — no horizontal scroll
  - [ ] DeleteToast positioned accessibly on mobile (bottom fixed or similar)
- [ ] Visual polish for completed todos (AC: 3)
  - [ ] Refine `TaskItem` completed styling: strikethrough/muted/opacity — distinct at a glance
  - [ ] Completed todos always visible in list (active + completed together)
  - [ ] Consistent tag badge styling across states
- [ ] Page-level layout (AC: 2)
  - [ ] Refine `TaskListPage` layout: header, add form, tag filter, list, toast overlay
  - [ ] Sensible max-width container on desktop; full width on mobile
- [ ] Final integration pass (AC: 1–5)
  - [ ] Walk through all FR9–FR13 scenarios end-to-end
  - [ ] Fix any regressions from polish changes

## Dev Notes

This is a **polish and hardening** story — most features exist from 1.3–1.7. Focus on UX completeness, responsive layout, and state handling edge cases. Avoid new features or scope creep.

### Previous Story Intelligence

Stories 1.3–1.7 deliver: full CRUD UI, tags, filter, delete undo, TanStack Query + Zustand, Tailwind, EmptyState/ErrorBanner/LoadingSpinner. This story refines — do not rewrite architecture or add new API endpoints.

### Technical Requirements

- **Empty vs loading:** `isPending` → spinner; `isSuccess && length === 0 && !filter` → global empty; filtered empty separate
- **Responsive:** Tailwind breakpoints `md:` (768px), `lg:` (1024px)
- **FR13:** no horizontal overflow on core flows — test in browser devtools
- **Error retry:** wire `ErrorBanner` to TanStack Query `refetch()` or mutation retry
- **Draft preservation:** verify Zustand `draftDescription` on failed create (regression check)

### Architecture Compliance

- UI primitives stay in `components/ui/` — presentational only
- Feature layout in `TaskListPage` and `features/todos/`
- No new state libraries or routing changes

### File Structure Requirements

**Primary modify:**
- `apps/web/src/features/todos/pages/TaskListPage.tsx`
- `apps/web/src/features/todos/TaskList.tsx`
- `apps/web/src/features/todos/TaskItem.tsx`
- `apps/web/src/features/todos/AddTaskForm.tsx`
- `apps/web/src/features/todos/TagFilter.tsx`
- `apps/web/src/features/todos/DeleteToast.tsx`
- `apps/web/src/components/ui/EmptyState.tsx`, `ErrorBanner.tsx`, `LoadingSpinner.tsx`
- `apps/web/src/index.css` — base Tailwind styles if needed

### Testing Requirements

- Manual responsive test at 375px, 768px, 1024px widths
- Manual state matrix: loading, global empty, filtered empty, error+retry, failed create draft
- Manual: completed todos visually distinct with mixed active/completed list
- No new automated test requirement unless regressions found

### Anti-Patterns (DO NOT)

- ❌ Showing empty state while `isPending` is true
- ❌ Hiding completed todos
- ❌ Adding authentication, CI, Docker, or README work (Epic 2)
- ❌ Large refactors unrelated to polish (scope creep)

### Epic 1 Completion Note

When this story is done, all Epic 1 FRs (FR1–FR14 dev persistence) should be satisfied in local dev. Epic 1 retrospective (`epic-1-retrospective`) can be run after code review marks all stories done.

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Process Patterns — Loading State Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.8]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
