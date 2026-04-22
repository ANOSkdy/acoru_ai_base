export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/src/components/layout/PageHeader";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { getServerOrganizationId } from "@/src/server/auth/get-server-organization-id";
import { getUserWithRolesService } from "@/src/server/services/users/get-user";
import { listOrgUnitOptionsService } from "@/src/server/services/org-units/list-org-units";
import styles from "@/src/components/master/MasterDetail.module.css";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function UserDetailPage({ params }: PageProps) {
  const { id } = await params;
  const organizationId = await getServerOrganizationId();
  if (!organizationId) notFound();

  const [user, orgUnits] = await Promise.all([
    getUserWithRolesService(organizationId, id),
    listOrgUnitOptionsService(organizationId),
  ]);

  if (!user) notFound();

  return (
    <div className={styles.page}>
      <Link href="/app/master/users" className={styles.backLink}>
        ← ユーザー一覧に戻る
      </Link>

      <div className={styles.headerRow}>
        <PageHeader title={user.display_name} description={`メール: ${user.email}`} />
        <div className={styles.actions}>
          <Link href={`/app/master/users/${id}/edit`}>
            <Button variant="secondary">編集</Button>
          </Link>
        </div>
      </div>

      <Card>
        <div className={styles.fieldGrid}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>社員コード</span>
            <span className={styles.fieldValue}>{user.employee_code ?? "—"}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>表示名</span>
            <span className={styles.fieldValue}>{user.display_name}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>メールアドレス</span>
            <span className={styles.fieldValue}>{user.email}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>組織ユニット</span>
            <span className={styles.fieldValue}>
              {orgUnits.find((unit) => unit.id === user.org_unit_id)?.name ?? "—"}
            </span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>ステータス</span>
            <span>
              <Badge variant={user.status === "active" ? "success" : "neutral"}>
                {user.status === "active" ? "有効" : "無効"}
              </Badge>
            </span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>登録日</span>
            <span className={styles.fieldValue}>{user.created_at.slice(0, 10)}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>更新日</span>
            <span className={styles.fieldValue}>{user.updated_at.slice(0, 10)}</span>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>割り当てロール</h3>
          {user.roles.length === 0 ? (
            <p className={styles.emptyRelated}>ロール未設定</p>
          ) : (
            <table className={styles.relatedTable}>
              <thead>
                <tr>
                  <th className={styles.relatedTh}>コード</th>
                  <th className={styles.relatedTh}>名称</th>
                </tr>
              </thead>
              <tbody>
                {user.roles.map((role) => (
                  <tr key={role.role_id}>
                    <td className={styles.relatedTd}>{role.code}</td>
                    <td className={styles.relatedTd}>{role.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
