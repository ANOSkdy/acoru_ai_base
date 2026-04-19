import type { ReactNode } from "react";
import { SidebarNav } from "./SidebarNav";
import styles from "./AppShell.module.css";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <SidebarNav />
      </aside>
      <div className={styles.main}>
        {children}
      </div>
    </div>
  );
}
