import type { CSSProperties, ReactNode } from "react";

/**
 * Brutalist content panel matching the hero's "spec card" language: thick black
 * border, hard offset shadow, accent side-bar, white surface. Wrap a scene's
 * content in this so every scene reads as the same bold neo-brutalist concept.
 */
export function ScenePanel({
  accent = "var(--color-stellar)",
  className = "",
  style,
  children,
}: {
  accent?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div
      className={`relative overflow-hidden border-[4px] border-[var(--color-text)] bg-[var(--color-surface)] brutal-shadow ${className}`}
      style={style}
    >
      <span aria-hidden className="absolute inset-y-0 left-0 w-2.5" style={{ background: accent }} />
      <div className="relative px-6 py-8 sm:px-10 sm:py-12">{children}</div>
    </div>
  );
}
