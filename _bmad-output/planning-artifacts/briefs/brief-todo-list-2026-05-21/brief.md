---
title: "Product Brief: Todo List"
status: ready
created: 2026-05-21
updated: 2026-05-21
---

# Product Brief: Todo List

## Executive Summary

A personal, self-hosted todo application built as a learning project. The primary goals are to practice the BMad method end-to-end and establish a clean, type-safe full-stack setup using React, Fastify, Zod, and Drizzle. The app gives Luca a single place to capture and track tasks across different areas of life — work, personal projects, errands, and more — without relying on third-party services.

The product is deliberately small: core task management with instant, responsive interactions, durable persistence, and Docker-based deployment to a self-hosted or cloud environment. Success means a running, deployed app with solid technical documentation — usable day-to-day and worth continuing to build on.

## The Problem

Tasks currently live scattered — notes apps, mental lists, ad-hoc reminders — with no single, owned place to see everything at a glance. When juggling multiple life contexts (work, personal, projects, errands), it's hard to know what's active, what's done, and what belongs where.

Existing self-hosted todo tools exist, but this project isn't about filling a market gap. It's about learning: walking through structured product development (BMad), wiring a modern TypeScript stack, and ending up with a simple tool Luca controls and can extend on his own infrastructure.

## The Solution

A full-stack todo app: React frontend, Fastify API, Drizzle ORM with Zod validation throughout. Open the app and immediately see the task list — no onboarding. Add a task with a short description, mark it complete, delete it, or assign free-form tags to organize by context (work, car, shopping, etc.). Tags are created on the fly and reused across tasks. Completed tasks are visually distinct; the list supports filtering by tag.

The backend persists todos and tags via a small CRUD API. The entire application ships as Docker containers deployable to a self-hosted environment or cloud providers (AWS, Render, Vercel, etc.). Architecture leaves room for auth and multi-user support later without a rewrite.

## Scope

**In (v1):**

- Create, view, complete, and delete todos (description, completion status, creation timestamp)
- Free-form tags: create tags, assign multiple tags per todo, filter list by tag
- Responsive UI (desktop + mobile) with empty, loading, and error states
- Instant-feeling updates on user actions
- Fastify API with Zod-validated endpoints; Drizzle for persistence
- Docker containerization with deployable configuration
- Technical documentation for setup, development, and deployment

**Out (v1):**

- User accounts and authentication
- Multi-user / collaboration
- Task prioritization, deadlines, due dates, reminders, notifications
- Subtasks, attachments, comments
- Offline support

## Who This Serves

**Primary user:** Luca — solo user managing personal tasks across multiple life contexts on self-hosted infrastructure. Needs zero-friction capture, clear status at a glance, and tag-based organization without account setup or onboarding.

## Success Criteria

1. **Learning:** BMad workflow completed end-to-end (brief → PRD → architecture → stories → implementation)
2. **Technical:** App runs locally via Docker; successfully deployed to at least one target (self-hosted or cloud provider)
3. **Usability:** Core actions — add, complete, delete, tag, filter by tag — work without guidance
4. **Durability:** Todos and tags persist across browser refresh, container restart, and redeploy
5. **Documentation:** README covers local setup, Docker build/run, and deployment

## Vision

If the project succeeds, it becomes a personal productivity tool Luca runs daily on his own infrastructure — and a reference codebase for type-safe full-stack patterns (Fastify, Drizzle, Zod, React). Future iterations could add authentication, multi-device sync, due dates, or richer organization — but only if the v1 foundation proves stable and useful.
