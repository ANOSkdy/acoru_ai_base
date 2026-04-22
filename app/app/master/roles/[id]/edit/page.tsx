export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/src/components/layout/PageHeader";
import { RoleForm } from "@/src/components/master/RoleForm";
import { Card } from "@/src/components/ui/Card";
import { getRoleService } from "@/src/server/services/roles/get-role";
import styles from "@/src/components/master/MasterForm.module.css";

type Props = { params: Promise<{ id: string }> };

export default async function EditRolePage({ params }: Props) {
  const { id } = await params;
  const role = await getRoleService(id);
  if (!role) notFound();
  return <div className={styles.page}><Link href={`/app/master/roles/${id}`} className={styles.backLink}>← ロール詳細に戻る</Link><PageHeader title={`ロール 編集: ${role.name}`} /><Card><RoleForm id={id} initialValues={{ code: role.code, name: role.name, description: role.description ?? "" }} cancelHref={`/app/master/roles/${id}`} /></Card></div>;
}
