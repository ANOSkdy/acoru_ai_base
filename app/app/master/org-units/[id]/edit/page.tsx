export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/src/components/layout/PageHeader";
import { OrgUnitForm } from "@/src/components/master/OrgUnitForm";
import { Card } from "@/src/components/ui/Card";
import { getServerOrganizationId } from "@/src/server/auth/get-server-organization-id";
import { getOrgUnitService } from "@/src/server/services/org-units/get-org-unit";
import { listOrgUnitOptionsService } from "@/src/server/services/org-units/list-org-units";
import styles from "@/src/components/master/MasterForm.module.css";

type Props = { params: Promise<{ id: string }> };

export default async function EditOrgUnitPage({ params }: Props) {
  const { id } = await params;
  const organizationId = await getServerOrganizationId();
  if (!organizationId) notFound();
  const orgUnit = await getOrgUnitService(organizationId, id);
  if (!orgUnit) notFound();
  const options = await listOrgUnitOptionsService(organizationId);
  return <div className={styles.page}><Link href={`/app/master/org-units/${id}`} className={styles.backLink}>← 組織ユニット詳細に戻る</Link><PageHeader title={`組織ユニット 編集: ${orgUnit.name}`} /><Card><OrgUnitForm id={id} cancelHref={`/app/master/org-units/${id}`} initialValues={{ code: orgUnit.code, name: orgUnit.name, parentOrgUnitId: orgUnit.parent_org_unit_id ?? "" }} parentOptions={options.filter((o) => o.id !== id).map((option) => ({ id: option.id, name: option.name }))} /></Card></div>;
}
