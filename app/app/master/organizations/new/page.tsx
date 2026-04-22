export const dynamic = "force-dynamic";

import Link from "next/link";
import { PageHeader } from "@/src/components/layout/PageHeader";
import { OrganizationForm } from "@/src/components/master/OrganizationForm";
import { Card } from "@/src/components/ui/Card";
import styles from "@/src/components/master/MasterForm.module.css";

export default function NewOrganizationPage() {
  return <div className={styles.page}><Link href="/app/master/organizations" className={styles.backLink}>← 組織一覧に戻る</Link><PageHeader title="組織 新規作成" /><Card><OrganizationForm cancelHref="/app/master/organizations" /></Card></div>;
}
