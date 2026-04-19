import "server-only";

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { Pool } from "pg";

import { getMigrationDatabaseConfig } from "./client";

const MIGRATIONS_DIR = path.join(process.cwd(), "src", "server", "db", "migrations");

type AppliedMigration = {
  filename: string;
  applied_at: Date;
};

async function ensureMigrationsTable(pool: Pool): Promise<void> {
  await pool.query(`
    create table if not exists schema_migrations (
      filename text primary key,
      applied_at timestamptz not null default now()
    )
  `);
}

async function getMigrationFiles(): Promise<string[]> {
  const entries = await readdir(MIGRATIONS_DIR, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
}

async function getAppliedMigrations(pool: Pool): Promise<Map<string, AppliedMigration>> {
  const result = await pool.query<AppliedMigration>(
    `select filename, applied_at from schema_migrations order by filename asc`,
  );

  return new Map(
    result.rows.map((row) => [
      row.filename,
      { filename: row.filename, applied_at: row.applied_at },
    ]),
  );
}

async function applyMigration(pool: Pool, filename: string): Promise<void> {
  const fullPath = path.join(MIGRATIONS_DIR, filename);
  const sql = await readFile(fullPath, "utf8");
  const client = await pool.connect();

  try {
    await client.query("begin");
    await client.query(sql);
    await client.query(
      `insert into schema_migrations (filename, applied_at) values ($1, now())`,
      [filename],
    );
    await client.query("commit");
    process.stdout.write(`Applied migration: ${filename}\n`);
  } catch (error) {
    await client.query("rollback");
    throw new Error(
      `Failed migration ${filename}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  } finally {
    client.release();
  }
}

async function printStatus(pool: Pool): Promise<void> {
  const files = await getMigrationFiles();
  const applied = await getAppliedMigrations(pool);

  for (const filename of files) {
    const state = applied.has(filename) ? "applied" : "pending";
    process.stdout.write(`${state}\t${filename}\n`);
  }
}

async function run(): Promise<void> {
  const command = process.argv[2] ?? "up";
  const config = getMigrationDatabaseConfig();
  const pool = new Pool({
    connectionString: config.connectionString,
    ssl:
      config.connectionString.includes("sslmode=require") ||
      config.connectionString.includes("neon.tech")
        ? { rejectUnauthorized: false }
        : undefined,
  });

  try {
    process.stdout.write(`Using migration connection from ${config.source}\n`);
    await ensureMigrationsTable(pool);

    if (command === "status") {
      await printStatus(pool);
      return;
    }

    const files = await getMigrationFiles();
    const applied = await getAppliedMigrations(pool);

    for (const filename of files) {
      if (!applied.has(filename)) {
        await applyMigration(pool, filename);
      }
    }

    process.stdout.write("Database migrations are up to date.\n");
  } finally {
    await pool.end();
  }
}

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
