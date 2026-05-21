# Story 1.6: Tag Tasks on Create & Edit

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to assign and remove tags on my todos,
so that I can organize tasks by life context (UJ-3).

## Acceptance Criteria

1. **Given** I am creating or editing a todo **When** I add tag names (e.g. `work`, `car`) **Then** those tags are attached to the todo and displayed on the task item (FR5) **And** tags not yet in the system are created automatically
2. **Given** a todo carries multiple tags **When** I remove one tag from that todo **Then** the tag is removed from this todo only (FR6) **And** other todos carrying the same tag are unaffected
3. **Given** the database schema **When** tag migrations are applied **Then** `tags` and `todo_tags` tables exist alongside `todos`
4. **Given** the API **When** I create or update a todo with `tagNames: ["work", "car"]` **Then** tags are find-or-created via tag service and associated via the join table **And** `GET /api/v1/tags` returns `{ id, name }[]` for all tags in the system

## Tasks / Subtasks

- [ ] Database schema (AC: 3)
  - [ ] Add `tags` table: `id` (uuid), `name` (unique), `user_id` (nullable)
  - [ ] Add `todo_tags` join table: `todo_id`, `tag_id` (composite PK or unique constraint)
  - [ ] Generate and run Drizzle migration
- [ ] Tag service (AC: 1, 2, 4)
  - [ ] Create `apps/api/src/services/tag-service.ts` — `listTags()`, `findOrCreateByNames(names[])`
  - [ ] Tag names: trim whitespace; reject empty strings
- [ ] Extend todo service (AC: 1, 2, 4)
  - [ ] Update create/update to accept optional `tagNames: string[]`
  - [ ] Replace tag associations on update (full tag set semantics)
  - [ ] Return `tagIds: string[]` on all todo responses
  - [ ] Load tag names for display or return tag objects as needed by frontend
- [ ] Shared schemas (AC: 4)
  - [ ] Extend `createTodoSchema` and `updateTodoSchema` with optional `tagNames`
  - [ ] Add tag schemas in `packages/shared/src/schemas/tag.ts`
- [ ] API routes (AC: 4)
  - [ ] Create `apps/api/src/routes/tags.ts` — `GET /api/v1/tags`
  - [ ] Extend `PATCH /api/v1/todos/:id` to accept `tagNames` for edit/remove tags
- [ ] Frontend: tag input on create (AC: 1)
  - [ ] Extend `AddTaskForm` with tag input (comma-separated or chip input)
  - [ ] Send `tagNames` on create mutation
  - [ ] Display tags on `TaskItem` (badges/chips)
- [ ] Frontend: tag edit/remove (AC: 2)
  - [ ] Add inline tag editing on TaskItem or edit mode
  - [ ] PATCH with updated `tagNames` array (omit tag = remove from todo)
- [ ] Tags query hook (AC: 4)
  - [ ] Create `apps/web/src/api/tags.ts` + `hooks/use-tags.ts`
  - [ ] Query key: `['tags']`

## Dev Notes

Introduces tagging domain — filter UI comes in Story 1.7; do not implement tag filter here.

### Previous Story Intelligence

Stories 1.2–1.5 provide: todos CRUD API, TanStack Query patterns, TaskItem, AddTaskForm, PATCH/DELETE endpoints. API currently returns `tagIds: []` — this story makes that real. Delete undo must still restore tags on undo (ensure snapshot includes tagIds/tagNames).

### Technical Requirements

- **Tag assignment:** `tagNames: ["work", "car"]` on create/update body
- **Find-or-create:** new tag names auto-create `tags` row
- **Remove tag from todo:** PATCH with updated `tagNames` excluding removed tag — do NOT delete tag row from `tags` table
- **GET /tags:** returns `{ id, name }[]` — camelCase JSON
- **Index:** `idx_tags_name` on tags.name for lookup performance

### Schema

```
tags: id (uuid PK), name (text unique not null), user_id (nullable)
todo_tags: todo_id (FK), tag_id (FK), unique(todo_id, tag_id)
```

### Architecture Compliance

- Tag logic in `tag-service.ts` — routes stay thin
- Services don't know about HTTP
- Shared Zod schemas validate tagNames on both API and client
- Update delete-undo snapshot to include tags so undo restores them

### File Structure Requirements

**New:**
- `apps/api/src/services/tag-service.ts`
- `apps/api/src/routes/tags.ts`
- `packages/shared/src/schemas/tag.ts`
- `apps/web/src/api/tags.ts`
- `apps/web/src/features/todos/hooks/use-tags.ts`

**Modify:**
- `apps/api/src/db/schema.ts`, todo-service, todos routes
- `packages/shared/src/schemas/todo.ts`
- `AddTaskForm.tsx`, `TaskItem.tsx`, `use-todos.ts`

### Testing Requirements

- API: create todo with new tags, create with existing tags, update to remove one tag, GET /tags
- Verify tag removed from one todo does not affect others
- Verify undo delete restores tags (regression from 1.5)

### Anti-Patterns (DO NOT)

- ❌ Deleting tag row from `tags` when removing from a todo
- ❌ Server-side tag filter (client-side in Story 1.7)
- ❌ Duplicating tag validation outside shared schemas
- ❌ Multi-tag AND filter logic (v1 non-goal)

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Format Patterns]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.6]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
