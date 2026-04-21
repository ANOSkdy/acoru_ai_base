import "server-only";

import {
  Pool,
  type PoolClient,
  type PoolConfig,
  type QueryResult,
  type QueryResultRow,
} from "pg";

import { getDatabaseConfig } from "./config";
export {
  getDatabaseConfig,
  getDatabaseConfigStatus,
  getMigrationDatabaseConfig,
  getMigrationDatabaseConfigStatus,
} from "./config";

const globalForDb = globalThis as typeof globalThis & {
  __acoruPool?: Pool;
};

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
