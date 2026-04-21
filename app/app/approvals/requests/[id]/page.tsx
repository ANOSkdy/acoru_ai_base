export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/src/components/layout/PageHeader";
import { Badge } from "@/src/components/ui/Badge";
import { Card } from "@/src/components/ui/Card";
import { ApprovalRequestActions } from "@/src/components/approvals/ApprovalRequestActions";
import {
  getApprovalRequestTypeLabel,
  getApprovalStatusLabel,
  getApprovalTargetTypeLabel,
} from "@/src/components/approvals/presentation";
import {
  formatDate,
  formatDateTime,
  getBadgeVariantByStatus,
  getWorkSessionStatusLabel,
} from "@/src/components/operations/presentation";
import { getApprovalService } from "@/src/server/services/approvals/get-approval";
import styles from "@/src/components/operations/OperationsDetail.module.css";

const FALLBACK_ORG_ID = "00000000-0000-0000-0000-000000000001";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ApprovalRequestDetailPage({ params }: PageProps) {
  const { id } = await params;
  const approval = await getApprovalService(FALLBACK_ORG_ID, id);

  if (!approval) {
    notFound();
  }

  return (
    <div className={styles.page}>
      <Link href="/app/approvals/requests" className={styles.backLink}>
        ← 承認一覧に戻る
      </Link>

      <div className={styles.headerRow}>
        <PageHeader
          title="承認詳細"
          description={`${getApprovalRequestTypeLabel(approval.target_type)} の確認内容を整理し、判断を実行します。`}
        />
      </div>

      <Card>
        <div className={styles.summaryGrid}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>状態</span>
            <span>
              <Badge variant={getBadgeVariantByStatus(approval.status)}>
                {getApprovalStatusLabel(approval.status)}
              </Badge>
            </span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>申請種別</span>
            <span className={styles.fieldValue}>{getApprovalRequestTypeLabel(approval.target_type)}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>対象種別</span>
            <span className={styles.fieldValue}>{getApprovalTargetTypeLabel(approval.target_type)}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>申請者</span>
            <span className={styles.fieldValue}>
              {approval.requester_name ?? "未設定"}
              {approval.requester_employee_code ? ` (${approval.requester_employee_code})` : ""}
            </span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>現在担当</span>
            <span className={styles.fieldValue}>{approval.current_approver_name ?? "未設定"}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>申請日時</span>
            <span className={styles.fieldValue}>{formatDateTime(approval.created_at)}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>更新日時</span>
            <span className={styles.fieldValue}>{formatDateTime(approval.updated_at)}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>対象 ID</span>
            <span className={styles.fieldValue}>{approval.target_id}</span>
          </div>
        </div>
      </Card>

      {approval.targetSummary && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>関連対象</h2>
          <Card>
            <div className={styles.summaryGrid}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>対象</span>
                <span className={styles.fieldValue}>
                  <Link href={`/app/operations/work-sessions/${approval.targetSummary.id}`}>
                    作業セッション詳細を開く
                  </Link>
                </span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>対象日</span>
                <span className={styles.fieldValue}>{formatDate(approval.targetSummary.session_date)}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>対象者</span>
                <span className={styles.fieldValue}>
                  {approval.targetSummary.user_display_name}
                  {approval.targetSummary.user_employee_code
                    ? ` (${approval.targetSummary.user_employee_code})`
                    : ""}
                </span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>状態</span>
                <span className={styles.fieldValue}>
                  {getWorkSessionStatusLabel(approval.targetSummary.status)}
                </span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>案件 / 現場</span>
                <span className={styles.fieldValue}>
                  {approval.targetSummary.project_name ?? "案件未設定"}
                  {" / "}
                  {approval.targetSummary.site_name ?? "現場未設定"}
                </span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>開始 / 終了</span>
                <span className={styles.fieldValue}>
                  {formatDateTime(approval.targetSummary.started_at)}
                  {" / "}
                  {formatDateTime(approval.targetSummary.ended_at)}
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>承認ステップ</h2>
        <Card>
          {approval.steps.length === 0 ? (
            <p className={styles.empty}>承認ステップはまだ作成されていません。</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>順序</th>
                  <th className={styles.th}>担当者</th>
                  <th className={styles.th}>状態</th>
                  <th className={styles.th}>処理日時</th>
                  <th className={styles.th}>コメント</th>
                </tr>
              </thead>
              <tbody>
                {approval.steps.map((step) => (
                  <tr key={step.id}>
                    <td className={styles.td}>{step.step_order}</td>
                    <td className={styles.td}>{step.reviewer_name ?? "未設定"}</td>
                    <td className={styles.td}>
                      <Badge variant={getBadgeVariantByStatus(step.status)}>
                        {getApprovalStatusLabel(step.status)}
                      </Badge>
                    </td>
                    <td className={styles.td}>{formatDateTime(step.reviewed_at)}</td>
                    <td className={styles.td}>{step.comment ?? "コメントなし"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>承認操作</h2>
        <Card>
          <ApprovalRequestActions
            approvalId={approval.id}
            disabled={approval.status !== "pending"}
          />
        </Card>
      </div>
    </div>
  );
}
