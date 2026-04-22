export const dynamic = "force-dynamic";

import Link from "next/link";
import { PageHeader } from "@/src/components/layout/PageHeader";
import { WorkCategoryForm } from "@/src/components/master/WorkCategoryForm";
import { Card } from "@/src/components/ui/Card";
import styles from "@/src/components/master/MasterForm.module.css";

export default function NewWorkCategoryPage() {
  return (
    <div className={styles.page}>
      <Link href="/app/master/work-categories" className={styles.backLink}>
        ← 勤務区分一覧に戻る
      </Link>
      <PageHeader title="勤務区分 新規作成" />
      <Card>
        <WorkCategoryForm cancelHref="/app/master/work-categories" />
      </Card>
    </div>
  );
}
