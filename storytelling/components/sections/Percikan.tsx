"use client";

import { useDict } from "@/lib/i18n/LocaleProvider";
import { useBoldReveal } from "@/components/motion/useBoldReveal";
import { Spark } from "@/components/graphics/Motifs";

export function Percikan() {
  const dict = useDict();
  const ref = useBoldReveal();

  return (
    <section ref={ref} id="percikan" className="relative overflow-hidden">
      <Spark
        className="pointer-events-none absolute right-[8%] top-1/2 hidden w-[clamp(180px,20vw,280px)] -translate-y-1/2 md:block"
        color="var(--color-amber)"
      />
      {/* Brutalist spark block */}
      <div
        data-float
        className="pointer-events-none absolute left-1/2 top-24 h-16 w-16 -translate-x-1/2 rotate-45 border-[3px]"
        style={{ background: "var(--color-amber)", borderColor: "var(--color-text)" }}
        aria-hidden
      />
      <span
        data-parallax="90"
        className="font-display pointer-events-none absolute -left-6 bottom-6 select-none text-[22vw] leading-none"
        style={{ color: "transparent", WebkitTextStroke: "2px rgba(245,240,235,0.07)" }}
        aria-hidden
      >
        ON-CHAIN
      </span>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[820px] flex-col justify-center px-6 py-28">
        <p
          data-reveal
          className="mb-5 text-xs font-semibold uppercase tracking-[0.3em]"
          style={{ color: "var(--color-amber)" }}
        >
          {dict.percikan.kicker}
        </p>
        <h2
          data-split
          className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl"
        >
          {dict.percikan.title}
        </h2>
        <p
          data-reveal
          className="mt-8 max-w-2xl text-lg leading-relaxed text-[var(--color-muted)]"
        >
          {dict.percikan.body}
        </p>
      </div>
    </section>
  );
}
