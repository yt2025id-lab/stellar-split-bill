"use client";

import { useDict } from "@/lib/i18n/LocaleProvider";
import { usePinned } from "@/components/motion/usePinned";
import { ReactiveArt } from "@/components/graphics/ReactiveArt";
import { SpotTempaan } from "@/components/graphics/PackArt";
import { GhostWord } from "@/components/ui/GhostWord";
import { SceneDecor } from "@/components/ui/SceneDecor";
import { ScenePanel } from "@/components/ui/ScenePanel";
import { ramp, revealItem } from "@/lib/reveal";

const START = 50;
const SAFE = 125;
const MILES = [50, 100, 125];

export function Tempaan() {
  const dict = useDict();
  const { ref, progress } = usePinned<HTMLDivElement>({ endVh: 180 });

  // Kicker + title reveal first, then the counter climbs over the rest.
  const cp = ramp(progress, 0.22, 0.92);
  const value = Math.round(START + cp * (SAFE - START));
  const safe = value >= SAFE;
  const accent = safe ? "var(--color-teal)" : "var(--color-crack)";
  const stage = value >= SAFE ? 2 : value >= 100 ? 1 : 0;

  return (
    <section ref={ref} id="tempaan" className="relative min-h-screen overflow-hidden">
      <SceneDecor accent="var(--color-teal)" />
      <GhostWord
        text="SAFE"
        stroke="rgba(10,157,110,0.13)"
        className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[26vw]"
      />
      <ReactiveArt
        parallax={0}
        className="pointer-events-none absolute left-[3%] top-1/2 hidden w-[clamp(180px,18vw,280px)] -translate-y-1/2 opacity-80 lg:block"
      >
        <SpotTempaan />
      </ReactiveArt>
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-24 text-center">
        <ScenePanel accent="var(--color-teal)" className="mx-auto max-w-2xl text-center" style={revealItem(progress, 0.02, 0.18, 0, 36)}>
          <p
            className="brutal-badge mb-4 inline-block px-3 py-1.5 text-xs"
            style={{ background: "var(--color-amber)", color: "var(--color-ink)", ...revealItem(progress, 0, 0.1, 0, 16) }}
          >
            {dict.tempaan.kicker}
          </p>
          <h2
            className="font-display mx-auto max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl"
            style={revealItem(progress, 0.04, 0.2)}
          >
            {dict.tempaan.title}
          </h2>
        </ScenePanel>

        {/* Brutalist scroll-driven gauge (square bar, not a ring) */}
        <div className="my-10 w-full max-w-lg" style={revealItem(progress, 0.12, 0.26, 0, 0)}>
          <div className="flex items-end justify-center">
            <span className="tabular font-num text-7xl font-bold leading-none sm:text-8xl" style={{ color: accent }}>
              {value}%
            </span>
          </div>
          <p className="mt-2 text-center text-sm font-bold uppercase tracking-wide" style={{ color: accent }}>
            {safe ? dict.tempaan.safeLabel : dict.tempaan.fleeLabel}
          </p>

          <div className="relative mt-5 h-11 w-full overflow-hidden border-[4px] border-[var(--color-text)] bg-[var(--color-surface)] brutal-shadow">
            <div className="h-full" style={{ width: `${Math.min(100, (value / SAFE) * 100)}%`, background: accent }} />
            {/* diagonal hazard stripes for texture */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{ backgroundImage: "repeating-linear-gradient(45deg, rgba(10,10,10,0.14) 0 6px, transparent 6px 13px)" }}
              aria-hidden
            />
            {/* milestone ticks */}
            {MILES.map((m) => (
              <div key={m} className="absolute top-0 h-full w-[3px] bg-[var(--color-text)]" style={{ left: `${(m / SAFE) * 100}%` }} aria-hidden />
            ))}
          </div>
          <div className="relative mt-2 h-5">
            {MILES.map((m, i) => (
              <span
                key={m}
                className="tabular absolute -translate-x-1/2 text-xs font-bold transition-colors"
                style={{ left: `${(m / SAFE) * 100}%`, color: i <= stage ? accent : "var(--color-muted)" }}
              >
                {m}%
              </span>
            ))}
          </div>
        </div>

        <p
          className="mx-auto max-w-xl text-base leading-relaxed text-[var(--color-muted)]"
          style={revealItem(progress, 0.1, 0.26)}
        >
          {dict.tempaan.body}
        </p>
        <p
          className="mt-6 text-sm uppercase tracking-wider text-[var(--color-text)]"
          style={revealItem(progress, 0.18, 0.34)}
        >
          {dict.tempaan.formula}
        </p>
      </div>
    </section>
  );
}
