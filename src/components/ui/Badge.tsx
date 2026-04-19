import styles from "./Badge.module.css";

type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral";

type BadgeProps = {
  variant?: BadgeVariant;
  children: string;
};

export function Badge({ variant = "neutral", children }: BadgeProps) {
  const variantClass = styles[variant];
  return (
    <span className={`${styles.badge} ${variantClass}`}>{children}</span>
  );
}
