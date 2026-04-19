# ADR 0001: Baseline Architecture

## Status

Accepted

## Context

Acoru needs a reusable baseline repository that can be cloned for future delivery projects without rebuilding the same server and database foundations each time. The baseline must work well with local development, GitHub-based collaboration, Vercel deployment, and Neon Postgres.

## Decision

We use:

- Next.js App Router for the application shell and Route Handlers
- TypeScript for application and tooling code
- pnpm for package management
- Neon Postgres via `pg` on the Node runtime
- Git-managed plain SQL migrations for schema history

## Rationale

- App Router aligns with Vercel deployment and favors server components and route handlers.
- `pg` keeps the runtime simple and predictable for Node-only database access.
- Plain SQL migrations keep database changes explicit, reviewable, and tool-agnostic.
- Git-managed migrations support repeatable local bootstrap and shared operational history.
- The folder structure separates HTTP handling, business logic, and raw SQL access for maintainability.

## Consequences

- Database-backed endpoints must stay on the Node runtime.
- Schema changes require both SQL and documentation updates.
- Higher-level modeling conveniences from ORMs are intentionally deferred to preserve a lean baseline.
