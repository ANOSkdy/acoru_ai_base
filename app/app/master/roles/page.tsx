export const dynamic = "force-dynamic";

import Link from "next/link";
import { Badge } from "@/src/components/ui/Badge";
import { DataManagementGuide } from "@/src/components/master/DataManagementGuide";
import { MasterListEmptyState, MasterListFilterRow, MasterListPageFrame, MasterListTableShell } from "@/src/components/master/MasterListFoundation";
import { listRolesService } from "@/src/server/services/roles/list-roles";
import styles from "@/src/components/master/MasterList.module.css";

type PageProps = { searchParams: Promise<Record<string, string | undefined>> };

export default async function RolesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q?.trim() ?? undefined;
  const items = await listRolesService({ search: q, limit: 50, offset: 0 });

  return <MasterListPageFrame title="ロール" description="データ管理システムでロールと権限体系を管理します" createHref="/app/master/roles/new">
    <DataManagementGuide
      managedData="ロールの名称、コード、説明などの権限体系に関する定義を管理します。"
      actions="ロールの新規作成、詳細確認、編集、検索ができます。"
      deletionPolicy="利用中のロールは削除せず、権限内容の見直しまたは新ロール作成で対応する。"
    />
    <MasterListFilterRow q={q} clearHref="/app/master/roles" placeholder="名称・コードで検索" />
    {items.length === 0 ? <MasterListEmptyState hasFilters={Boolean(q)} filteredMessage="条件に一致するロールが見つかりません" defaultMessage="ロールが登録されていません" /> : (
      <MasterListTableShell
        headers={<><th className={styles.th}>コード</th><th className={styles.th}>名称</th><th className={styles.th}>説明</th><th className={styles.th}>作成日</th></>}
        rows={items.map((item) => <tr key={item.id}><td className={styles.td}>{item.code}</td><td className={styles.td}><Link href={`/app/master/roles/${item.id}`} className={styles.tdLink}>{item.name}</Link></td><td className={styles.td}>{item.description ?? "—"}</td><td className={styles.td}><Badge variant="neutral">{item.created_at.slice(0,10)}</Badge></td></tr>)}
      />
    )}
  </MasterListPageFrame>;
}
