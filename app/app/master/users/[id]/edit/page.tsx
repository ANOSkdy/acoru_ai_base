export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/src/components/layout/PageHeader";
import { UserForm } from "@/src/components/master/UserForm";
import { Card } from "@/src/components/ui/Card";
import { getServerOrganizationId } from "@/src/server/auth/get-server-organization-id";
import { getUserService } from "@/src/server/services/users/get-user";
import styles from "@/src/components/master/MasterForm.module.css";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditUserPage({ params }: PageProps) {
  const { id } = await params;
  const organizationId = await getServerOrganizationId();
  if (!organizationId) notFound();

  const user = await getUserService(organizationId, id);

  if (!user) notFound();

  return (
    <div className={styles.page}>
      <Link href={`/app/master/users/${id}`} className={styles.backLink}>
        ← ユーザー詳細に戻る
      </Link>
      <PageHeader title={`ユーザー 編集: ${user.display_name}`} />
      <Card>
        <UserForm
          id={user.id}
          initialValues={{
            employeeCode: user.employee_code ?? "",
            displayName: user.display_name,
            email: user.email,
            status: user.status as "active" | "inactive",
          }}
          cancelHref={`/app/master/users/${id}`}
        />
      </Card>
    </div>
  );
}
