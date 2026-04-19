export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/src/components/layout/PageHeader";
import { Card } from "@/src/components/ui/Card";
import { SiteForm } from "@/src/components/master/SiteForm";
import { getSiteService } from "@/src/server/services/sites/get-site";
import { listProjectsService } from "@/src/server/services/projects/list-projects";
import styles from "@/src/components/master/MasterForm.module.css";

const FALLBACK_ORG_ID = "00000000-0000-0000-0000-000000000001";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditSitePage({ params }: PageProps) {
  const { id } = await params;

  const [site, projects] = await Promise.all([
    getSiteService(FALLBACK_ORG_ID, id),
    listProjectsService({
      organizationId: FALLBACK_ORG_ID,
      status: "active",
      limit: 200,
      offset: 0,
    }),
  ]);

  if (!site) notFound();

  return (
    <div className={styles.page}>
      <Link href={`/app/master/sites/${id}`} className={styles.backLink}>
        ← 現場詳細に戻る
      </Link>
      <PageHeader title={`現場 編集: ${site.name}`} />
      <Card>
        <SiteForm
          id={site.id}
          projects={projects.map((p) => ({ id: p.id, code: p.code, name: p.name }))}
          initialValues={{
            projectId: site.project_id ?? "",
            code: site.code,
            name: site.name,
            timezone: site.timezone,
            address: site.address ?? "",
            status: site.status as "active" | "inactive",
          }}
          cancelHref={`/app/master/sites/${id}`}
        />
      </Card>
    </div>
  );
}
