export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/src/components/layout/PageHeader";
import { AttendancePolicyForm } from "@/src/components/master/AttendancePolicyForm";
import { Card } from "@/src/components/ui/Card";
import { getServerOrganizationId } from "@/src/server/auth/get-server-organization-id";
import { getAttendancePolicyService } from "@/src/server/services/attendance-policies/get-attendance-policy";
import styles from "@/src/components/master/MasterForm.module.css";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditAttendancePolicyPage({ params }: PageProps) {
  const { id } = await params;
  const organizationId = await getServerOrganizationId();
  const attendancePolicy = await getAttendancePolicyService(organizationId, id);

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
