export const dynamic = "force-dynamic";

import Link from "next/link";
import {
  MasterListEmptyState,
  MasterListPageFrame,
  MasterListTableShell,
} from "@/src/components/master/MasterListFoundation";
import { DataManagementGuide } from "@/src/components/master/DataManagementGuide";
import { getServerOrganizationId } from "@/src/server/auth/get-server-organization-id";
import { listAttendancePoliciesService } from "@/src/server/services/attendance-policies/list-attendance-policies";
import styles from "@/src/components/master/MasterList.module.css";

type PageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function AttendancePoliciesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q?.trim() ?? undefined;
  const organizationId = await getServerOrganizationId();

  const items = await listAttendancePoliciesService({
    organizationId,
    search: q,
    limit: 50,
    offset: 0,
  });

  return (
    <MasterListPageFrame
      title="勤怠ポリシー"
      description="データ管理システムで勤怠ポリシーを管理します"
      createHref="/app/master/attendance-policies/new"
    >
      <DataManagementGuide
        managedData="勤怠ポリシーの名称、コード、勤怠ルール定義（rules）を管理します。"
        actions="勤怠ポリシーの新規作成、詳細確認、編集、検索ができます。"
        deletionPolicy="運用実績に影響するため、原則削除せず、必要に応じて無効化・名称変更・新規作成で対応する。"
      />
      <form method="GET" className={styles.filterRow}>
        <input
          name="q"
          type="search"
          defaultValue={q ?? ""}
          placeholder="名称・コードで検索"
          className={styles.searchInput}
        />
        <button type="submit" className={styles.searchBtn}>
          検索
        </button>
        {q && (
          <Link href="/app/master/attendance-policies" className={`${styles.searchBtn} ${styles.clearLink}`}>
            クリア
          </Link>
        )}
      </form>

      {items.length === 0 ? (
        <MasterListEmptyState
          hasFilters={Boolean(q)}
          filteredMessage="条件に一致する勤怠ポリシーが見つかりません"
          defaultMessage="勤怠ポリシーが登録されていません"
        />
      ) : (
        <MasterListTableShell
          headers={(
            <>
              <th className={styles.th}>コード</th>
              <th className={styles.th}>勤怠ポリシー名</th>
              <th className={styles.th}>ルール</th>
              <th className={styles.th}>登録日</th>
            </>
          )}
          rows={items.map((item) => (
            <tr key={item.id}>
              <td className={styles.td}>{item.code}</td>
              <td className={styles.td}>
                <Link href={`/app/master/attendance-policies/${item.id}`} className={styles.tdLink}>
                  {item.name}
                </Link>
              </td>
              <td className={styles.td}>{Object.keys(item.rules ?? {}).length} keys</td>
              <td className={styles.td}>{item.created_at.slice(0, 10)}</td>
            </tr>
          ))}
        />
      )}
    </MasterListPageFrame>
  );
}
