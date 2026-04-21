export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/src/components/layout/PageHeader";
import { Card } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { WorkSessionActions } from "@/src/components/operations/WorkSessionActions";
import {
  formatDate,
  formatDateTime,
  getAttendanceLogTypeLabel,
  getBadgeVariantByStatus,
  getWorkSessionStatusLabel,
} from "@/src/components/operations/presentation";
import { getWorkSessionService } from "@/src/server/services/work-sessions/get-work-session";
import styles from "@/src/components/operations/OperationsDetail.module.css";

const FALLBACK_ORG_ID = "00000000-0000-0000-0000-000000000001";

type PageProps = {
  params: Promise<{ id: string }>;
};

function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remain = minutes % 60;

  if (!hours) {
    return `${remain}分`;
  }

  return `${hours}時間${remain}分`;
}

export default async function WorkSessionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const workSession = await getWorkSessionService(FALLBACK_ORG_ID, id);

  if (!workSession) {
    notFound();
  }

  return (
    <div className={styles.page}>
      <Link href="/app/operations/work-sessions" className={styles.backLink}>
        ← 作業セッション一覧に戻る
      </Link>

      <div className={styles.headerRow}>
        <PageHeader
          title="作業セッション詳細"
          description={`${workSession.user_display_name} / ${formatDate(workSession.session_date)}`}
        />
        <div className={styles.actions}>
          {workSession.status !== "approved" && (
            <Link href={`/app/operations/work-sessions/${workSession.id}/edit`}>
              <Button variant="secondary">補正</Button>
            </Link>
          )}
          <WorkSessionActions
            workSessionId={workSession.id}
            isApproved={workSession.status === "approved"}
          />
        </div>
      </div>

      <Card>
        <div className={styles.summaryGrid}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>対象日</span>
            <span className={styles.fieldValue}>{formatDate(workSession.session_date)}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>ユーザー</span>
            <span className={styles.fieldValue}>
              {workSession.user_display_name}
              {workSession.user_employee_code ? ` (${workSession.user_employee_code})` : ""}
            </span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>ステータス</span>
            <span>
              <Badge variant={getBadgeVariantByStatus(workSession.status)}>
                {getWorkSessionStatusLabel(workSession.status)}
              </Badge>
            </span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>案件</span>
            <span className={styles.fieldValue}>{workSession.project_name ?? "未設定"}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>現場</span>
            <span className={styles.fieldValue}>{workSession.site_name ?? "未設定"}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>作業区分</span>
            <span className={styles.fieldValue}>{workSession.work_category_name ?? "未設定"}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>開始日時</span>
            <span className={styles.fieldValue}>{formatDateTime(workSession.started_at)}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>終了日時</span>
            <span className={styles.fieldValue}>{formatDateTime(workSession.ended_at)}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>承認情報</span>
            <span className={styles.fieldValue}>
              {workSession.approved_at
                ? `${formatDateTime(workSession.approved_at)} / ${workSession.approved_by_name ?? "承認者未設定"}`
                : "未承認"}
            </span>
          </div>
        </div>
      </Card>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>関連勤怠ログ</h2>
        <Card>
          {workSession.attendanceLogs.length === 0 ? (
            <p className={styles.empty}>関連する勤怠ログはありません。</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>発生日時</th>
                  <th className={styles.th}>種別</th>
                  <th className={styles.th}>登録元</th>
                  <th className={styles.th}>現場</th>
                </tr>
              </thead>
              <tbody>
                {workSession.attendanceLogs.map((log) => (
                  <tr key={log.id}>
                    <td className={styles.td}>{formatDateTime(log.occurred_at)}</td>
                    <td className={styles.td}>{getAttendanceLogTypeLabel(log.log_type ?? log.event_type)}</td>
                    <td className={styles.td}>{log.source ?? "—"}</td>
                    <td className={styles.td}>{log.site_name ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>作業明細</h2>
        <Card>
          {workSession.workEntries.length === 0 ? (
            <p className={styles.empty}>作業明細は登録されていません。</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>日付</th>
                  <th className={styles.th}>作業時間</th>
                  <th className={styles.th}>備考</th>
                </tr>
              </thead>
              <tbody>
                {workSession.workEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td className={styles.td}>{formatDate(entry.entry_date)}</td>
                    <td className={styles.td}>{formatMinutes(entry.minutes_worked)}</td>
                    <td className={styles.td}>{entry.notes ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>運用メモ</h2>
        <Card>
          <div className={styles.noteBlock}>
            <span className={styles.noteLabel}>セッション備考</span>
            <p className={styles.notes}>{workSession.notes ?? "備考はありません。"}</p>
          </div>
          {workSession.approvalSummary && (
            <div className={styles.noteBlock}>
              <span className={styles.noteLabel}>承認メモ</span>
              <p className={styles.notes}>{workSession.approvalSummary.comment ?? "承認コメントはありません。"}</p>
              <span className={styles.helper}>
                承認状態: {workSession.approvalSummary.request_status}
                {workSession.approvalSummary.reviewer_name
                  ? ` / ${workSession.approvalSummary.reviewer_name}`
                  : ""}
              </span>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
