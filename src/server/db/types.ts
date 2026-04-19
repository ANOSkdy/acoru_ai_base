export type DbConfig = {
  connectionString: string;
  source: "DATABASE_URL_DIRECT" | "DATABASE_URL" | "NEON_DATABASE_URL";
};

export type MigrationDbConfig = {
  connectionString: string;
  source:
    | "MIGRATION_DATABASE_URL"
    | "DATABASE_URL_DIRECT"
    | "DATABASE_URL"
    | "NEON_DATABASE_URL";
};

export type AuthContext = {
  actorUserId: string;
  organizationId: string;
};

export type WorkSessionRecord = {
  id: string;
  organizationId: string;
  userId: string;
  projectId: string | null;
  siteId: string | null;
  workCategoryId: string | null;
  sessionDate: string;
  startedAt: string;
  endedAt: string | null;
  status: string;
  notes: string | null;
  approvedAt: string | null;
  approvedBy: string | null;
  createdAt: string;
  updatedAt: string;
};
