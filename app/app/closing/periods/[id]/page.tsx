export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/src/components/layout/PageHeader";
import { Badge } from "@/src/components/ui/Badge";
import { Card } from "@/src/components/ui/Card";
import { ClosingPeriodCloseAction } from "@/src/components/closing/ClosingPeriodCloseAction";
import {
  formatDate,
  formatDateTime,
  getBadgeVariantByStatus,
} from "@/src/components/operations/presentation";
import { getClosingPeriodService } from "@/src/server/services/closing-periods/get-closing-period";
import styles from "@/src/components/operations/OperationsDetail.module.css";

const FALLBACK_ORG_ID = "00000000-0000-0000-0000-000000000001";

type PageProps = {
  params: Promise<{ id: string }>;
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

export default async function ClosingPeriodDetailPage({ params }: PageProps) {
  const { id } = await params;
  const closingPeriod = await getClosingPeriodService(FALLBACK_ORG_ID, id);

  if (!closingPeriod) {
    notFound();
  }

  return (
    <div className={styles.page}>
      <Link href="/app/closing/periods" className={styles.backLink}>
        ← 締め期間一覧に戻る
      </Link>

      <div className={styles.headerRow}>
        <PageHeader
          title="締め期間詳細"
          description="締め対象の期間と現在状態を確認し、必要な場合に締め処理を実行します。"
        />
      </div>

      <Card>
        <div className={styles.summaryGrid}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>ラベル</span>
            <span className={styles.fieldValue}>{closingPeriod.label}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>状態</span>
            <span>
              <Badge variant={getBadgeVariantByStatus(closingPeriod.status)}>
                {getClosingStatusLabel(closingPeriod.status)}
              </Badge>
            </span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>期間開始</span>
            <span className={styles.fieldValue}>{formatDate(closingPeriod.period_start)}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>期間終了</span>
            <span className={styles.fieldValue}>{formatDate(closingPeriod.period_end)}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>登録者</span>
            <span className={styles.fieldValue}>{closingPeriod.created_by_name ?? "未設定"}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>登録日時</span>
            <span className={styles.fieldValue}>{formatDateTime(closingPeriod.created_at)}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>締め担当</span>
            <span className={styles.fieldValue}>{closingPeriod.closed_by_name ?? "未処理"}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>締め日時</span>
            <span className={styles.fieldValue}>{formatDateTime(closingPeriod.closed_at)}</span>
          </div>
        </div>
      </Card>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>運用メモ</h2>
        <Card>
          <div className={styles.noteBlock}>
            <span className={styles.noteLabel}>締めの意味</span>
            <p className={styles.notes}>
              ベースラインでは、締めは対象期間の確認完了を明示する操作です。
              承認済みデータを確認した上で実行し、後続の集計や出力の基準状態として扱います。
            </p>
          </div>
          <div className={styles.noteBlock}>
            <span className={styles.noteLabel}>下流連携の扱い</span>
            <p className={styles.notes}>
              この画面では外部出力は行いません。必要に応じて別処理でエクスポートや連携を実施してください。
            </p>
          </div>
        </Card>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>締め操作</h2>
        <Card>
          <ClosingPeriodCloseAction
            periodId={closingPeriod.id}
            disabled={closingPeriod.status !== "open"}
          />
        </Card>
      </div>
    </div>
  );
}
