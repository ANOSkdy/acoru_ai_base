import Link from "next/link";
import { ReactNode } from "react";
import { PageHeader } from "@/src/components/layout/PageHeader";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import styles from "@/src/components/master/MasterList.module.css";

type MasterListPageFrameProps = {
  title: string;
  description: string;
  createHref: string;
  children: ReactNode;
};

export function MasterListPageFrame({
  title,
  description,
  createHref,
  children,
}: MasterListPageFrameProps) {
  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <PageHeader title={title} description={description} />
        <Link href={createHref}>
          <Button variant="primary">新規作成</Button>
        </Link>
      </div>
      <Card>{children}</Card>
    </div>
  );
}

type MasterListFilterRowProps = {
  q?: string;
  status?: "active" | "inactive";
  clearHref: string;
  placeholder?: string;
};

export function MasterListFilterRow({
  q,
  status,
  clearHref,
  placeholder = "名称・コードで検索",
}: MasterListFilterRowProps) {
  return (
    <form method="GET" className={styles.filterRow}>
      <input
        name="q"
        type="search"
        defaultValue={q ?? ""}
        placeholder={placeholder}
        className={styles.searchInput}
      />
      <select name="status" defaultValue={status ?? ""} className={styles.statusSelect}>
        <option value="">全ステータス</option>
        <option value="active">有効</option>
        <option value="inactive">無効</option>
      </select>
      <button type="submit" className={styles.searchBtn}>
        検索
      </button>
      {(q || status) && (
        <Link href={clearHref} className={`${styles.searchBtn} ${styles.clearLink}`}>
          クリア
        </Link>
      )}
    </form>
  );
}

type MasterListTableShellProps = {
  headers: ReactNode;
  rows: ReactNode;
};

export function MasterListTableShell({ headers, rows }: MasterListTableShellProps) {
  return (
    <table className={styles.table}>
      <thead>
        <tr>{headers}</tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
}

type MasterListEmptyStateProps = {
  hasFilters: boolean;
  filteredMessage: string;
  defaultMessage: string;
};

export function MasterListEmptyState({
  hasFilters,
  filteredMessage,
  defaultMessage,
}: MasterListEmptyStateProps) {
  return (
    <p className={styles.emptyState}>
      {hasFilters ? filteredMessage : defaultMessage}
    </p>
  );
}
