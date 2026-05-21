# Story 1.5: Delete Task with Undo Toast

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to delete tasks instantly with the option to undo,
so that I can remove stale items quickly without fear of permanent loss (UJ-2).

## Acceptance Criteria

1. **Given** a todo is displayed in the task list **When** I click delete **Then** the todo is removed from the list immediately with no confirmation dialog (FR4) **And** a toast appears with the message "Task deleted" and an Undo button
2. **Given** the delete toast is visible **When** I click Undo within the 5-second window **Then** the todo reappears with its prior description, completion status, tags, and creation timestamp restored
3. **Given** the delete toast is visible **When** 5 seconds elapse without clicking Undo **Then** the API `DELETE /api/v1/todos/:id` is called and the deletion persists after refresh
4. **Given** the delete toast is visible **When** I do not click Undo and refresh after the timer expires **Then** the todo remains deleted (FR4)
5. **Given** the API returns an error after optimistic delete **When** the error occurs **Then** the todo is restored in the list and an error is shown (NFR3)
6. **And** the implementation follows the mandatory delete-undo pattern: optimistic remove → Zustand snapshot → 5s timer → delayed DELETE (no immediate server DELETE on click)

## Tasks / Subtasks

- [ ] API: DELETE endpoint (AC: 3, 4)
  - [ ] Add `deleteTodo(id)` to `todo-service.ts`
  - [ ] Add `DELETE /api/v1/todos/:id` — 404 if not found, 204 or 200 on success
- [ ] Zustand undo state (AC: 1, 2, 6)
  - [ ] Extend `ui-store.ts`: `pendingDelete: Todo | null`, `setPendingDelete`, `clearPendingDelete`
  - [ ] Store full todo snapshot (description, completed, tagIds, createdAt, id) on delete click
- [ ] DeleteToast component (AC: 1, 2, 3)
  - [ ] Create `features/todos/DeleteToast.tsx`
  - [ ] Message: "Task deleted" + Undo button
  - [ ] 5-second countdown timer; on expiry call `DELETE /api/v1/todos/:id`
  - [ ] On Undo: restore todo to TanStack Query cache, clear `pendingDelete`
- [ ] Optimistic delete mutation (AC: 1, 5, 6)
  - [ ] Add delete flow in `use-todos.ts`: optimistic remove from cache on click
  - [ ] Do NOT call DELETE API on click — only after timer expiry
  - [ ] On API error after expiry: restore todo to cache, show error
- [ ] UI integration (AC: 1)
  - [ ] Add delete button to `TaskItem.tsx`
  - [ ] Render `DeleteToast` at page level when `pendingDelete` is set
  - [ ] Only one pending delete at a time (new delete replaces previous timer)

## Dev Notes

**CRITICAL:** This is the highest-risk story for misimplementation. The architecture mandates a specific delete-undo flow — follow it exactly.

### Previous Story Intelligence

Stories 1.3–1.4 provide: TanStack Query `['todos']` cache, optimistic mutation patterns, TaskItem, ErrorBanner, ui-store with `draftDescription`. Extend ui-store — do not create a separate undo store unless architecture requires it (`undoStore` alias acceptable but single store preferred).

### Mandatory Delete-Undo Flow

1. User clicks delete → remove from UI immediately (optimistic)
2. Store full todo snapshot in Zustand `pendingDelete`
3. Show `DeleteToast` with 5s timer
4. Undo → restore snapshot to TanStack Query cache, clear `pendingDelete`
5. Timer expires → call `DELETE /api/v1/todos/:id`, clear `pendingDelete`

### Technical Requirements

- **No confirmation dialog** before delete (PRD non-goal)
- **No immediate server DELETE** on button click
- **Timer:** 5 seconds exactly
- **Restore must preserve:** description, completed, tagIds, createdAt
- **Single pending delete:** starting a new delete cancels previous timer and replaces snapshot

### Architecture Compliance

- DeleteToast + ui-store pattern is mandatory per architecture doc
- TanStack Query owns list data — undo restores cache, not Zustand list
- Error after delayed DELETE restores item to cache

### File Structure Requirements

**New:**
- `apps/web/src/features/todos/DeleteToast.tsx`

**Modify:**
- `apps/api/src/services/todo-service.ts`, `routes/todos.ts`
- `apps/web/src/api/todos.ts`
- `apps/web/src/stores/ui-store.ts`
- `apps/web/src/features/todos/hooks/use-todos.ts`
- `apps/web/src/features/todos/TaskItem.tsx`
- `apps/web/src/features/todos/pages/TaskListPage.tsx`

### Testing Requirements

- Manual: delete → toast → undo → item restored with all fields
- Manual: delete → wait 5s → refresh → item gone
- Manual: delete → wait 5s → API fails → item restored + error
- Verify no confirm() dialog anywhere

### Anti-Patterns (DO NOT)

- ❌ `DELETE` API call on button click
- ❌ Confirmation modal/dialog before delete
- ❌ Soft-delete on server (hard delete after timer)
- ❌ Storing deleted todo only in Zustand without cache restore on undo
- ❌ Using `window.confirm()`

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Delete Undo Pattern]
- [Source: _bmad-output/planning-artifacts/architecture.md#Communication Patterns]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.5]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
