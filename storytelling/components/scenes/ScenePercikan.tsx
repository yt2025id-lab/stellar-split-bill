"use client";

import { useDict } from "@/lib/i18n/LocaleProvider";
import { Spark } from "@/components/graphics/Motifs";
import { GhostWord } from "@/components/ui/GhostWord";
import { SceneDecor } from "@/components/ui/SceneDecor";
import { ScenePanel } from "@/components/ui/ScenePanel";

export function ScenePercikan({ active }: { active: boolean }) {
  const dict = useDict();
  return (
    <div
      className={`relative flex h-full w-full items-center justify-center px-6 ${active ? "is-active" : ""}`}
    >
      <SceneDecor accent="var(--color-amber)" />
      {/* Scene background */}
      <div
        className="absolute inset-0 -z-10"
        style={{ background: "radial-gradient(60% 60% at 22% 30%, rgba(217,130,0,0.12), transparent 70%)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-[10%] bottom-[16%] hidden h-40 w-40 rotate-45 border-[3px] md:block"
        style={{ borderColor: "rgba(217,130,0,0.2)" }}
        aria-hidden
      />
      <GhostWord
        text="SPARK"
        stroke="rgba(217,130,0,0.13)"
        className="right-[1%] bottom-[8%] text-[19vw]"
      />

      <div className="relative z-10 mx-auto grid w-full max-w-5xl items-center gap-10 md:grid-cols-[1.4fr_1fr]">
        <div>
          <ScenePanel accent="var(--color-amber)" className="scene-item rotate-[0.8deg]" style={{ transitionDelay: "60ms" }}>
            <p
              className="brutal-badge mb-5 inline-block px-3 py-1.5 text-xs"
              style={{ background: "var(--color-amber)", color: "var(--color-ink)" }}
            >
              {dict.percikan.kicker}
            </p>
            <h2 className="font-display text-4xl leading-[1.02] sm:text-6xl">
              {dict.percikan.title}
            </h2>
            <p className="mt-6 max-w-xl border-l-[5px] border-[var(--color-amber)] pl-4 text-lg leading-relaxed text-[var(--color-muted)]">
              {dict.percikan.body}
            </p>
          </ScenePanel>
          <div className="scene-item mt-7 flex flex-wrap items-start gap-4" style={{ transitionDelay: "320ms" }}>
            {dict.percikan.points.map((p, i) => {
              const c = ["var(--color-stellar)", "var(--color-teal)", "var(--color-amber)"][i % 3];
              const tilt = [-4, 3, -2][i % 3];
              const lift = [22, 0, 12][i % 3];
              return (
                <div
                  key={p}
                  className="w-[120px] border-[3px] border-[var(--color-text)] bg-[var(--color-surface)] px-3 py-4 text-center brutal-shadow"
                  style={{ transform: `rotate(${tilt}deg)`, marginTop: `${lift}px` }}
                >
                  <span className="font-display block text-2xl leading-none" style={{ color: c }}>0{i + 1}</span>
                  <span className="mt-1 block text-xs font-bold uppercase tracking-wide text-[var(--color-text)]">{p}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div
          className="scene-item relative mx-auto hidden md:block"
          style={{ transitionDelay: "340ms" }}
        >
          <div
            className="spark-glow pointer-events-none absolute left-1/2 top-1/2 h-44 w-44 rounded-full blur-2xl"
            style={{ background: "var(--color-amber)" }}
            aria-hidden
          />
          <Spark className="spark-anim relative w-[clamp(160px,18vw,240px)]" color="var(--color-amber)" />
          <span
            className="float-y absolute right-0 top-3 h-3 w-3 rounded-full border-2 border-[var(--color-text)]"
            style={{ background: "var(--color-stellar)" }}
            aria-hidden
          />
          <span
            className="float-y absolute -left-2 bottom-8 h-2.5 w-2.5 rounded-full border-2 border-[var(--color-text)]"
            style={{ background: "var(--color-teal)", animationDelay: "0.9s" }}
            aria-hidden
          />
        </div>
      </div>
    </div>
  );
}
