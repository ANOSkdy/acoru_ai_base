export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/src/components/layout/PageHeader";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { getWorkCategoryService } from "@/src/server/services/work-categories/get-work-category";
import styles from "@/src/components/master/MasterDetail.module.css";

const FALLBACK_ORG_ID = "00000000-0000-0000-0000-000000000001";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function WorkCategoryDetailPage({ params }: PageProps) {
  const { id } = await params;
  const workCategory = await getWorkCategoryService(FALLBACK_ORG_ID, id);

  if (!workCategory) notFound();

  return (
    <div className={styles.page}>
      <Link href="/app/master/work-categories" className={styles.backLink}>
        ← 勤務区分一覧に戻る
      </Link>

      <div className={styles.headerRow}>
        <PageHeader title={workCategory.name} description={`コード: ${workCategory.code}`} />
        <div className={styles.actions}>
          <Link href={`/app/master/work-categories/${id}/edit`}>
            <Button variant="secondary">編集</Button>
          </Link>
        </div>
      </div>

      <Card>
        <div className={styles.fieldGrid}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>コード</span>
            <span className={styles.fieldValue}>{workCategory.code}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>勤務区分名</span>
            <span className={styles.fieldValue}>{workCategory.name}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>区分タイプ</span>
            <span className={styles.fieldValue}>{workCategory.category_type}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>請求対象</span>
            <span>
              <Badge variant={workCategory.is_billable ? "success" : "neutral"}>
                {workCategory.is_billable ? "対象" : "対象外"}
              </Badge>
            </span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>登録日</span>
            <span className={styles.fieldValue}>{workCategory.created_at.slice(0, 10)}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>更新日</span>
            <span className={styles.fieldValue}>{workCategory.updated_at.slice(0, 10)}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
