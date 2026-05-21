---
title: "PRD: Todo List"
status: final
created: 2026-05-21
updated: 2026-05-21
---

# PRD: Todo List

## 0. Document Purpose

This PRD defines v1 requirements for a personal todo application built as a learning project. Primary reader: Luca (builder and sole user). Downstream consumers: architecture, epics/stories, and implementation workflows in BMad. Capabilities and testable behavior live here; technology choices (stack, schema, deployment mechanics) belong in architecture unless noted as assumptions.

## 1. Vision

A simple, owned todo application for managing personal tasks across life contexts — work, projects, errands, and more — without third-party services or account setup.

Open the app and immediately see your task list. Add a task with a description, mark it complete, delete it, or tag it by context. Completed tasks look clearly different from active ones; the list stays fast and responsive on desktop and mobile. Tags are free-form labels you create as needed (e.g. work, car, shopping) and reuse across tasks; filter the list by tag when you want to focus on one context.

The product is deliberately small: core task management with durable persistence, instant-feeling interactions, and Docker-based deployment to self-hosted or cloud infrastructure. Success means a running, deployed app you use day-to-day — plus a clean reference codebase and documentation worth extending. Authentication, collaboration, deadlines, and richer organization stay out of v1 but the design must not block them later.

## 2. Target User

### 2.1 Primary Persona

Luca — solo builder and user running a self-hosted todo app for personal task management. Juggles multiple life contexts (work, projects, errands, car maintenance, shopping) without a single owned place to see everything. Values zero-friction capture, clear status at a glance, and tag-based organization without accounts or onboarding. Comfortable with Docker and self-hosting; building this app is also a learning exercise in structured product development and type-safe full-stack patterns.

### 2.2 Jobs To Be Done

- Capture a task quickly before I forget it, without setup or explanation
- See what's active vs done across all contexts in one place
- Focus on one context (e.g. work only) when I need to
- Trust that my tasks survive refresh, restart, and redeploy
- Run the app on infrastructure I control

### 2.3 Non-Users (v1)

- Teams or collaborators needing shared task lists
- Users requiring accounts, permissions, or multi-device sync policies
- Power users needing deadlines, priorities, reminders, or subtasks

### 2.4 Key User Journeys

- **UJ-1. Luca captures a task on first open**
  Luca opens the app (no login). The task list loads immediately — empty or populated. He types a description, submits, and the new todo appears in the list without leaving the page. **Edge case:** if the save fails, he sees an error and can retry without losing what he typed.

- **UJ-2. Luca clears a work item and sees progress**
  Luca has mixed todos across contexts. He toggles a work task complete — it immediately shows as completed (visually distinct from active items). He toggles it back if he marked it by mistake, or deletes a stale errand — the Todo vanishes instantly and a toast reads "Task deleted" with an Undo button. He taps Undo and the errand reappears. Changes persist after refresh.

- **UJ-3. Luca focuses on one context with tags**
  Luca adds tags like `work` and `car` to todos as he creates or edits them — tags are created on the fly and reused. He selects the `work` tag filter and sees only work-tagged todos. Clearing the filter returns the full list.

## 3. Glossary

- **Todo** — A single personal task. Has a textual description (1–2500 characters), a completion status (active or completed), a creation timestamp, and zero or more Tags. One Todo represents one actionable item.

- **Tag** — A free-form text label used to organize Todos by context (e.g. `work`, `car`, `shopping`). Tags are created on the fly when assigned to a Todo and are reused across Todos. A Todo may have multiple Tags; a Tag may appear on multiple Todos.

- **Task list** — The primary view shown when the user opens the application. Displays Todos subject to the current Tag filter (if any). Includes active and completed Todos unless a filter excludes them.

- **Tag filter** — A single-tag selection that limits the Task list to Todos carrying that Tag. Only one Tag filter is active at a time in v1. Clearing the filter restores the unfiltered Task list.

- **Completion status** — Whether a Todo is active (not done) or completed (done). Completed Todos remain visible in the Task list and are visually distinct from active Todos.

- **Delete toast** — A transient notification shown immediately after a Todo is deleted. Displays the message "Task deleted" and an **Undo** control that restores the deleted Todo if activated before the toast dismisses.

## 4. Features

### 4.1 Task Management

**Description:** Core CRUD for Todos. User opens the app to the Task list and manages items without onboarding. Each Todo has a description, completion status, and creation timestamp. Realizes UJ-1, UJ-2.

**Functional Requirements:**

#### FR-1: Create todo

User can add a Todo with a textual description. New Todo appears in the Task list with active completion status and a creation timestamp. Realizes UJ-1.

**Consequences (testable):**
- New Todo is visible in the Task list immediately after creation succeeds
- Creation timestamp is stored and displayed with the Todo
- Description must be non-empty and no longer than 2500 characters; submissions outside that range are rejected with a clear validation message

#### FR-2: View task list

User sees the Task list immediately on open — all Todos subject to the active Tag filter, including active and completed. Each Todo shows description, completion status, Tags, and creation timestamp. Realizes UJ-1, UJ-2.

**Consequences (testable):**
- Task list loads without login or onboarding steps
- Todos missing from the list only when excluded by an active Tag filter

#### FR-3: Toggle completion status

User can mark an active Todo as completed or mark a completed Todo back to active (toggle). Status updates immediately in the Task list. Realizes UJ-2.

**Consequences (testable):**
- Toggling completion updates visual distinction without page reload
- Completion status persists after browser refresh

#### FR-4: Delete todo with undo

User can remove a Todo from the Task list with instant delete — no confirmation dialog. Immediately after delete, a Delete toast appears with the message "Task deleted" and an Undo control. Realizes UJ-2.

**Consequences (testable):**
- Deleted Todo no longer appears in the Task list as soon as delete succeeds
- Delete toast is visible with both the message and Undo control
- Undo restores the deleted Todo with its prior description, completion status, Tags, and creation timestamp
- If Undo is not used, deletion persists after browser refresh

### 4.2 Tagging & Organization

**Description:** Free-form Tags for context grouping. Created on the fly, reused across Todos, filterable one at a time. Realizes UJ-3.

**Functional Requirements:**

#### FR-5: Assign tags

User can attach one or more Tags to a Todo when creating or editing it. Tags not yet in the system are created automatically. Realizes UJ-3.

**Consequences (testable):**
- A Todo may carry multiple Tags simultaneously
- A newly typed Tag name becomes available for reuse on other Todos

#### FR-6: Remove tags

User can remove a Tag from a Todo without deleting that Tag from other Todos.

**Consequences (testable):**
- Removing a Tag from one Todo does not remove it from Todos that still carry it

#### FR-7: Filter by tag

User can activate a Tag filter to show only Todos carrying that Tag. Realizes UJ-3.

**Consequences (testable):**
- Only one Tag filter is active at a time
- Todos without the selected Tag are hidden while the filter is active

#### FR-8: Clear tag filter

User can clear the active Tag filter to restore the full Task list. Realizes UJ-3.

**Consequences (testable):**
- All Todos reappear when the filter is cleared

### 4.3 List Experience

**Description:** Polished, responsive Task list with clear status communication and graceful states. Realizes UJ-1, UJ-2, UJ-3.

**Functional Requirements:**

#### FR-9: Distinguish completed todos

Completed Todos are always visible and visually distinct from active Todos in the Task list. Realizes UJ-2.

**Consequences (testable):**
- User can tell active from completed Todos at a glance without interacting

#### FR-10: Empty state

When the Task list has no Todos, or none match the active Tag filter, user sees a clear empty-state message — not a blank screen.

#### FR-11: Loading state

While Todos are being fetched, user sees a loading indicator instead of a broken or empty list.

#### FR-12: Error state

When a load or save fails, user sees an error message and can retry without losing in-progress input. Realizes UJ-1 edge case.

**Consequences (testable):**
- Failed create does not silently discard the description the user entered

#### FR-13: Responsive layout

Task list and core actions are usable on desktop and mobile viewports without horizontal scrolling or clipped controls.

### 4.4 Persistence & Delivery

**Description:** Data durability and deployable delivery. Learning-project success criteria from the brief. Technology choices deferred to architecture.

**Functional Requirements:**

#### FR-14: Durable persistence

Todos and Tags persist across browser refresh, application restart, and redeploy. No data loss under normal operation.

**Consequences (testable):**
- Todos and Tags survive container restart when using the documented Docker setup

#### FR-15: Docker deployment

Application ships as Docker containers as the primary delivery unit. Local development and production run via the same Docker-based workflow. Deployment is provider-agnostic — any Docker-capable host (self-hosted server, AWS, Render, etc.) should work with minimal provider-specific configuration; v1 does not lock the product to a single cloud vendor.

**Consequences (testable):**
- App runs locally using documented Docker commands without provider-specific tooling
- At least one non-local deployment is documented using the same container images

#### FR-16: Technical documentation

README covers local setup, development workflow, Docker build/run, and deployment to at least one target environment using the standard container configuration — not a provider-specific fork of the application.

## 5. Non-Goals (Explicit)

- User accounts and authentication
- Multi-user or collaborative task lists
- Task prioritization, deadlines, due dates, reminders, or notifications
- Subtasks, attachments, or comments
- Offline support
- Multi-tag AND filtering (filtering one Tag at a time only in v1)
- Hiding or archiving completed Todos (they remain visible in v1)
- Delete confirmation dialogs (delete is instant; recovery via Delete toast Undo only)

## 6. MVP Scope

### 6.1 In Scope

- Create, view, toggle completion, and delete Todos with undo toast (description 1–2500 characters, completion status, creation timestamp)
- Free-form Tags: create on the fly, assign multiple per Todo, remove from Todo, filter by single Tag
- Responsive UI (desktop + mobile) with empty, loading, and error states
- Instant-feeling updates on user actions
- Durable persistence across refresh, restart, and redeploy
- Docker containerization with deployable configuration
- Technical documentation for setup, development, and deployment

### 6.2 Out of Scope for MVP

- Authentication and multi-user — deferred to future iteration; v1 assumes single-user trust on self-hosted infra
- Priorities, deadlines, reminders — deferred; v1 focuses on capture and status, not scheduling
- Subtasks and attachments — deferred; one Todo equals one task in v1
- Offline support — deferred; v1 requires network for persistence

## 7. Success Metrics

**Primary**

- **SM-1: Core actions without guidance** — User completes add, toggle completion, delete (with optional Undo), tag, and filter-by-tag flows on first attempt without instructions. Validates FR-1, FR-3, FR-4, FR-5, FR-7, FR-8.
- **SM-2: Durability** — Todos and Tags survive browser refresh, container restart, and redeploy with zero data loss in normal operation. Validates FR-14.
- **SM-3: Deployed and documented** — App runs locally via Docker and is deployed to at least one target; README enables another developer to set up, develop, and deploy. Validates FR-15, FR-16.

**Secondary**

- **SM-4: Learning workflow** — BMad method completed end-to-end (brief → PRD → architecture → stories → implementation).
- **SM-5: Daily usability** — App feels complete enough to use for personal task management after v1 ships.

**Counter-metrics (do not optimize)**

- **SM-C1: Feature count** — Resist adding v2 capabilities (auth, deadlines, subtasks) before core flows are stable and deployed. Counterbalances scope creep during the learning project.

## 8. Cross-Cutting NFRs

- **NFR-1 Responsiveness:** User actions (create, toggle completion, delete, tag, filter) reflect in the UI without perceptible delay under normal network conditions.
- **NFR-2 Simplicity:** Solution remains understandable and maintainable by a solo developer — no unnecessary abstraction in v1.
- **NFR-3 Error handling:** Client and server handle failures gracefully; errors do not crash the app or silently discard user input.
- **NFR-4 Extensibility:** v1 design does not preclude adding authentication or multi-user support in a future version.

## 9. Open Questions

*None — all items resolved during coaching (see decision log).*

## 10. Assumptions Index

*No open `[ASSUMPTION]` tags.*

