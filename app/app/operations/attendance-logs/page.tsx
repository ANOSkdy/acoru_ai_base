export const dynamic = "force-dynamic";

import Link from "next/link";

import { PageHeader } from "@/src/components/layout/PageHeader";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import {
  formatDate,
  formatDateTime,
  getAttendanceLogTypeLabel,
  getAttendanceSourceLabel,
  getBadgeVariantByStatus,
  getWorkSessionStatusLabel,
} from "@/src/components/operations/presentation";
import { listAttendanceLogsService } from "@/src/server/services/attendance/list-attendance-logs";
import { listSitesService } from "@/src/server/services/sites/list-sites";
import styles from "@/src/components/operations/OperationsList.module.css";

const FALLBACK_ORG_ID = "00000000-0000-0000-0000-000000000001";

type PageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function AttendanceLogsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q?.trim() ?? undefined;
  const logType = params.logType === "clock_in" ||
      params.logType === "clock_out" ||
      params.logType === "break_start" ||
      params.logType === "break_end"
    ? params.logType
    : undefined;
  const siteId = params.siteId?.trim() || undefined;
  const dateFrom = params.dateFrom?.trim() || undefined;
  const dateTo = params.dateTo?.trim() || undefined;

  const [items, sites] = await Promise.all([
    listAttendanceLogsService({
      organizationId: FALLBACK_ORG_ID,
      search: q,
      logType,
      siteId,
      dateFrom,
      dateTo,
      limit: 50,
      offset: 0,
    }),
    listSitesService({
      organizationId: FALLBACK_ORG_ID,
      status: "active",
      limit: 100,
      offset: 0,
    }),
  ]);

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <PageHeader
          title="勤怠ログ"
          description="手動登録を含む勤怠打刻を確認し、作業セッションとの紐づきや状態を確認します。"
        />
        <Link href="/app/operations/attendance-logs/new">
          <Button>手動登録</Button>
        </Link>
      </div>

      <Card className={styles.filterCard}>
        <form method="GET" className={styles.filterRow}>
          <div className={styles.field}>
            <label htmlFor="q" className={styles.label}>検索</label>
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={q ?? ""}
              placeholder="社員名・社員コード・現場名"
              className={styles.textInput}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="logType" className={styles.label}>記録種別</label>
            <select id="logType" name="logType" defaultValue={logType ?? ""} className={styles.select}>
              <option value="">すべて</option>
              <option value="clock_in">出勤</option>
              <option value="clock_out">退勤</option>
              <option value="break_start">休憩開始</option>
              <option value="break_end">休憩終了</option>
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor="siteId" className={styles.label}>現場</label>
            <select id="siteId" name="siteId" defaultValue={siteId ?? ""} className={styles.select}>
              <option value="">すべて</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor="dateFrom" className={styles.label}>発生日(開始)</label>
            <input id="dateFrom" name="dateFrom" type="date" defaultValue={dateFrom ?? ""} className={styles.dateInput} />
          </div>
          <div className={styles.field}>
            <label htmlFor="dateTo" className={styles.label}>発生日(終了)</label>
            <input id="dateTo" name="dateTo" type="date" defaultValue={dateTo ?? ""} className={styles.dateInput} />
          </div>
          <div className={styles.filterActions}>
            <button type="submit" className={styles.searchBtn}>絞り込む</button>
            <Link href="/app/operations/attendance-logs" className={styles.clearLink}>クリア</Link>
          </div>
        </form>
      </Card>

      <Card>
        {items.length === 0 ? (
          <p className={styles.emptyState}>表示できる勤怠ログがありません。条件を変更するか、手動登録を行ってください。</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>発生日時</th>
                <th className={styles.th}>ユーザー</th>
                <th className={styles.th}>現場</th>
                <th className={styles.th}>記録種別</th>
                <th className={styles.th}>登録元</th>
                <th className={styles.th}>紐づきセッション</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td className={styles.td}>
                    <div className={styles.stack}>
                      <span>{formatDateTime(item.occurred_at)}</span>
                      <span className={styles.subText}>{formatDate(item.created_at)} 登録</span>
                    </div>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.stack}>
                      <span>{item.user_display_name}</span>
                      <span className={styles.subText}>{item.user_employee_code ?? "社員コード未設定"}</span>
                    </div>
                  </td>
                  <td className={styles.td}>{item.site_name ?? "—"}</td>
                  <td className={styles.td}>
                    <Badge variant={getBadgeVariantByStatus(item.log_type)}>
                      {getAttendanceLogTypeLabel(item.log_type)}
                    </Badge>
                  </td>
                  <td className={styles.td}>{getAttendanceSourceLabel(item.source)}</td>
                  <td className={styles.td}>
                    {item.work_session_id ? (
                      <div className={styles.stack}>
                        <Link href={`/app/operations/work-sessions/${item.work_session_id}`} className={styles.link}>
                          {item.work_session_session_date ?? "セッション詳細"}
                        </Link>
                        <span className={styles.subText}>
                          {item.work_session_status ? getWorkSessionStatusLabel(item.work_session_status) : "状態未設定"}
                        </span>
                      </div>
                    ) : (
                      "未紐づけ"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
