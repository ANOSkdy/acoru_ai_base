export const dynamic = "force-dynamic";

import Link from "next/link";
import { PageHeader } from "@/src/components/layout/PageHeader";
import { UserForm } from "@/src/components/master/UserForm";
import { notFound } from "next/navigation";
import { getServerOrganizationId } from "@/src/server/auth/get-server-organization-id";
import { listRoleOptionsService } from "@/src/server/services/roles/list-roles";
import { listOrgUnitOptionsService } from "@/src/server/services/org-units/list-org-units";
import { Card } from "@/src/components/ui/Card";
import styles from "@/src/components/master/MasterForm.module.css";

export default async function NewUserPage() {
  const organizationId = await getServerOrganizationId();
  if (!organizationId) notFound();
  const [roles, orgUnits] = await Promise.all([listRoleOptionsService(), listOrgUnitOptionsService(organizationId)]);
  return (
    <div className={styles.page}>
      <Link href="/app/master/users" className={styles.backLink}>
        ← ユーザー一覧に戻る
      </Link>
      <PageHeader title="ユーザー 新規作成" />
      <Card>
        <UserForm cancelHref="/app/master/users" roleOptions={roles.map((r) => ({ id: r.id, name: r.name, code: r.code }))} orgUnitOptions={orgUnits.map((o) => ({ id: o.id, name: o.name }))} />
      </Card>
    </div>
  );
}
