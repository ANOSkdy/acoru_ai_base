export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/src/components/layout/PageHeader";
import { AttendancePolicyForm } from "@/src/components/master/AttendancePolicyForm";
import { Card } from "@/src/components/ui/Card";
import { getAttendancePolicyService } from "@/src/server/services/attendance-policies/get-attendance-policy";
import styles from "@/src/components/master/MasterForm.module.css";

const FALLBACK_ORG_ID = "00000000-0000-0000-0000-000000000001";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditAttendancePolicyPage({ params }: PageProps) {
  const { id } = await params;
  const attendancePolicy = await getAttendancePolicyService(FALLBACK_ORG_ID, id);

  if (!attendancePolicy) notFound();

  return (
    <div className={styles.page}>
      <Link href={`/app/master/attendance-policies/${id}`} className={styles.backLink}>
        ← 勤怠ポリシー詳細に戻る
      </Link>
      <PageHeader title={`勤怠ポリシー 編集: ${attendancePolicy.name}`} />
      <Card>
        <AttendancePolicyForm
          id={attendancePolicy.id}
          initialValues={{
            code: attendancePolicy.code,
            name: attendancePolicy.name,
            rulesText: JSON.stringify(attendancePolicy.rules ?? {}, null, 2),
          }}
          cancelHref={`/app/master/attendance-policies/${id}`}
        />
      </Card>
    </div>
  );
}
