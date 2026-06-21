import type { AnchorHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
  variant?: "solid" | "outline";
}

export function Button({ children, variant = "solid", className = "", ...rest }: ButtonProps) {
  const base = "brutal-btn justify-center px-6 py-3 text-sm";
  const styles =
    variant === "solid"
      ? "bg-[var(--color-sui)] text-[var(--color-ink)]"
      : "bg-transparent text-[var(--color-text)]";
  return (
    <a className={`${base} ${styles} ${className}`} {...rest}>
      {children}
    </a>
  );
}
