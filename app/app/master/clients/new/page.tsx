export const dynamic = "force-dynamic";

import Link from "next/link";
import { PageHeader } from "@/src/components/layout/PageHeader";
import { Card } from "@/src/components/ui/Card";
import { ClientForm } from "@/src/components/master/ClientForm";
import styles from "@/src/components/master/MasterForm.module.css";

export default function NewClientPage() {
  return (
    <div className={styles.page}>
      <Link href="/app/master/clients" className={styles.backLink}>
        ← 取引先一覧に戻る
      </Link>
      <PageHeader title="取引先 新規作成" />
      <Card>
        <ClientForm cancelHref="/app/master/clients" />
      </Card>
    </div>
  );
}
