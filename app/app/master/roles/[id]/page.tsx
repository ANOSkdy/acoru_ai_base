export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/src/components/layout/PageHeader";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { getRoleService } from "@/src/server/services/roles/get-role";
import styles from "@/src/components/master/MasterDetail.module.css";

type Props = { params: Promise<{ id: string }> };

export default async function RoleDetailPage({ params }: Props) {
  const { id } = await params;
  const role = await getRoleService(id);
  if (!role) notFound();
  return <div className={styles.page}><Link href="/app/master/roles" className={styles.backLink}>← ロール一覧に戻る</Link><div className={styles.headerRow}><PageHeader title={role.name} description={`コード: ${role.code}`} /><div className={styles.actions}><Link href={`/app/master/roles/${id}/edit`}><Button variant="secondary">編集</Button></Link></div></div><Card><div className={styles.fieldGrid}><div className={styles.field}><span className={styles.fieldLabel}>説明</span><span className={styles.fieldValue}>{role.description ?? "—"}</span></div><div className={styles.field}><span className={styles.fieldLabel}>作成日</span><span className={styles.fieldValue}>{role.created_at.slice(0,10)}</span></div></div></Card></div>;
}
