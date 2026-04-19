export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/src/components/layout/PageHeader";
import { Card } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { getProjectService } from "@/src/server/services/projects/get-project";
import { listSitesService } from "@/src/server/services/sites/list-sites";
import styles from "@/src/components/master/MasterDetail.module.css";

const FALLBACK_ORG_ID = "00000000-0000-0000-0000-000000000001";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;

  const [project, sites] = await Promise.all([
    getProjectService(FALLBACK_ORG_ID, id),
    listSitesService({
      organizationId: FALLBACK_ORG_ID,
      projectId: id,
      limit: 20,
      offset: 0,
    }),
  ]);

  if (!project) notFound();

  return (
    <div className={styles.page}>
      <Link href="/app/master/projects" className={styles.backLink}>
        ← プロジェクト一覧に戻る
      </Link>

      <div className={styles.headerRow}>
        <PageHeader title={project.name} description={`コード: ${project.code}`} />
        <div className={styles.actions}>
          <Link href={`/app/master/projects/${id}/edit`}>
            <Button variant="secondary">編集</Button>
          </Link>
        </div>
      </div>

      <Card>
        <div className={styles.fieldGrid}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>コード</span>
            <span className={styles.fieldValue}>{project.code}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>プロジェクト名</span>
            <span className={styles.fieldValue}>{project.name}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>取引先</span>
            {project.client_id ? (
              <Link
                href={`/app/master/clients/${project.client_id}`}
                style={{ color: "var(--primary-600)", textDecoration: "none", fontSize: "0.9375rem" }}
              >
                {project.client_name ?? project.client_id}
              </Link>
            ) : (
              <span className={styles.fieldValueMuted}>—</span>
            )}
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>ステータス</span>
            <span>
              <Badge variant={project.status === "active" ? "success" : "neutral"}>
                {project.status === "active" ? "有効" : "無効"}
              </Badge>
            </span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>開始日</span>
            <span className={styles.fieldValue}>{project.starts_on ?? "—"}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>終了日</span>
            <span className={styles.fieldValue}>{project.ends_on ?? "—"}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>登録日</span>
            <span className={styles.fieldValue}>{project.created_at.slice(0, 10)}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>更新日</span>
            <span className={styles.fieldValue}>{project.updated_at.slice(0, 10)}</span>
          </div>
        </div>
      </Card>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>現場</h2>
        <Card>
          {sites.length === 0 ? (
            <p className={styles.emptyRelated}>関連現場がありません</p>
          ) : (
            <table className={styles.relatedTable}>
              <thead>
                <tr>
                  <th className={styles.relatedTh}>コード</th>
                  <th className={styles.relatedTh}>現場名</th>
                  <th className={styles.relatedTh}>ステータス</th>
                  <th className={styles.relatedTh}>タイムゾーン</th>
                </tr>
              </thead>
              <tbody>
                {sites.map((s) => (
                  <tr key={s.id}>
                    <td className={styles.relatedTd}>{s.code}</td>
                    <td className={styles.relatedTd}>
                      <Link
                        href={`/app/master/sites/${s.id}`}
                        className={styles.relatedLink}
                      >
                        {s.name}
                      </Link>
                    </td>
                    <td className={styles.relatedTd}>
                      <Badge variant={s.status === "active" ? "success" : "neutral"}>
                        {s.status === "active" ? "有効" : "無効"}
                      </Badge>
                    </td>
                    <td className={styles.relatedTd}>{s.timezone}</td>
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
