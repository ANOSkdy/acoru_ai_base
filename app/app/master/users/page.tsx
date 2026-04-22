export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/src/components/ui/Badge";
import {
  MasterListEmptyState,
  MasterListFilterRow,
  MasterListPageFrame,
  MasterListTableShell,
} from "@/src/components/master/MasterListFoundation";
import { getServerOrganizationId } from "@/src/server/auth/get-server-organization-id";
import { listUsersForMasterService } from "@/src/server/services/users/list-users";
import styles from "@/src/components/master/MasterList.module.css";

type PageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function UsersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const organizationId = await getServerOrganizationId();
  if (!organizationId) notFound();

  const q = params.q?.trim() ?? undefined;
  const status = params.status === "active" || params.status === "inactive"
    ? params.status
    : undefined;

  const items = await listUsersForMasterService({
    organizationId,
    search: q,
    status,
    limit: 50,
    offset: 0,
  });

  return (
    <MasterListPageFrame
      title="ユーザー"
      description="ユーザーマスタの一覧を管理します"
      createHref="/app/master/users/new"
    >
      <MasterListFilterRow
        q={q}
        status={status}
        clearHref="/app/master/users"
        placeholder="表示名・社員コード・メールで検索"
      />

      {items.length === 0 ? (
        <MasterListEmptyState
          hasFilters={Boolean(q || status)}
          filteredMessage="条件に一致するユーザーが見つかりません"
          defaultMessage="ユーザーが登録されていません"
        />
      ) : (
        <MasterListTableShell
          headers={(
            <>
              <th className={styles.th}>社員コード</th>
              <th className={styles.th}>表示名</th>
              <th className={styles.th}>メールアドレス</th>
              <th className={styles.th}>ステータス</th>
            </>
          )}
          rows={items.map((item) => (
            <tr key={item.id}>
              <td className={styles.td}>{item.employee_code ?? "—"}</td>
              <td className={styles.td}>
                <Link href={`/app/master/users/${item.id}`} className={styles.tdLink}>
                  {item.display_name}
                </Link>
              </td>
              <td className={styles.td}>{item.email}</td>
              <td className={styles.td}>
                <Badge variant={item.status === "active" ? "success" : "neutral"}>
                  {item.status === "active" ? "有効" : "無効"}
                </Badge>
              </td>
            </tr>
          ))}
        />
      )}
    </MasterListPageFrame>
  );
}
