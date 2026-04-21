# Acoru Business Platform Baseline

This repository is Acoru's reusable baseline for internal business-platform systems. It is designed for local-first development and later deployment to Vercel with a Neon Postgres backing database.

## Stack

- Next.js App Router
- TypeScript
- pnpm
- Neon Postgres via `pg`
- Plain SQL migrations under source control
- Route Handlers + server-only service layer

## Required Environment Variables

Application runtime resolves database connection strings in this order:

1. `DATABASE_URL_DIRECT`
2. `DATABASE_URL`
3. `NEON_DATABASE_URL`

Migration runtime resolves connection strings in this order:

1. `MIGRATION_DATABASE_URL`
2. `DATABASE_URL_DIRECT`
3. `DATABASE_URL`
4. `NEON_DATABASE_URL`

Copy `.env.example` to `.env.local` and provide at least one valid database URL.
The local migration CLI reads `.env.local` before resolving `MIGRATION_DATABASE_URL`, `DATABASE_URL_DIRECT`, `DATABASE_URL`, and `NEON_DATABASE_URL`.
For predictable local verification, keep the application and migration targets aligned unless you intentionally need them to differ.

## Commands

```bash
pnpm install
pnpm db:migrate
pnpm dev
pnpm lint
pnpm typecheck
pnpm build
```

Local verification entry points:

- `http://localhost:3000/login` currently stays UI-first and advances to `/app/dashboard`
- `http://localhost:3000/app` redirects to `/app/dashboard`
- `http://localhost:3000/api/v1/health/db` helps diagnose missing env, missing migrations, and runtime/migration target mismatches

## UI Design Source of Truth

- Use `DESIGN.md` at the repository root as the canonical UI design standard for all screen implementations.

## Architecture Summary

- `app/api/v1/**`: thin HTTP route handlers only
- `src/server/services/**`: business logic and transaction orchestration
- `src/server/db/queries/**`: parameterized SQL for application access
- `src/server/db/migrations/**`: ordered plain SQL schema history
- `openapi/openapi.yaml`: external API contract
- `docs/**`: setup, operations, ADRs, and data dictionary

## Notes

- Database access is intentionally limited to the Node runtime.
- Secrets are never read from client code and should never be logged.
- Database schema changes must be introduced through new SQL migration files and corresponding documentation updates.
