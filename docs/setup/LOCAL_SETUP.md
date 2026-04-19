# Local Setup

## 1. Install prerequisites

- Node.js 20 or later
- pnpm 10 or later
- A reachable Postgres or Neon database

## 2. Configure environment variables

```bash
cp .env.example .env.local
```

Set one of the supported database URLs:

- `DATABASE_URL_DIRECT`
- `DATABASE_URL`
- `NEON_DATABASE_URL`

For migrations, `MIGRATION_DATABASE_URL` can override the application connection string.

## 3. Install dependencies

```bash
pnpm install
```

## 4. Run migrations

```bash
pnpm db:migrate
pnpm db:migrate:status
```

## 5. Start the application

```bash
pnpm dev
```

Open `http://localhost:3000`.

## 6. Verify the baseline

- `GET /api/v1/health/db`
- `GET /api/v1/work-sessions`
- `GET /api/v1/work-sessions/00000000-0000-0000-0000-000000000801`
- `POST /api/v1/work-sessions/00000000-0000-0000-0000-000000000801/approve`
- `POST /api/v1/attendance/logs`
- `POST /api/v1/closing-periods`

Requests default to the seeded sample organization and user when `x-acoru-org-id` and `x-acoru-user-id` headers are omitted.
