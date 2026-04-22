export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/src/components/layout/PageHeader";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { getServerOrganizationId } from "@/src/server/auth/get-server-organization-id";
import { getAttendancePolicyService } from "@/src/server/services/attendance-policies/get-attendance-policy";
import styles from "@/src/components/master/MasterDetail.module.css";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AttendancePolicyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const organizationId = await getServerOrganizationId();
  const attendancePolicy = await getAttendancePolicyService(organizationId, id);

  if (!attendancePolicy) notFound();

  return (
    <div className={styles.page}>
      <Link href="/app/master/attendance-policies" className={styles.backLink}>
        ← 勤怠ポリシー一覧に戻る
      </Link>

      <div className={styles.headerRow}>
        <PageHeader title={attendancePolicy.name} description={`コード: ${attendancePolicy.code}`} />
        <div className={styles.actions}>
          <Link href={`/app/master/attendance-policies/${id}/edit`}>
            <Button variant="secondary">編集</Button>
          </Link>
        </div>
      </div>

      <Card>
        <div className={styles.fieldGrid}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>コード</span>
            <span className={styles.fieldValue}>{attendancePolicy.code}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>勤怠ポリシー名</span>
            <span className={styles.fieldValue}>{attendancePolicy.name}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>登録日</span>
            <span className={styles.fieldValue}>{attendancePolicy.created_at.slice(0, 10)}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>更新日</span>
            <span className={styles.fieldValue}>{attendancePolicy.updated_at.slice(0, 10)}</span>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>ルール(JSON)</h3>
          <pre className={styles.codeBlock}>{JSON.stringify(attendancePolicy.rules ?? {}, null, 2)}</pre>
        </div>
      </Card>
    </div>
  );
}
