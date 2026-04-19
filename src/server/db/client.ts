import "server-only";

import {
  Pool,
  type PoolClient,
  type PoolConfig,
  type QueryResult,
  type QueryResultRow,
} from "pg";

import type { DbConfig, MigrationDbConfig } from "./types";

const globalForDb = globalThis as typeof globalThis & {
  __acoruPool?: Pool;
};

function pickEnvValue<TSource extends string>(
  entries: ReadonlyArray<{ key: TSource; value: string | undefined }>,
): { key: TSource; value: string } {
  const match = entries.find((entry) => Boolean(entry.value?.trim()));

  if (!match?.value) {
    throw new Error(
      `Missing database connection string. Checked: ${entries
        .map((entry) => entry.key)
        .join(", ")}`,
    );
  }

  return {
    key: match.key,
    value: match.value.trim(),
  };
}

function createPoolConfig(connectionString: string): PoolConfig {
  const useSsl =
    connectionString.includes("sslmode=require") ||
    connectionString.includes("neon.tech") ||
    connectionString.includes("aws.neon.tech");

  return {
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    ssl: useSsl ? { rejectUnauthorized: false } : undefined,
  };
}

export function getDatabaseConfig(): DbConfig {
  const match = pickEnvValue([
    { key: "DATABASE_URL_DIRECT", value: process.env.DATABASE_URL_DIRECT },
    { key: "DATABASE_URL", value: process.env.DATABASE_URL },
    { key: "NEON_DATABASE_URL", value: process.env.NEON_DATABASE_URL },
  ]);

  return {
    source: match.key,
    connectionString: match.value,
  };
}

export function getMigrationDatabaseConfig(): MigrationDbConfig {
  const match = pickEnvValue([
    {
      key: "MIGRATION_DATABASE_URL",
      value: process.env.MIGRATION_DATABASE_URL,
    },
    { key: "DATABASE_URL_DIRECT", value: process.env.DATABASE_URL_DIRECT },
    { key: "DATABASE_URL", value: process.env.DATABASE_URL },
    { key: "NEON_DATABASE_URL", value: process.env.NEON_DATABASE_URL },
  ]);

  return {
    source: match.key,
    connectionString: match.value,
  };
}

export function getPool(): Pool {
  if (!globalForDb.__acoruPool) {
    globalForDb.__acoruPool = new Pool(
      createPoolConfig(getDatabaseConfig().connectionString),
    );
  }

  return globalForDb.__acoruPool;
}

export async function withDbClient<T>(
  callback: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await getPool().connect();

  try {
    return await callback(client);
  } finally {
    client.release();
  }
}

export async function dbQuery<T extends QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<QueryResult<T>> {
  return getPool().query<T>(text, params);
}
