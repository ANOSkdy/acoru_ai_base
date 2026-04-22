export const dynamic = "force-dynamic";

import Link from "next/link";
import { PageHeader } from "@/src/components/layout/PageHeader";
import { UserForm } from "@/src/components/master/UserForm";
import { Card } from "@/src/components/ui/Card";
import styles from "@/src/components/master/MasterForm.module.css";

export default function NewUserPage() {
  return (
    <div className={styles.page}>
      <Link href="/app/master/users" className={styles.backLink}>
        ← ユーザー一覧に戻る
      </Link>
      <PageHeader title="ユーザー 新規作成" />
      <Card>
        <UserForm cancelHref="/app/master/users" />
      </Card>
    </div>
  );
}
