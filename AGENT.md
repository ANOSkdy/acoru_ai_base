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
