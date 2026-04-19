export const dynamic = "force-dynamic";

import Link from "next/link";
import { PageHeader } from "@/src/components/layout/PageHeader";
import { Card } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
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
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <PageHeader
          title="プロジェクト"
          description="プロジェクトの一覧を管理します"
        />
        <Link href="/app/master/projects/new">
          <Button variant="primary">新規作成</Button>
        </Link>
      </div>

      <Card>
        <form method="GET" className={styles.filterRow}>
          <input
            name="q"
            type="search"
            defaultValue={q ?? ""}
            placeholder="名称・コードで検索"
            className={styles.searchInput}
          />
          <select
            name="status"
            defaultValue={status ?? ""}
            className={styles.statusSelect}
          >
            <option value="">全ステータス</option>
            <option value="active">有効</option>
            <option value="inactive">無効</option>
          </select>
          <button type="submit" className={styles.searchBtn}>
            検索
          </button>
          {(q || status) && (
            <Link
              href="/app/master/projects"
              className={styles.searchBtn}
              style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}
            >
              クリア
            </Link>
          )}
        </form>

        {items.length === 0 ? (
          <p className={styles.emptyState}>
            {q || status
              ? "条件に一致するプロジェクトが見つかりません"
              : "プロジェクトが登録されていません"}
          </p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>コード</th>
                <th className={styles.th}>プロジェクト名</th>
                <th className={styles.th}>取引先</th>
                <th className={styles.th}>ステータス</th>
                <th className={styles.th}>開始日</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
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
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
