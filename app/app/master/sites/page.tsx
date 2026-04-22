export const dynamic = "force-dynamic";

import Link from "next/link";
import { Badge } from "@/src/components/ui/Badge";
import {
  MasterListEmptyState,
  MasterListFilterRow,
  MasterListPageFrame,
  MasterListTableShell,
} from "@/src/components/master/MasterListFoundation";
import { listSitesService } from "@/src/server/services/sites/list-sites";
import styles from "@/src/components/master/MasterList.module.css";

const FALLBACK_ORG_ID = "00000000-0000-0000-0000-000000000001";

type PageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function SitesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q?.trim() ?? undefined;
  const status = params.status === "active" || params.status === "inactive"
    ? params.status
    : undefined;

  const items = await listSitesService({
    organizationId: FALLBACK_ORG_ID,
    search: q,
    status,
    limit: 50,
    offset: 0,
  });

  return (
    <MasterListPageFrame
      title="現場"
      description="現場の一覧を管理します"
      createHref="/app/master/sites/new"
    >
      <MasterListFilterRow q={q} status={status} clearHref="/app/master/sites" />

      {items.length === 0 ? (
        <MasterListEmptyState
          hasFilters={Boolean(q || status)}
          filteredMessage="条件に一致する現場が見つかりません"
          defaultMessage="現場が登録されていません"
        />
      ) : (
        <MasterListTableShell
          headers={(
            <>
              <th className={styles.th}>コード</th>
              <th className={styles.th}>現場名</th>
              <th className={styles.th}>プロジェクト</th>
              <th className={styles.th}>ステータス</th>
              <th className={styles.th}>タイムゾーン</th>
            </>
          )}
          rows={items.map((item) => (
            <tr key={item.id}>
              <td className={styles.td}>{item.code}</td>
              <td className={styles.td}>
                <Link
                  href={`/app/master/sites/${item.id}`}
                  className={styles.tdLink}
                >
                  {item.name}
                </Link>
              </td>
              <td className={styles.td}>
                {item.project_id ? (
                  <Link
                    href={`/app/master/projects/${item.project_id}`}
                    className={styles.tdLink}
                  >
                    {item.project_name ?? item.project_id}
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
              <td className={styles.td}>{item.timezone}</td>
            </tr>
          ))}
        />
      )}
    </MasterListPageFrame>
  );
}
