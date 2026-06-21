"use client";

import { useDict } from "@/lib/i18n/LocaleProvider";
import { SplitCircle } from "@/components/graphics/Motifs";
import { GhostWord } from "@/components/ui/GhostWord";
import { SceneDecor } from "@/components/ui/SceneDecor";
import { ScenePanel } from "@/components/ui/ScenePanel";

export function SceneAkar({ active }: { active: boolean }) {
  const dict = useDict();
  return (
    <div
      className={`relative flex h-full w-full items-center justify-center px-6 ${active ? "is-active" : ""}`}
    >
      <SceneDecor accent="var(--color-amber)" />
      {/* Scene background */}
      <div
        className="absolute inset-0 -z-10"
        style={{ background: "radial-gradient(60% 60% at 82% 28%, rgba(255,208,0,0.12), transparent 70%)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-[8%] top-[12%] hidden h-48 w-48 rotate-12 border-[3px] md:block"
        style={{ borderColor: "rgba(217,130,0,0.2)" }}
        aria-hidden
      />
      <GhostWord
        text="ARISAN"
        stroke="rgba(217,130,0,0.13)"
        className="left-[-3%] bottom-[6%] text-[19vw]"
      />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-10 md:grid-cols-[1.05fr_1fr]">
        {/* Left: the big panel only */}
        <ScenePanel accent="var(--color-amber)" className="scene-item rotate-[-0.8deg]" style={{ transitionDelay: "60ms" }}>
          <p
            className="brutal-badge mb-5 inline-block px-3 py-1.5 text-xs"
            style={{ background: "var(--color-amber)", color: "var(--color-ink)" }}
          >
            {dict.akar.kicker}
          </p>
          <h2 className="font-display text-4xl leading-[1.02] sm:text-6xl">
            {dict.akar.title}
          </h2>
          <p className="mt-6 max-w-xl border-l-[5px] border-[var(--color-amber)] pl-4 text-lg leading-relaxed text-[var(--color-muted)]">
            {dict.akar.body}
          </p>
        </ScenePanel>

        {/* Right: the circle + the four boxes, scattered beside the panel */}
        <div className="flex flex-col items-center gap-7">
          <div className="scene-item hidden md:block" style={{ transitionDelay: "320ms" }}>
            <SplitCircle className="spin-slow w-[clamp(180px,20vw,260px)]" color="var(--color-text)" />
          </div>
          <div
            className="scene-item brutal-card inline-flex w-fit rotate-[2.5deg] items-end gap-4 px-7 py-5"
            style={{ transitionDelay: "400ms" }}
          >
            <span
              className="tabular font-num text-5xl font-bold sm:text-6xl"
              style={{ color: "var(--color-amber)" }}
            >
              {dict.akar.statValue}
            </span>
            <span className="mb-2 max-w-[14ch] text-sm uppercase tracking-wider text-[var(--color-muted)]">
              {dict.akar.statLabel}
            </span>
          </div>
          <div className="scene-item flex flex-wrap justify-center gap-3" style={{ transitionDelay: "520ms" }}>
            {dict.akar.facts.map((f, i) => (
              <span
                key={f}
                className="brutal-badge bg-[var(--color-surface)] px-4 py-2 text-xs text-[var(--color-text)]"
                style={{ transform: `rotate(${[-3, 2, -1][i % 3]}deg)`, marginTop: `${[12, 0, 8][i % 3]}px` }}
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
