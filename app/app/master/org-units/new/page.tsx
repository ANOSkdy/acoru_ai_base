export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/src/components/layout/PageHeader";
import { OrgUnitForm } from "@/src/components/master/OrgUnitForm";
import { Card } from "@/src/components/ui/Card";
import { getServerOrganizationId } from "@/src/server/auth/get-server-organization-id";
import { listOrgUnitOptionsService } from "@/src/server/services/org-units/list-org-units";
import styles from "@/src/components/master/MasterForm.module.css";

export default async function NewOrgUnitPage() {
  const organizationId = await getServerOrganizationId();
  if (!organizationId) notFound();
  const options = await listOrgUnitOptionsService(organizationId);
  return <div className={styles.page}><Link href="/app/master/org-units" className={styles.backLink}>← 組織ユニット一覧に戻る</Link><PageHeader title="組織ユニット 新規作成" /><Card><OrgUnitForm cancelHref="/app/master/org-units" parentOptions={options.map((option) => ({ id: option.id, name: option.name }))} /></Card></div>;
}
