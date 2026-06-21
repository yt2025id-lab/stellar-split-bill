import type { ReactNode } from "react";

interface SectionProps {
  id: string;
  kicker?: string;
  accent?: string;
  children: ReactNode;
}

export function Section({ id, kicker, accent = "var(--color-stellar)", children }: SectionProps) {
  return (
    <section
      id={id}
      className="mx-auto flex min-h-screen max-w-[820px] flex-col justify-center px-6 py-24"
    >
      {kicker && (
        <p
          data-reveal
          className="mb-4 text-xs font-semibold uppercase tracking-[0.25em]"
          style={{ color: accent }}
        >
          {kicker}
        </p>
      )}
      {children}
    </section>
  );
}
