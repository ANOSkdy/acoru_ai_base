# Database Operations

## Connection Variable Precedence

### Application runtime

1. `DATABASE_URL_DIRECT`
2. `DATABASE_URL`
3. `NEON_DATABASE_URL`

### Migration runtime

1. `MIGRATION_DATABASE_URL`
2. `DATABASE_URL_DIRECT`
3. `DATABASE_URL`
4. `NEON_DATABASE_URL`

Use a direct connection for migrations when possible so DDL runs without pooler-related surprises.

## Migration Flow

- Add a new SQL file under `src/server/db/migrations/`.
- Name files with an ordered numeric prefix such as `011_add_example_table.sql`.
- Keep migrations idempotent where reasonable, but do not hide failures that would mask a broken history.
- Run `pnpm db:migrate` locally.
- Check status with `pnpm db:migrate:status`.
- Commit the SQL migration together with any application, OpenAPI, or documentation changes.

## Tracking Table

The migration runner maintains `schema_migrations`:

- `filename`
- `applied_at`

Applied migrations are recorded only after the SQL file completes successfully.

## Operational Notes

- The migration runner executes each SQL file inside a transaction and fails loudly on error.
- Application queries must stay parameterized in TypeScript code.
- Do not edit old migrations once applied in shared environments; create a new forward-only migration instead.
