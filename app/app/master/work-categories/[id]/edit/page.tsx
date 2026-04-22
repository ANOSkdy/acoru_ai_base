export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/src/components/layout/PageHeader";
import { WorkCategoryForm } from "@/src/components/master/WorkCategoryForm";
import { Card } from "@/src/components/ui/Card";
import { getServerOrganizationId } from "@/src/server/auth/get-server-organization-id";
import { getWorkCategoryService } from "@/src/server/services/work-categories/get-work-category";
import styles from "@/src/components/master/MasterForm.module.css";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditWorkCategoryPage({ params }: PageProps) {
  const { id } = await params;
  const organizationId = await getServerOrganizationId();
  const workCategory = await getWorkCategoryService(organizationId, id);

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
