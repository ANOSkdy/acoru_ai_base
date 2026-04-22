export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/src/components/layout/PageHeader";
import { OrganizationForm } from "@/src/components/master/OrganizationForm";
import { Card } from "@/src/components/ui/Card";
import { getOrganizationService } from "@/src/server/services/organizations/get-organization";
import styles from "@/src/components/master/MasterForm.module.css";

type Props = { params: Promise<{ id: string }> };

export default async function EditOrganizationPage({ params }: Props) {
  const { id } = await params;
  const organization = await getOrganizationService(id);
  if (!organization) notFound();
  return <div className={styles.page}><Link href={`/app/master/organizations/${id}`} className={styles.backLink}>← 組織詳細に戻る</Link><PageHeader title={`組織 編集: ${organization.name}`} /><Card><OrganizationForm id={id} initialValues={{ code: organization.code, name: organization.name, status: organization.status as "active"|"inactive" }} cancelHref={`/app/master/organizations/${id}`} /></Card></div>;
}
