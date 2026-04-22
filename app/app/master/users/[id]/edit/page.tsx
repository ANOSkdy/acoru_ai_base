export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/src/components/layout/PageHeader";
import { UserForm } from "@/src/components/master/UserForm";
import { Card } from "@/src/components/ui/Card";
import { getServerOrganizationId } from "@/src/server/auth/get-server-organization-id";
import { getUserWithRolesService } from "@/src/server/services/users/get-user";
import { listRoleOptionsService } from "@/src/server/services/roles/list-roles";
import { listOrgUnitOptionsService } from "@/src/server/services/org-units/list-org-units";
import styles from "@/src/components/master/MasterForm.module.css";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditUserPage({ params }: PageProps) {
  const { id } = await params;
  const organizationId = await getServerOrganizationId();
  if (!organizationId) notFound();

  const [user, roles, orgUnits] = await Promise.all([
    getUserWithRolesService(organizationId, id),
    listRoleOptionsService(),
    listOrgUnitOptionsService(organizationId),
  ]);

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
            orgUnitId: user.org_unit_id ?? "",
            roleIds: user.roles.map((role) => role.role_id),
          }}
          cancelHref={`/app/master/users/${id}`}
          roleOptions={roles.map((r) => ({ id: r.id, name: r.name, code: r.code }))}
          orgUnitOptions={orgUnits.map((o) => ({ id: o.id, name: o.name }))}
        />
      </Card>
    </div>
  );
}
