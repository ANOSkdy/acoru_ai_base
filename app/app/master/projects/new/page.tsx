export const dynamic = "force-dynamic";

import Link from "next/link";
import { PageHeader } from "@/src/components/layout/PageHeader";
import { Card } from "@/src/components/ui/Card";
import { ProjectForm } from "@/src/components/master/ProjectForm";
import { listClientsService } from "@/src/server/services/clients/list-clients";
import styles from "@/src/components/master/MasterForm.module.css";

const FALLBACK_ORG_ID = "00000000-0000-0000-0000-000000000001";

export default async function NewProjectPage() {
  const clients = await listClientsService({
    organizationId: FALLBACK_ORG_ID,
    status: "active",
    limit: 200,
    offset: 0,
  });

  return (
    <div className={styles.page}>
      <Link href="/app/master/projects" className={styles.backLink}>
        ← プロジェクト一覧に戻る
      </Link>
      <PageHeader title="プロジェクト 新規作成" />
      <Card>
        <ProjectForm
          clients={clients.map((c) => ({ id: c.id, code: c.code, name: c.name }))}
          cancelHref="/app/master/projects"
        />
      </Card>
    </div>
  );
}
