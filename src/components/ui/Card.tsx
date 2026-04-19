import type { ReactNode } from "react";
import styles from "./Card.module.css";

type CardProps = {
  title?: string;
  children: ReactNode;
  className?: string;
};

export function Card({ title, children, className }: CardProps) {
  return (
    <div className={`${styles.card} ${className ?? ""}`}>
      {title && <div className={styles.cardTitle}>{title}</div>}
      {children}
    </div>
  );
}
