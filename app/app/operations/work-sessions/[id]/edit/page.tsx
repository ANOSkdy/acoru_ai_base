export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/src/components/layout/PageHeader";
import { Card } from "@/src/components/ui/Card";
import { WorkSessionEditForm } from "@/src/components/operations/WorkSessionEditForm";
import { getWorkSessionService } from "@/src/server/services/work-sessions/get-work-session";
import styles from "@/src/components/master/MasterForm.module.css";

const FALLBACK_ORG_ID = "00000000-0000-0000-0000-000000000001";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditWorkSessionPage({ params }: PageProps) {
  const { id } = await params;
  const workSession = await getWorkSessionService(FALLBACK_ORG_ID, id);

  if (!workSession) {
    notFound();
  }

  return (
    <div className={styles.page}>
      <Link href={`/app/operations/work-sessions/${id}`} className={styles.backLink}>
        ← 作業セッション詳細に戻る
      </Link>
      <PageHeader
        title="作業セッション補正"
        description="開始・終了時刻と備考のみを安全に補正します。"
      />
      <Card>
        <WorkSessionEditForm
          workSession={workSession}
          cancelHref={`/app/operations/work-sessions/${id}`}
        />
      </Card>
    </div>
  );
}
