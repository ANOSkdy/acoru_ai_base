export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/src/components/layout/PageHeader";
import { Badge } from "@/src/components/ui/Badge";
import { Card } from "@/src/components/ui/Card";
import {
  formatDate,
  formatDateTime,
  getBadgeVariantByStatus,
} from "@/src/components/operations/presentation";
import { getServerOrganizationId } from "@/src/server/auth/get-server-organization-id";
import { listClosingPeriodsService } from "@/src/server/services/closing-periods/list-closing-periods";
import styles from "@/src/components/operations/OperationsList.module.css";

type PageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

function getClosingStatusLabel(value: string) {
  switch (value) {
    case "open":
      return "締め前";
    case "closed":
      return "締め済み";
    default:
      return value;
  }
}

export default async function ClosingPeriodsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const organizationId = await getServerOrganizationId();
  if (!organizationId) notFound();

  const status = params.status === "open" || params.status === "closed"
    ? params.status
    : undefined;
  const dateFrom = params.dateFrom?.trim() || undefined;
  const dateTo = params.dateTo?.trim() || undefined;

  const items = await listClosingPeriodsService({
    organizationId,
    status,
    dateFrom,
    dateTo,
    limit: 50,
    offset: 0,
  });

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <PageHeader
          title="締め期間一覧"
          description="締め対象の期間を一覧で確認し、必要な期間を選んで締め処理へ進みます。"
        />
      </div>

      <Card className={styles.filterCard}>
        <form method="GET" className={styles.filterRow}>
          <div className={styles.field}>
            <label htmlFor="status" className={styles.label}>状態</label>
            <select id="status" name="status" defaultValue={status ?? ""} className={styles.select}>
              <option value="">すべて</option>
              <option value="open">締め前</option>
              <option value="closed">締め済み</option>
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor="dateFrom" className={styles.label}>開始日(開始)</label>
            <input id="dateFrom" name="dateFrom" type="date" defaultValue={dateFrom ?? ""} className={styles.dateInput} />
          </div>
          <div className={styles.field}>
            <label htmlFor="dateTo" className={styles.label}>終了日(終了)</label>
            <input id="dateTo" name="dateTo" type="date" defaultValue={dateTo ?? ""} className={styles.dateInput} />
          </div>
          <div className={styles.filterActions}>
            <button type="submit" className={styles.searchBtn}>絞り込む</button>
            <Link href="/app/closing/periods" className={styles.clearLink}>クリア</Link>
          </div>
        </form>
      </Card>

      <Card>
        {items.length === 0 ? (
          <p className={styles.emptyState}>
            表示できる締め期間がありません。条件を変更して再度確認してください。
          </p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>ラベル</th>
                <th className={styles.th}>期間開始</th>
                <th className={styles.th}>期間終了</th>
                <th className={styles.th}>状態</th>
                <th className={styles.th}>締め日時</th>
                <th className={styles.th}>締め担当</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td className={styles.td}>
                    <div className={styles.stack}>
                      <Link href={`/app/closing/periods/${item.id}`} className={styles.link}>
                        {item.label}
                      </Link>
                      <span className={styles.subText}>ID: {item.id.slice(0, 8)}</span>
                    </div>
                  </td>
                  <td className={styles.td}>{formatDate(item.period_start)}</td>
                  <td className={styles.td}>{formatDate(item.period_end)}</td>
                  <td className={styles.td}>
                    <Badge variant={getBadgeVariantByStatus(item.status)}>
                      {getClosingStatusLabel(item.status)}
                    </Badge>
                  </td>
                  <td className={styles.td}>{formatDateTime(item.closed_at)}</td>
                  <td className={styles.td}>{item.closed_by_name ?? "未処理"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
