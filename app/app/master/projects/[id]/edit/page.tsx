export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/src/components/layout/PageHeader";
import { Card } from "@/src/components/ui/Card";
import { ProjectForm } from "@/src/components/master/ProjectForm";
import { getProjectService } from "@/src/server/services/projects/get-project";
import { listClientsService } from "@/src/server/services/clients/list-clients";
import styles from "@/src/components/master/MasterForm.module.css";

const FALLBACK_ORG_ID = "00000000-0000-0000-0000-000000000001";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProjectPage({ params }: PageProps) {
  const { id } = await params;

  const [project, clients] = await Promise.all([
    getProjectService(FALLBACK_ORG_ID, id),
    listClientsService({
      organizationId: FALLBACK_ORG_ID,
      status: "active",
      limit: 200,
      offset: 0,
    }),
  ]);

  if (!project) notFound();

  return (
    <div className={styles.page}>
      <Link href={`/app/master/projects/${id}`} className={styles.backLink}>
        ← プロジェクト詳細に戻る
      </Link>
      <PageHeader title={`プロジェクト 編集: ${project.name}`} />
      <Card>
        <ProjectForm
          id={project.id}
          clients={clients.map((c) => ({ id: c.id, code: c.code, name: c.name }))}
          initialValues={{
            clientId: project.client_id ?? "",
            code: project.code,
            name: project.name,
            status: project.status as "active" | "inactive",
            startsOn: project.starts_on ?? "",
            endsOn: project.ends_on ?? "",
          }}
          cancelHref={`/app/master/projects/${id}`}
        />
      </Card>
    </div>
  );
}
