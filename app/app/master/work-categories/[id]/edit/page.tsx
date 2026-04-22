export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/src/components/layout/PageHeader";
import { WorkCategoryForm } from "@/src/components/master/WorkCategoryForm";
import { Card } from "@/src/components/ui/Card";
import { getWorkCategoryService } from "@/src/server/services/work-categories/get-work-category";
import styles from "@/src/components/master/MasterForm.module.css";

const FALLBACK_ORG_ID = "00000000-0000-0000-0000-000000000001";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditWorkCategoryPage({ params }: PageProps) {
  const { id } = await params;
  const workCategory = await getWorkCategoryService(FALLBACK_ORG_ID, id);

  if (!workCategory) notFound();

  return (
    <div className={styles.page}>
      <Link href={`/app/master/work-categories/${id}`} className={styles.backLink}>
        ← 勤務区分詳細に戻る
      </Link>
      <PageHeader title={`勤務区分 編集: ${workCategory.name}`} />
      <Card>
        <WorkCategoryForm
          id={workCategory.id}
          initialValues={{
            code: workCategory.code,
            name: workCategory.name,
            categoryType: workCategory.category_type,
            isBillable: workCategory.is_billable,
          }}
          cancelHref={`/app/master/work-categories/${id}`}
        />
      </Card>
    </div>
  );
}
