import type { DbConfig, MigrationDbConfig } from "./types";

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

function describeConfiguredSources<TSource extends string>(
  entries: ReadonlyArray<{ key: TSource; value: string | undefined }>,
): { selected: TSource | null; available: TSource[] } {
  const available = entries
    .filter((entry) => Boolean(entry.value?.trim()))
    .map((entry) => entry.key);

  return {
    selected: available[0] ?? null,
    available,
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

export function getDatabaseConfigStatus() {
  return describeConfiguredSources([
    { key: "DATABASE_URL_DIRECT", value: process.env.DATABASE_URL_DIRECT },
    { key: "DATABASE_URL", value: process.env.DATABASE_URL },
    { key: "NEON_DATABASE_URL", value: process.env.NEON_DATABASE_URL },
  ]);
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

export function getMigrationDatabaseConfigStatus() {
  return describeConfiguredSources([
    {
      key: "MIGRATION_DATABASE_URL",
      value: process.env.MIGRATION_DATABASE_URL,
    },
    { key: "DATABASE_URL_DIRECT", value: process.env.DATABASE_URL_DIRECT },
    { key: "DATABASE_URL", value: process.env.DATABASE_URL },
    { key: "NEON_DATABASE_URL", value: process.env.NEON_DATABASE_URL },
  ]);
}
