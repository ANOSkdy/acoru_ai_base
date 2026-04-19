export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/src/components/layout/PageHeader";
import { Card } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { getClientService } from "@/src/server/services/clients/get-client";
import { listProjectsService } from "@/src/server/services/projects/list-projects";
import styles from "@/src/components/master/MasterDetail.module.css";

const FALLBACK_ORG_ID = "00000000-0000-0000-0000-000000000001";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ClientDetailPage({ params }: PageProps) {
  const { id } = await params;

  const [client, projects] = await Promise.all([
    getClientService(FALLBACK_ORG_ID, id),
    listProjectsService({
      organizationId: FALLBACK_ORG_ID,
      clientId: id,
      limit: 20,
      offset: 0,
    }),
  ]);

  if (!client) notFound();

  return (
    <div className={styles.page}>
      <Link href="/app/master/clients" className={styles.backLink}>
        ← 取引先一覧に戻る
      </Link>

      <div className={styles.headerRow}>
        <PageHeader title={client.name} description={`コード: ${client.code}`} />
        <div className={styles.actions}>
          <Link href={`/app/master/clients/${id}/edit`}>
            <Button variant="secondary">編集</Button>
          </Link>
        </div>
      </div>

      <Card>
        <div className={styles.fieldGrid}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>コード</span>
            <span className={styles.fieldValue}>{client.code}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>取引先名</span>
            <span className={styles.fieldValue}>{client.name}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>ステータス</span>
            <span>
              <Badge variant={client.status === "active" ? "success" : "neutral"}>
                {client.status === "active" ? "有効" : "無効"}
              </Badge>
            </span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>登録日</span>
            <span className={styles.fieldValue}>{client.created_at.slice(0, 10)}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>更新日</span>
            <span className={styles.fieldValue}>{client.updated_at.slice(0, 10)}</span>
          </div>
        </div>
      </Card>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>プロジェクト</h2>
        <Card>
          {projects.length === 0 ? (
            <p className={styles.emptyRelated}>関連プロジェクトがありません</p>
          ) : (
            <table className={styles.relatedTable}>
              <thead>
                <tr>
                  <th className={styles.relatedTh}>コード</th>
                  <th className={styles.relatedTh}>プロジェクト名</th>
                  <th className={styles.relatedTh}>ステータス</th>
                  <th className={styles.relatedTh}>開始日</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id}>
                    <td className={styles.relatedTd}>{p.code}</td>
                    <td className={styles.relatedTd}>
                      <Link
                        href={`/app/master/projects/${p.id}`}
                        className={styles.relatedLink}
                      >
                        {p.name}
                      </Link>
                    </td>
                    <td className={styles.relatedTd}>
                      <Badge variant={p.status === "active" ? "success" : "neutral"}>
                        {p.status === "active" ? "有効" : "無効"}
                      </Badge>
                    </td>
                    <td className={styles.relatedTd}>
                      {p.starts_on ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  );
}
