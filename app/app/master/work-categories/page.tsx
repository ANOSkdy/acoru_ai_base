export const dynamic = "force-dynamic";

import Link from "next/link";
import { Badge } from "@/src/components/ui/Badge";
import {
  MasterListEmptyState,
  MasterListPageFrame,
  MasterListTableShell,
} from "@/src/components/master/MasterListFoundation";
import { listWorkCategoriesService } from "@/src/server/services/work-categories/list-work-categories";
import styles from "@/src/components/master/MasterList.module.css";

const FALLBACK_ORG_ID = "00000000-0000-0000-0000-000000000001";

type PageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function WorkCategoriesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q?.trim() ?? undefined;

  const items = await listWorkCategoriesService({
    organizationId: FALLBACK_ORG_ID,
    search: q,
    limit: 50,
    offset: 0,
  });

  return (
    <MasterListPageFrame
      title="勤務区分"
      description="勤務区分マスタを管理します"
      createHref="/app/master/work-categories/new"
    >
      <form method="GET" className={styles.filterRow}>
        <input
          name="q"
          type="search"
          defaultValue={q ?? ""}
          placeholder="名称・コードで検索"
          className={styles.searchInput}
        />
        <button type="submit" className={styles.searchBtn}>
          検索
        </button>
        {q && (
          <Link href="/app/master/work-categories" className={`${styles.searchBtn} ${styles.clearLink}`}>
            クリア
          </Link>
        )}
      </form>

      {items.length === 0 ? (
        <MasterListEmptyState
          hasFilters={Boolean(q)}
          filteredMessage="条件に一致する勤務区分が見つかりません"
          defaultMessage="勤務区分が登録されていません"
        />
      ) : (
        <MasterListTableShell
          headers={(
            <>
              <th className={styles.th}>コード</th>
              <th className={styles.th}>勤務区分名</th>
              <th className={styles.th}>区分タイプ</th>
              <th className={styles.th}>請求対象</th>
              <th className={styles.th}>登録日</th>
            </>
          )}
          rows={items.map((item) => (
            <tr key={item.id}>
              <td className={styles.td}>{item.code}</td>
              <td className={styles.td}>
                <Link href={`/app/master/work-categories/${item.id}`} className={styles.tdLink}>
                  {item.name}
                </Link>
              </td>
              <td className={styles.td}>{item.category_type}</td>
              <td className={styles.td}>
                <Badge variant={item.is_billable ? "success" : "neutral"}>
                  {item.is_billable ? "対象" : "対象外"}
                </Badge>
              </td>
              <td className={styles.td}>{item.created_at.slice(0, 10)}</td>
            </tr>
          ))}
        />
      )}
    </MasterListPageFrame>
  );
}
