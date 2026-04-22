export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/src/components/layout/PageHeader";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { getServerOrganizationId } from "@/src/server/auth/get-server-organization-id";
import { getOrgUnitService } from "@/src/server/services/org-units/get-org-unit";
import styles from "@/src/components/master/MasterDetail.module.css";

type Props = { params: Promise<{ id: string }> };

export default async function OrgUnitDetailPage({ params }: Props) {
  const { id } = await params;
  const organizationId = await getServerOrganizationId();
  if (!organizationId) notFound();
  const orgUnit = await getOrgUnitService(organizationId, id);
  if (!orgUnit) notFound();
  return <div className={styles.page}><Link href="/app/master/org-units" className={styles.backLink}>← 組織ユニット一覧に戻る</Link><div className={styles.headerRow}><PageHeader title={orgUnit.name} description={`コード: ${orgUnit.code}`} /><div className={styles.actions}><Link href={`/app/master/org-units/${id}/edit`}><Button variant="secondary">編集</Button></Link></div></div><Card><div className={styles.fieldGrid}><div className={styles.field}><span className={styles.fieldLabel}>親組織ユニットID</span><span className={styles.fieldValue}>{orgUnit.parent_org_unit_id ?? "—"}</span></div><div className={styles.field}><span className={styles.fieldLabel}>登録日</span><span className={styles.fieldValue}>{orgUnit.created_at.slice(0,10)}</span></div></div></Card></div>;
}
