export const dynamic = "force-dynamic";

import Link from "next/link";

import { PageHeader } from "@/src/components/layout/PageHeader";
import { Card } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import {
  formatDate,
  formatDateTime,
  getBadgeVariantByStatus,
  getWorkSessionStatusLabel,
} from "@/src/components/operations/presentation";
import { listUsersService } from "@/src/server/services/users/list-users";
import { listWorkSessionsService } from "@/src/server/services/work-sessions/list-work-sessions";
import styles from "@/src/components/operations/OperationsList.module.css";

const FALLBACK_ORG_ID = "00000000-0000-0000-0000-000000000001";

type PageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function WorkSessionsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = params.status === "draft" ||
      params.status === "submitted" ||
      params.status === "approved" ||
      params.status === "rejected"
    ? params.status
    : undefined;
  const userId = params.userId?.trim() || undefined;
  const dateFrom = params.dateFrom?.trim() || undefined;
  const dateTo = params.dateTo?.trim() || undefined;

  const [items, users] = await Promise.all([
    listWorkSessionsService({
      organizationId: FALLBACK_ORG_ID,
      status,
      userId,
      dateFrom,
      dateTo,
      limit: 50,
      offset: 0,
    }),
    listUsersService(FALLBACK_ORG_ID),
  ]);

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <PageHeader
          title="作業セッション"
          description="申請前後の作業セッションを確認し、承認や必要最小限の時刻補正を行います。"
        />
      </div>

      <Card className={styles.filterCard}>
        <form method="GET" className={styles.filterRow}>
          <div className={styles.field}>
            <label htmlFor="status" className={styles.label}>ステータス</label>
            <select id="status" name="status" defaultValue={status ?? ""} className={styles.select}>
              <option value="">すべて</option>
              <option value="draft">下書き</option>
              <option value="submitted">申請中</option>
              <option value="approved">承認済み</option>
              <option value="rejected">差戻し</option>
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor="userId" className={styles.label}>ユーザー</label>
            <select id="userId" name="userId" defaultValue={userId ?? ""} className={styles.select}>
              <option value="">すべて</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.display_name}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor="dateFrom" className={styles.label}>対象日(開始)</label>
            <input id="dateFrom" name="dateFrom" type="date" defaultValue={dateFrom ?? ""} className={styles.dateInput} />
          </div>
          <div className={styles.field}>
            <label htmlFor="dateTo" className={styles.label}>対象日(終了)</label>
            <input id="dateTo" name="dateTo" type="date" defaultValue={dateTo ?? ""} className={styles.dateInput} />
          </div>
          <div className={styles.filterActions}>
            <button type="submit" className={styles.searchBtn}>絞り込む</button>
            <Link href="/app/operations/work-sessions" className={styles.clearLink}>クリア</Link>
          </div>
        </form>
      </Card>

      <Card>
        {items.length === 0 ? (
          <p className={styles.emptyState}>表示できる作業セッションがありません。条件を変更して再度確認してください。</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>対象日</th>
                <th className={styles.th}>ユーザー</th>
                <th className={styles.th}>案件 / 現場</th>
                <th className={styles.th}>開始 / 終了</th>
                <th className={styles.th}>状態</th>
                <th className={styles.th}>承認</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td className={styles.td}>{formatDate(item.session_date)}</td>
                  <td className={styles.td}>
                    <div className={styles.stack}>
                      <Link href={`/app/operations/work-sessions/${item.id}`} className={styles.link}>
                        {item.user_display_name}
                      </Link>
                      <span className={styles.subText}>ID: {item.id.slice(0, 8)}</span>
                    </div>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.stack}>
                      <span>{item.project_name ?? "案件未設定"}</span>
                      <span className={styles.subText}>{item.site_name ?? "現場未設定"}</span>
                    </div>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.stack}>
                      <span>{formatDateTime(item.started_at)}</span>
                      <span className={styles.subText}>{formatDateTime(item.ended_at)}</span>
                    </div>
                  </td>
                  <td className={styles.td}>
                    <Badge variant={getBadgeVariantByStatus(item.status)}>
                      {getWorkSessionStatusLabel(item.status)}
                    </Badge>
                  </td>
                  <td className={styles.td}>
                    {item.approved_at ? (
                      <div className={styles.stack}>
                        <span>{formatDateTime(item.approved_at)}</span>
                        <span className={styles.subText}>{item.approved_by_name ?? "承認者未設定"}</span>
                      </div>
                    ) : (
                      "未承認"
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
