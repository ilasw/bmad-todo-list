# Story 1.7: Filter Tasks by Tag

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to filter my task list by a single tag,
so that I can focus on one context at a time (UJ-3).

## Acceptance Criteria

1. **Given** todos exist with various tags **When** I select a tag filter (e.g. `work`) **Then** only todos carrying that tag are visible (FR7) **And** only one tag filter is active at a time
2. **Given** an active tag filter **When** I clear the filter **Then** all todos reappear in the full task list (FR8)
3. **Given** an active tag filter **When** no todos match the selected tag **Then** I see a clear empty-state message indicating no matching tasks (FR10)
4. **Given** todos are loaded in TanStack Query cache **When** I change the tag filter **Then** filtering happens client-side via Zustand `activeTagFilter` without an additional API call

## Tasks / Subtasks

- [ ] Zustand filter state (AC: 1, 2, 4)
  - [ ] Extend `ui-store.ts`: `activeTagFilter: string | null` (tag id or name — pick one, document choice)
  - [ ] Actions: `setActiveTagFilter`, `clearActiveTagFilter`
- [ ] TagFilter component (AC: 1, 2)
  - [ ] Create `features/todos/TagFilter.tsx`
  - [ ] List available tags from `useTags()` hook
  - [ ] Single-select: clicking active tag again or "All" clears filter
  - [ ] Visual indicator of active filter
- [ ] Client-side filtering (AC: 1, 3, 4)
  - [ ] In `TaskListPage` or `TaskList`: derive `filteredTodos` from cache + `activeTagFilter`
  - [ ] Filter logic: todo visible if any of its tags matches active filter
  - [ ] No additional API call on filter change
- [ ] Empty state for filtered view (AC: 3)
  - [ ] When filter active + zero matches: show message like "No tasks with tag 'work'" — not generic empty
  - [ ] Distinguish from global empty (no todos at all)
- [ ] Integration (AC: 1–4)
  - [ ] Add `TagFilter` to `TaskListPage` layout
  - [ ] Ensure create/toggle/delete still operate on full cache; list display respects filter

## Dev Notes

Filtering is **client-side only** in v1 — do not add query params to API.

### Previous Story Intelligence

Story 1.6 provides: tags on todos, `GET /api/v1/tags`, `use-tags.ts` with `['tags']` query, tag display on TaskItem. Story 1.3 established empty state component — extend behavior for filtered empty vs global empty.

### Technical Requirements

- **Single active filter:** selecting a new tag replaces previous — no multi-tag AND
- **Clear filter:** explicit control + toggling active tag off
- **Filter key:** match by tag id (preferred) or name — be consistent with TagFilter UI
- **Performance:** filter in render/useMemo over cached todos — no refetch
- **Mutations while filtered:** new todo appears only if it matches filter (or always show with filter re-eval)

### Architecture Compliance

- `activeTagFilter` in Zustand only — never in TanStack Query
- Tag list data from `['tags']` query — filter state from Zustand
- `TagFilter.tsx` lives in `features/todos/`

### File Structure Requirements

**New:**
- `apps/web/src/features/todos/TagFilter.tsx`

**Modify:**
- `apps/web/src/stores/ui-store.ts`
- `apps/web/src/features/todos/TaskList.tsx` or `TaskListPage.tsx`
- `apps/web/src/components/ui/EmptyState.tsx` — optional prop for custom message

### Testing Requirements

- Manual: filter by tag → only matching todos visible
- Manual: clear filter → full list returns
- Manual: filter with no matches → filtered empty message
- Manual: network tab shows no new API calls on filter change
- Verify only one filter active at a time

### Anti-Patterns (DO NOT)

- ❌ `GET /api/v1/todos?tag=work` server filter
- ❌ Multi-tag AND filtering
- ❌ Storing filtered list as separate TanStack Query cache key
- ❌ Hiding completed todos when filtering (FR9 — completed stay visible)

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture — Tag filter client-side]
- [Source: _bmad-output/planning-artifacts/architecture.md#State Management Patterns]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.7]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
