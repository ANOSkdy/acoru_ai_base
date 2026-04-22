export const dynamic = "force-dynamic";

import Link from "next/link";
import { Badge } from "@/src/components/ui/Badge";
import { MasterListEmptyState, MasterListFilterRow, MasterListPageFrame, MasterListTableShell } from "@/src/components/master/MasterListFoundation";
import { listOrganizationsService } from "@/src/server/services/organizations/list-organizations";
import styles from "@/src/components/master/MasterList.module.css";

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function OrganizationsPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = params.q?.trim() ?? undefined;
  const status = params.status === "active" || params.status === "inactive" ? params.status : undefined;
  const items = await listOrganizationsService({ search: q, status, limit: 50, offset: 0 });

  return <MasterListPageFrame title="組織" description="組織マスタを管理します" createHref="/app/master/organizations/new">
    <MasterListFilterRow q={q} status={status} clearHref="/app/master/organizations" placeholder="名称・コードで検索" />
    {items.length === 0 ? <MasterListEmptyState hasFilters={Boolean(q || status)} filteredMessage="条件に一致する組織が見つかりません" defaultMessage="組織が登録されていません" /> : <MasterListTableShell
      headers={<><th className={styles.th}>コード</th><th className={styles.th}>名称</th><th className={styles.th}>ステータス</th></>}
      rows={items.map((item) => <tr key={item.id}><td className={styles.td}>{item.code}</td><td className={styles.td}><Link className={styles.tdLink} href={`/app/master/organizations/${item.id}`}>{item.name}</Link></td><td className={styles.td}><Badge variant={item.status === "active" ? "success" : "neutral"}>{item.status === "active" ? "有効" : "無効"}</Badge></td></tr>)}
    />}
  </MasterListPageFrame>;
}
