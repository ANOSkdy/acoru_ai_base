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
import { listClientsService } from "@/src/server/services/clients/list-clients";
import styles from "@/src/components/master/MasterList.module.css";

type PageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function ClientsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const organizationId = await getServerOrganizationId();
  if (!organizationId) notFound();

  const q = params.q?.trim() ?? undefined;
  const status = params.status === "active" || params.status === "inactive"
    ? params.status
    : undefined;

  const items = await listClientsService({
    organizationId,
    search: q,
    status,
    limit: 50,
    offset: 0,
  });

  return (
    <MasterListPageFrame
      title="取引先"
      description="データ管理システムで取引先情報を管理します"
      createHref="/app/master/clients/new"
    >
      <DataManagementGuide
        managedData="取引先の名称、コード、契約先としての利用状態を管理します。"
        actions="取引先の新規作成、詳細確認、編集、検索、ステータス確認ができます。"
        deletionPolicy="原則として削除ではなく「無効化」または「利用停止」で管理する。"
      />
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
