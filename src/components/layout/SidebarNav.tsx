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

const NAV_ITEMS: NavItem[] = [{ label: "ダッシュボード", href: "/app/dashboard" }];

const NAV_GROUPS: NavGroup[] = [
  {
    label: "マスター",
    items: [
      { label: "取引先", href: "/app/master/clients" },
      { label: "プロジェクト", href: "/app/master/projects" },
      { label: "現場", href: "/app/master/sites" },
      { label: "勤務区分", href: "/app/master/work-categories" },
    ],
  },
];

function NavLink({ href, label }: NavItem) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <li>
      <Link
        href={href}
        className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
      >
        {label}
      </Link>
    </li>
  );
}

function NavGroupSection({ group }: { group: NavGroup }) {
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
            <NavLink key={item.href} {...item} />
          ))}
        </ul>
      )}
    </div>
  );
}

export function SidebarNav() {
  return (
    <nav className={styles.nav}>
      <div className={styles.brand}>
        <span className={styles.brandName}>Acoru</span>
        <span className={styles.brandSub}>業務管理</span>
      </div>

      <ul className={styles.topItems}>
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
      </ul>

      <div className={styles.divider} />

      {NAV_GROUPS.map((group) => (
        <NavGroupSection key={group.label} group={group} />
      ))}
    </nav>
  );
}
