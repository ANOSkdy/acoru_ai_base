export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { MasterListEmptyState, MasterListFilterRow, MasterListPageFrame, MasterListTableShell } from "@/src/components/master/MasterListFoundation";
import { getServerOrganizationId } from "@/src/server/auth/get-server-organization-id";
import { listOrgUnitsService } from "@/src/server/services/org-units/list-org-units";
import styles from "@/src/components/master/MasterList.module.css";

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function OrgUnitsPage({ searchParams }: Props) {
  const params = await searchParams;
  const organizationId = await getServerOrganizationId();
  if (!organizationId) notFound();
  const q = params.q?.trim() ?? undefined;
  const items = await listOrgUnitsService({ organizationId, search: q, limit: 50, offset: 0 });
  return <MasterListPageFrame title="組織ユニット" description="組織ユニットマスタを管理します" createHref="/app/master/org-units/new">
    <MasterListFilterRow q={q} clearHref="/app/master/org-units" placeholder="名称・コードで検索" />
    {items.length === 0 ? <MasterListEmptyState hasFilters={Boolean(q)} filteredMessage="条件に一致する組織ユニットが見つかりません" defaultMessage="組織ユニットが登録されていません" /> : <MasterListTableShell
      headers={<><th className={styles.th}>コード</th><th className={styles.th}>名称</th><th className={styles.th}>親ユニットID</th></>}
      rows={items.map((item) => <tr key={item.id}><td className={styles.td}>{item.code}</td><td className={styles.td}><Link className={styles.tdLink} href={`/app/master/org-units/${item.id}`}>{item.name}</Link></td><td className={styles.td}>{item.parent_org_unit_id ?? "—"}</td></tr>)}
    />}
  </MasterListPageFrame>;
}
