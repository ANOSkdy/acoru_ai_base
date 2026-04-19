import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  children,
  className,
  ...props
}: ButtonProps) {
  const variantClass =
    variant === "primary"
      ? styles.primary
      : variant === "secondary"
        ? styles.secondary
        : styles.ghost;

  return (
    <button
      className={`${styles.button} ${variantClass} ${className ?? ""}`}
      {...props}
    >
      {children}
    </button>
  );
}
