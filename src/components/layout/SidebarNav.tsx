"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import styles from "./SidebarNav.module.css";

type NavItem = {
  label: string;
  href: string;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

type SidebarNavProps = {
  onNavigate?: () => void;
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: "データ管理",
    items: [
      { label: "ユーザー", href: "/app/master/users" },
      { label: "ロール", href: "/app/master/roles" },
      { label: "組織", href: "/app/master/organizations" },
      { label: "組織ユニット", href: "/app/master/org-units" },
      { label: "取引先", href: "/app/master/clients" },
      { label: "プロジェクト", href: "/app/master/projects" },
      { label: "現場", href: "/app/master/sites" },
      { label: "勤務区分", href: "/app/master/work-categories" },
      { label: "勤怠ポリシー", href: "/app/master/attendance-policies" },
    ],
  },
];

function NavLink({ href, label, onNavigate }: NavItem & { onNavigate?: () => void }) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <li>
      <Link
        href={href}
        className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
        onClick={onNavigate}
      >
        {label}
      </Link>
    </li>
  );
}

function NavGroupSection({ group, onNavigate }: { group: NavGroup; onNavigate?: () => void }) {
  const [open, setOpen] = useState(true);

  return (
    <div className={styles.group}>
      <button
        className={styles.groupLabel}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>{group.label}</span>
        <span className={styles.groupChevron} aria-hidden>
          {open ? "▾" : "▸"}
        </span>
      </button>
      {open && (
        <ul className={styles.groupItems}>
          {group.items.map((item) => (
            <NavLink key={item.href} {...item} onNavigate={onNavigate} />
          ))}
        </ul>
      )}
    </div>
  );
}

export function SidebarNav({ onNavigate }: SidebarNavProps) {
  return (
    <nav className={styles.nav}>
      <div className={styles.brand}>
        <span className={styles.brandName}>Acoru</span>
        <span className={styles.brandSub}>データ管理システム</span>
        <button
          type="button"
          className={styles.closeButton}
          aria-label="メニューを閉じる"
          onClick={onNavigate}
        >
          ✕
        </button>
      </div>

      {NAV_GROUPS.map((group) => (
        <NavGroupSection key={group.label} group={group} onNavigate={onNavigate} />
      ))}
    </nav>
  );
}
