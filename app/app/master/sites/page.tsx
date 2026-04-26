export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/src/components/ui/Badge";
import {
  MasterListEmptyState,
  MasterListFilterRow,
  MasterListPageFrame,
  MasterListTableShell,
} from "@/src/components/master/MasterListFoundation";
import { DataManagementGuide } from "@/src/components/master/DataManagementGuide";
import { getServerOrganizationId } from "@/src/server/auth/get-server-organization-id";
import { listSitesService } from "@/src/server/services/sites/list-sites";
import styles from "@/src/components/master/MasterList.module.css";

type PageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function SitesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const organizationId = await getServerOrganizationId();
  if (!organizationId) notFound();

  const q = params.q?.trim() ?? undefined;
  const status = params.status === "active" || params.status === "inactive"
    ? params.status
    : undefined;

  const items = await listSitesService({
    organizationId,
    search: q,
    status,
    limit: 50,
    offset: 0,
  });

  return (
    <MasterListPageFrame
      title="現場"
      description="データ管理システムで現場情報を管理します"
      createHref="/app/master/sites/new"
    >
      <DataManagementGuide
        managedData="現場の名称、コード、所属プロジェクト、住所、タイムゾーン、ステータスを管理します。"
        actions="現場の新規作成、詳細確認、編集、検索、ステータス確認ができます。"
        deletionPolicy="原則として削除ではなく「無効化」または「利用停止」で管理する。"
      />
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
              <th className={styles.th}>住所 / TZ</th>
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
              <td className={styles.td}>
                <div>{item.address ?? "—"}</div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{item.timezone}</div>
              </td>
            </tr>
          ))}
        />
      )}
    </MasterListPageFrame>
  );
}
