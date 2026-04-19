import { PageHeader } from "@/src/components/layout/PageHeader";
import { Card } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import styles from "./page.module.css";

const METRICS = [
  { label: "本日の出勤者数", value: "24", unit: "名", note: "登録ユーザー 30 名中" },
  { label: "承認待ち作業セッション", value: "7", unit: "件", note: "最古: 2日前" },
  { label: "今月の締め処理", value: "未完了", unit: "", note: "2024年4月分" },
  { label: "未処理日報", value: "3", unit: "件", note: "本日提出待ち" },
];

type AttentionItem = {
  id: string;
  title: string;
  detail: string;
  badge: { label: string; variant: "warning" | "danger" | "info" };
};

const ATTENTION_ITEMS: AttentionItem[] = [
  {
    id: "1",
    title: "作業セッション承認が滞留しています",
    detail: "7件が承認待ち状態です。2日以上経過しているものが2件あります。",
    badge: { label: "要承認", variant: "warning" },
  },
  {
    id: "2",
    title: "4月分の勤怠締め処理が未完了です",
    detail: "期日: 2024年5月10日。締め処理を開始してください。",
    badge: { label: "要対応", variant: "danger" },
  },
  {
    id: "3",
    title: "新規ユーザー登録の確認",
    detail: "田中 一郎 さんのアカウントが仮登録状態です。",
    badge: { label: "確認待ち", variant: "info" },
  },
];

type ActivityItem = {
  id: string;
  user: string;
  action: string;
  timestamp: string;
};

const ACTIVITY_ITEMS: ActivityItem[] = [
  { id: "1", user: "山田 花子", action: "作業セッション #1023 を提出しました", timestamp: "10分前" },
  { id: "2", user: "鈴木 太郎", action: "日報を提出しました（2024-04-18）", timestamp: "32分前" },
  { id: "3", user: "管理者", action: "勤怠ポリシー「標準」を更新しました", timestamp: "1時間前" },
  { id: "4", user: "佐藤 次郎", action: "作業セッション #1021 が承認されました", timestamp: "2時間前" },
  { id: "5", user: "高橋 三郎", action: "出勤記録を登録しました", timestamp: "3時間前" },
];

export default function DashboardPage() {
  return (
    <div className={styles.page}>
      <PageHeader title="ダッシュボード" description="今日の業務状況を確認します" />

      <section className={styles.metricsGrid}>
        {METRICS.map((m) => (
          <Card key={m.label}>
            <p className={styles.metricLabel}>{m.label}</p>
            <p className={styles.metricValue}>
              {m.value}
              {m.unit && <span className={styles.metricUnit}>{m.unit}</span>}
            </p>
            <p className={styles.metricNote}>{m.note}</p>
          </Card>
        ))}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>対応が必要な項目</h2>
        <div className={styles.attentionList}>
          {ATTENTION_ITEMS.map((item) => (
            <Card key={item.id} className={styles.attentionCard}>
              <div className={styles.attentionRow}>
                <div className={styles.attentionContent}>
                  <p className={styles.attentionTitle}>{item.title}</p>
                  <p className={styles.attentionDetail}>{item.detail}</p>
                </div>
                <Badge variant={item.badge.variant}>{item.badge.label}</Badge>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>最近の活動</h2>
        <Card>
          <ul className={styles.activityList}>
            {ACTIVITY_ITEMS.map((item, i) => (
              <li
                key={item.id}
                className={`${styles.activityItem} ${i < ACTIVITY_ITEMS.length - 1 ? styles.activityItemBorder : ""}`}
              >
                <div className={styles.activityDot} />
                <div className={styles.activityContent}>
                  <span className={styles.activityUser}>{item.user}</span>
                  <span className={styles.activityAction}>{item.action}</span>
                </div>
                <span className={styles.activityTime}>{item.timestamp}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}
