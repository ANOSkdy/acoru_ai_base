export const dynamic = "force-dynamic";

import Link from "next/link";
import { PageHeader } from "@/src/components/layout/PageHeader";
import { AttendancePolicyForm } from "@/src/components/master/AttendancePolicyForm";
import { Card } from "@/src/components/ui/Card";
import styles from "@/src/components/master/MasterForm.module.css";

export default function NewAttendancePolicyPage() {
  return (
    <div className={styles.page}>
      <Link href="/app/master/attendance-policies" className={styles.backLink}>
        ← 勤怠ポリシー一覧に戻る
      </Link>
      <PageHeader title="勤怠ポリシー 新規作成" />
      <Card>
        <AttendancePolicyForm cancelHref="/app/master/attendance-policies" />
      </Card>
    </div>
  );
}
