# AGENT.md

## Purpose

This repository is the reusable baseline for Acoru business-platform systems. It provides a stable starting point for project-specific applications that need Next.js App Router, Vercel deployment, Neon Postgres, plain SQL migrations, and minimal but real API foundations.

## Non-Goals

- Do not turn this baseline into a customer-specific implementation without explicit direction.
- Do not introduce heavy ORMs or broad framework abstractions unless the repository requirements change.
- Do not move business logic into route handlers or client components.

## Required Stack And Deployment Assumptions

- Next.js App Router
- TypeScript
- pnpm
- Neon Postgres accessed from Node runtime only
- GitHub as source control
- Vercel as deployment target

## Architecture Boundaries

- Keep `app/api/**` route handlers thin. They should parse input, call services, and shape HTTP responses.
- Put business logic in `src/server/services/**`.
- Put reusable SQL queries in `src/server/db/queries/**`.
- Put DB client, migration runner, and DB support code in `src/server/db/**`.
- Represent all database schema changes as new plain SQL files under `src/server/db/migrations/**`.
- Keep OpenAPI in `openapi/openapi.yaml` aligned with externally exposed endpoints.

## Security Rules

- Use server-only environment access for database connections and secrets.
- Never expose secrets in client bundles, serialized props, or logs.
- Use parameterized SQL only for application queries.
- Keep DB-backed endpoints on the Node runtime.
- Avoid logging request bodies that may include sensitive data.

## Change Rules

- Avoid unrelated edits.
- Preserve the repository structure unless a structural change is explicitly required.
- Update `openapi/openapi.yaml` whenever an external API contract changes.
- Update `docs/data-dictionary/CORE_TABLES.md` whenever the schema changes.
- Add a new ADR under `docs/adr/**` for important structural or operational decisions.
- When adding tables or columns, include a SQL migration and wire any needed service/query changes together.

## Master Management Plan Guardrails (PR1)

- PR1 scope is limited to shared UI foundation cleanup for existing master list pages only: `clients`, `projects`, and `sites`.
- Maintain behavior compatibility for those existing pages: keep current labels, links, filters, and visible list columns aligned with current behavior.
- Shared extraction in PR1 must stay minimal and master-specific (header/actions, search+status filter row, empty-state wrapper, and common list/table shell only).
- Do not introduce broad framework-style abstractions for PR1; prefer small reusable components colocated with current master UI patterns.
- Follow-up PRs will add `work_categories` and `attendance_policies` on top of the same shared master list structure created in PR1.
- Organization scope / fallback organization cleanup is explicitly out of scope for PR1; avoid semantic changes there unless required for compilation.
- PR1 must not change DB schema, external API contracts, or runtime secret handling.

## Review Checklist

- Are route handlers still thin?
- Is business logic in services rather than routes?
- Are queries parameterized?
- Does every DB schema change have a plain SQL migration?
- Did external API changes update OpenAPI?
- Did schema changes update the data dictionary?
- Are secrets kept server-side and out of logs?
- Does the change preserve the baseline's reuse-oriented structure?

## Local Validation Commands

Run these before finishing work:

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm db:migrate
```
