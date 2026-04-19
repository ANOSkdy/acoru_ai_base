export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/src/components/layout/PageHeader";
import { Card } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { getSiteService } from "@/src/server/services/sites/get-site";
import styles from "@/src/components/master/MasterDetail.module.css";

const FALLBACK_ORG_ID = "00000000-0000-0000-0000-000000000001";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function SiteDetailPage({ params }: PageProps) {
  const { id } = await params;
  const site = await getSiteService(FALLBACK_ORG_ID, id);

  if (!site) notFound();

  return (
    <div className={styles.page}>
      <Link href="/app/master/sites" className={styles.backLink}>
        ← 現場一覧に戻る
      </Link>

      <div className={styles.headerRow}>
        <PageHeader title={site.name} description={`コード: ${site.code}`} />
        <div className={styles.actions}>
          <Link href={`/app/master/sites/${id}/edit`}>
            <Button variant="secondary">編集</Button>
          </Link>
        </div>
      </div>

      <Card>
        <div className={styles.fieldGrid}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>コード</span>
            <span className={styles.fieldValue}>{site.code}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>現場名</span>
            <span className={styles.fieldValue}>{site.name}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>プロジェクト</span>
            {site.project_id ? (
              <Link
                href={`/app/master/projects/${site.project_id}`}
                style={{ color: "var(--primary-600)", textDecoration: "none", fontSize: "0.9375rem" }}
              >
                {site.project_name ?? site.project_id}
              </Link>
            ) : (
              <span className={styles.fieldValueMuted}>—</span>
            )}
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>ステータス</span>
            <span>
              <Badge variant={site.status === "active" ? "success" : "neutral"}>
                {site.status === "active" ? "有効" : "無効"}
              </Badge>
            </span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>タイムゾーン</span>
            <span className={styles.fieldValue}>{site.timezone}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>住所</span>
            <span className={site.address ? styles.fieldValue : styles.fieldValueMuted}>
              {site.address ?? "—"}
            </span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>登録日</span>
            <span className={styles.fieldValue}>{site.created_at.slice(0, 10)}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>更新日</span>
            <span className={styles.fieldValue}>{site.updated_at.slice(0, 10)}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
