export const dynamic = "force-dynamic";

import Link from "next/link";
import { Badge } from "@/src/components/ui/Badge";
import {
  MasterListEmptyState,
  MasterListFilterRow,
  MasterListPageFrame,
  MasterListTableShell,
} from "@/src/components/master/MasterListFoundation";
import { listClientsService } from "@/src/server/services/clients/list-clients";
import styles from "@/src/components/master/MasterList.module.css";

const FALLBACK_ORG_ID = "00000000-0000-0000-0000-000000000001";

type PageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function ClientsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q?.trim() ?? undefined;
  const status = params.status === "active" || params.status === "inactive"
    ? params.status
    : undefined;

  const items = await listClientsService({
    organizationId: FALLBACK_ORG_ID,
    search: q,
    status,
    limit: 50,
    offset: 0,
  });

  return (
    <MasterListPageFrame
      title="取引先"
      description="契約取引先の一覧を管理します"
      createHref="/app/master/clients/new"
    >
      <MasterListFilterRow q={q} status={status} clearHref="/app/master/clients" />

      {items.length === 0 ? (
        <MasterListEmptyState
          hasFilters={Boolean(q || status)}
          filteredMessage="条件に一致する取引先が見つかりません"
          defaultMessage="取引先が登録されていません"
        />
      ) : (
        <MasterListTableShell
          headers={(
            <>
              <th className={styles.th}>コード</th>
              <th className={styles.th}>取引先名</th>
              <th className={styles.th}>ステータス</th>
              <th className={styles.th}>登録日</th>
            </>
          )}
          rows={items.map((item) => (
            <tr key={item.id}>
              <td className={styles.td}>{item.code}</td>
              <td className={styles.td}>
                <Link
                  href={`/app/master/clients/${item.id}`}
                  className={styles.tdLink}
                >
                  {item.name}
                </Link>
              </td>
              <td className={styles.td}>
                <Badge variant={item.status === "active" ? "success" : "neutral"}>
                  {item.status === "active" ? "有効" : "無効"}
                </Badge>
              </td>
              <td className={styles.td}>
                {item.created_at.slice(0, 10)}
              </td>
            </tr>
          ))}
        />
      )}
    </MasterListPageFrame>
  );
}
