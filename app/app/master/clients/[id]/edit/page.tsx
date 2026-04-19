export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/src/components/layout/PageHeader";
import { Card } from "@/src/components/ui/Card";
import { ClientForm } from "@/src/components/master/ClientForm";
import { getClientService } from "@/src/server/services/clients/get-client";
import styles from "@/src/components/master/MasterForm.module.css";

const FALLBACK_ORG_ID = "00000000-0000-0000-0000-000000000001";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditClientPage({ params }: PageProps) {
  const { id } = await params;
  const client = await getClientService(FALLBACK_ORG_ID, id);

  if (!client) notFound();

  return (
    <div className={styles.page}>
      <Link href={`/app/master/clients/${id}`} className={styles.backLink}>
        ← 取引先詳細に戻る
      </Link>
      <PageHeader title={`取引先 編集: ${client.name}`} />
      <Card>
        <ClientForm
          id={client.id}
          initialValues={{
            code: client.code,
            name: client.name,
            status: client.status as "active" | "inactive",
          }}
          cancelHref={`/app/master/clients/${id}`}
        />
      </Card>
    </div>
  );
}
