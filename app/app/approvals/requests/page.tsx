export const dynamic = "force-dynamic";

import Link from "next/link";

import { PageHeader } from "@/src/components/layout/PageHeader";
import { Badge } from "@/src/components/ui/Badge";
import { Card } from "@/src/components/ui/Card";
import {
  formatDateTime,
  getBadgeVariantByStatus,
} from "@/src/components/operations/presentation";
import {
  getApprovalRequestTypeLabel,
  getApprovalStatusLabel,
  getApprovalTargetTypeLabel,
} from "@/src/components/approvals/presentation";
import { listUsersService } from "@/src/server/services/users/list-users";
import { listApprovalsService } from "@/src/server/services/approvals/list-approvals";
import styles from "@/src/components/operations/OperationsList.module.css";

const FALLBACK_ORG_ID = "00000000-0000-0000-0000-000000000001";

type PageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function ApprovalRequestsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = params.status === "pending" ||
      params.status === "approved" ||
      params.status === "rejected"
    ? params.status
    : undefined;
  const targetType = params.targetType?.trim() || undefined;
  const requester = params.requester?.trim() || undefined;
  const dateFrom = params.dateFrom?.trim() || undefined;
  const dateTo = params.dateTo?.trim() || undefined;

  const [items, users] = await Promise.all([
    listApprovalsService({
      organizationId: FALLBACK_ORG_ID,
      status,
      targetType,
      requester,
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
          title="承認一覧"
          description="確認待ちの申請を起点に、内容確認から承認・却下までをこの画面で進めます。"
        />
      </div>

      <Card className={styles.filterCard}>
        <form method="GET" className={styles.filterRow}>
          <div className={styles.field}>
            <label htmlFor="status" className={styles.label}>状態</label>
            <select id="status" name="status" defaultValue={status ?? ""} className={styles.select}>
              <option value="">すべて</option>
              <option value="pending">確認待ち</option>
              <option value="approved">承認済み</option>
              <option value="rejected">却下</option>
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor="targetType" className={styles.label}>対象種別</label>
            <select id="targetType" name="targetType" defaultValue={targetType ?? ""} className={styles.select}>
              <option value="">すべて</option>
              <option value="work_session">作業セッション</option>
              <option value="daily_report">日報</option>
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor="requester" className={styles.label}>申請者</label>
            <select id="requester" name="requester" defaultValue={requester ?? ""} className={styles.select}>
              <option value="">すべて</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.display_name}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor="dateFrom" className={styles.label}>申請日(開始)</label>
            <input id="dateFrom" name="dateFrom" type="date" defaultValue={dateFrom ?? ""} className={styles.dateInput} />
          </div>
          <div className={styles.field}>
            <label htmlFor="dateTo" className={styles.label}>申請日(終了)</label>
            <input id="dateTo" name="dateTo" type="date" defaultValue={dateTo ?? ""} className={styles.dateInput} />
          </div>
          <div className={styles.filterActions}>
            <button type="submit" className={styles.searchBtn}>絞り込む</button>
            <Link href="/app/approvals/requests" className={styles.clearLink}>クリア</Link>
          </div>
        </form>
      </Card>

      <Card>
        {items.length === 0 ? (
          <p className={styles.emptyState}>
            表示できる承認依頼がありません。条件を変更して再度確認してください。
          </p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>申請種別</th>
                <th className={styles.th}>対象種別</th>
                <th className={styles.th}>対象概要</th>
                <th className={styles.th}>申請者</th>
                <th className={styles.th}>現在担当</th>
                <th className={styles.th}>状態</th>
                <th className={styles.th}>申請日時</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td className={styles.td}>{getApprovalRequestTypeLabel(item.target_type)}</td>
                  <td className={styles.td}>{getApprovalTargetTypeLabel(item.target_type)}</td>
                  <td className={styles.td}>
                    <div className={styles.stack}>
                      <Link href={`/app/approvals/requests/${item.id}`} className={styles.link}>
                        {item.target_summary}
                      </Link>
                      <span className={styles.subText}>ID: {item.target_id.slice(0, 8)}</span>
                    </div>
                  </td>
                  <td className={styles.td}>{item.requester_name ?? "未設定"}</td>
                  <td className={styles.td}>{item.current_approver_name ?? "未設定"}</td>
                  <td className={styles.td}>
                    <Badge variant={getBadgeVariantByStatus(item.status)}>
                      {getApprovalStatusLabel(item.status)}
                    </Badge>
                  </td>
                  <td className={styles.td}>{formatDateTime(item.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
