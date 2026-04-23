"use client";

import type { ReactNode } from "react";
import { useEffect, useId, useState } from "react";
import { SidebarNav } from "./SidebarNav";
import styles from "./AppShell.module.css";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const sidebarId = useId();

  useEffect(() => {
    if (!mobileNavOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileNavOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  return (
    <div className={styles.shell}>
      <button
        type="button"
        className={`${styles.backdrop} ${mobileNavOpen ? styles.backdropVisible : ""}`}
        aria-label="メニューを閉じる"
        aria-hidden={!mobileNavOpen}
        tabIndex={mobileNavOpen ? 0 : -1}
        onClick={() => setMobileNavOpen(false)}
      />

      <aside
        id={sidebarId}
        className={`${styles.sidebar} ${mobileNavOpen ? styles.sidebarMobileOpen : ""}`}
      >
        <SidebarNav onNavigate={() => setMobileNavOpen(false)} />
      </aside>

      <div className={styles.main}>
        <div className={styles.mobileHeader}>
          <button
            type="button"
            className={styles.mobileMenuButton}
            aria-label="メニューを開く"
            aria-controls={sidebarId}
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen(true)}
          >
            ☰ メニュー
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
