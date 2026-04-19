export const dynamic = "force-dynamic";

import Link from "next/link";
import { PageHeader } from "@/src/components/layout/PageHeader";
import { Card } from "@/src/components/ui/Card";
import { SiteForm } from "@/src/components/master/SiteForm";
import { listProjectsService } from "@/src/server/services/projects/list-projects";
import styles from "@/src/components/master/MasterForm.module.css";

const FALLBACK_ORG_ID = "00000000-0000-0000-0000-000000000001";

export default async function NewSitePage() {
  const projects = await listProjectsService({
    organizationId: FALLBACK_ORG_ID,
    status: "active",
    limit: 200,
    offset: 0,
  });

  return (
    <div className={styles.page}>
      <Link href="/app/master/sites" className={styles.backLink}>
        ← 現場一覧に戻る
      </Link>
      <PageHeader title="現場 新規作成" />
      <Card>
        <SiteForm
          projects={projects.map((p) => ({ id: p.id, code: p.code, name: p.name }))}
          cancelHref="/app/master/sites"
        />
      </Card>
    </div>
  );
}
