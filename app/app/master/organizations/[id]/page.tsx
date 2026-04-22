export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/src/components/layout/PageHeader";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { getOrganizationService } from "@/src/server/services/organizations/get-organization";
import styles from "@/src/components/master/MasterDetail.module.css";

type Props = { params: Promise<{ id: string }> };

export default async function OrganizationDetailPage({ params }: Props) {
  const { id } = await params;
  const organization = await getOrganizationService(id);
  if (!organization) notFound();
  return <div className={styles.page}><Link href="/app/master/organizations" className={styles.backLink}>← 組織一覧に戻る</Link><div className={styles.headerRow}><PageHeader title={organization.name} description={`コード: ${organization.code}`} /><div className={styles.actions}><Link href={`/app/master/organizations/${id}/edit`}><Button variant="secondary">編集</Button></Link></div></div><Card><div className={styles.fieldGrid}><div className={styles.field}><span className={styles.fieldLabel}>ステータス</span><span><Badge variant={organization.status === "active" ? "success" : "neutral"}>{organization.status}</Badge></span></div><div className={styles.field}><span className={styles.fieldLabel}>登録日</span><span className={styles.fieldValue}>{organization.created_at.slice(0,10)}</span></div><div className={styles.field}><span className={styles.fieldLabel}>更新日</span><span className={styles.fieldValue}>{organization.updated_at.slice(0,10)}</span></div></div></Card></div>;
}
