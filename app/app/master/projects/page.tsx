export const dynamic = "force-dynamic";

import Link from "next/link";
import { Badge } from "@/src/components/ui/Badge";
import {
  MasterListEmptyState,
  MasterListFilterRow,
  MasterListPageFrame,
  MasterListTableShell,
} from "@/src/components/master/MasterListFoundation";
import { listProjectsService } from "@/src/server/services/projects/list-projects";
import styles from "@/src/components/master/MasterList.module.css";

const FALLBACK_ORG_ID = "00000000-0000-0000-0000-000000000001";

type PageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function ProjectsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q?.trim() ?? undefined;
  const status = params.status === "active" || params.status === "inactive"
    ? params.status
    : undefined;

  const items = await listProjectsService({
    organizationId: FALLBACK_ORG_ID,
    search: q,
    status,
    limit: 50,
    offset: 0,
  });

  return (
    <MasterListPageFrame
      title="プロジェクト"
      description="プロジェクトの一覧を管理します"
      createHref="/app/master/projects/new"
    >
      <MasterListFilterRow q={q} status={status} clearHref="/app/master/projects" />

      {items.length === 0 ? (
        <MasterListEmptyState
          hasFilters={Boolean(q || status)}
          filteredMessage="条件に一致するプロジェクトが見つかりません"
          defaultMessage="プロジェクトが登録されていません"
        />
      ) : (
        <MasterListTableShell
          headers={(
            <>
              <th className={styles.th}>コード</th>
              <th className={styles.th}>プロジェクト名</th>
              <th className={styles.th}>取引先</th>
              <th className={styles.th}>ステータス</th>
              <th className={styles.th}>開始日</th>
            </>
          )}
          rows={items.map((item) => (
            <tr key={item.id}>
              <td className={styles.td}>{item.code}</td>
              <td className={styles.td}>
                <Link
                  href={`/app/master/projects/${item.id}`}
                  className={styles.tdLink}
                >
                  {item.name}
                </Link>
              </td>
              <td className={styles.td}>
                {item.client_id ? (
                  <Link
                    href={`/app/master/clients/${item.client_id}`}
                    className={styles.tdLink}
                  >
                    {item.client_name ?? item.client_id}
                  </Link>
                ) : (
                  <span style={{ color: "var(--text-muted)" }}>—</span>
                )}
              </td>
              <td className={styles.td}>
                <Badge variant={item.status === "active" ? "success" : "neutral"}>
                  {item.status === "active" ? "有効" : "無効"}
                </Badge>
              </td>
              <td className={styles.td}>{item.starts_on ?? "—"}</td>
            </tr>
          ))}
        />
      )}
    </MasterListPageFrame>
  );
}
