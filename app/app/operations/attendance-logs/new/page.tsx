export const dynamic = "force-dynamic";

import Link from "next/link";

import { PageHeader } from "@/src/components/layout/PageHeader";
import { Card } from "@/src/components/ui/Card";
import { AttendanceLogForm } from "@/src/components/operations/AttendanceLogForm";
import { listSitesService } from "@/src/server/services/sites/list-sites";
import { listWorkSessionsService } from "@/src/server/services/work-sessions/list-work-sessions";
import styles from "@/src/components/master/MasterForm.module.css";

const FALLBACK_ORG_ID = "00000000-0000-0000-0000-000000000001";

export default async function NewAttendanceLogPage() {
  const [sites, workSessions] = await Promise.all([
    listSitesService({
      organizationId: FALLBACK_ORG_ID,
      status: "active",
      limit: 100,
      offset: 0,
    }),
    listWorkSessionsService({
      organizationId: FALLBACK_ORG_ID,
      limit: 20,
      offset: 0,
    }),
  ]);

  return (
    <div className={styles.page}>
      <Link href="/app/operations/attendance-logs" className={styles.backLink}>
        ← 勤怠ログ一覧に戻る
      </Link>
      <PageHeader
        title="勤怠ログ 手動登録"
        description="現場打刻の補完や代理登録など、最小限の補正を行います。"
      />
      <Card>
        <AttendanceLogForm
          cancelHref="/app/operations/attendance-logs"
          sites={sites}
          workSessions={workSessions}
        />
      </Card>
    </div>
  );
}
