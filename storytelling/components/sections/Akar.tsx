"use client";

import { useDict } from "@/lib/i18n/LocaleProvider";
import { useBoldReveal } from "@/components/motion/useBoldReveal";
import { ReactiveArt } from "@/components/graphics/ReactiveArt";
import { SpotAkar } from "@/components/graphics/PackArt";

export function Akar() {
  const dict = useDict();
  const ref = useBoldReveal();

  return (
    <section ref={ref} id="akar" className="relative overflow-hidden">
      <ReactiveArt className="pointer-events-none absolute right-[3%] top-1/2 hidden w-[clamp(240px,28vw,380px)] -translate-y-1/2 md:block">
        <SpotAkar />
      </ReactiveArt>
      <span
        data-parallax="120"
        className="font-display pointer-events-none absolute -right-10 top-6 select-none text-[26vw] leading-none"
        style={{ color: "transparent", WebkitTextStroke: "2px rgba(255,208,0,0.14)" }}
        aria-hidden
      >
        ARISAN
      </span>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[900px] flex-col justify-center px-6 py-28">
        <p
          data-reveal
          className="mb-5 text-xs font-semibold uppercase tracking-[0.3em]"
          style={{ color: "var(--color-amber)" }}
        >
          {dict.akar.kicker}
        </p>
        <h2
          data-split
          className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl"
        >
          {dict.akar.title}
        </h2>
        <p
          data-reveal
          className="mt-8 max-w-2xl text-lg leading-relaxed text-[var(--color-muted)]"
        >
          {dict.akar.body}
        </p>

        <div
          data-card
          className="brutal-card mt-12 inline-flex w-fit items-end gap-4 px-8 py-6"
        >
          <span
            className="tabular font-num text-6xl font-bold sm:text-7xl"
            style={{ color: "var(--color-amber)" }}
          >
            {dict.akar.statValue}
          </span>
          <span className="mb-2 max-w-[14ch] text-sm uppercase tracking-wider text-[var(--color-muted)]">
            {dict.akar.statLabel}
          </span>
        </div>
      </div>
    </section>
  );
}
