export const dynamic = "force-dynamic";

import Link from "next/link";
import { PageHeader } from "@/src/components/layout/PageHeader";
import { RoleForm } from "@/src/components/master/RoleForm";
import { Card } from "@/src/components/ui/Card";
import styles from "@/src/components/master/MasterForm.module.css";

export default function NewRolePage() {
  return <div className={styles.page}><Link href="/app/master/roles" className={styles.backLink}>← ロール一覧に戻る</Link><PageHeader title="ロール 新規作成" /><Card><RoleForm cancelHref="/app/master/roles" /></Card></div>;
}
