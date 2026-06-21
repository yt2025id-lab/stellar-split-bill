"use client";

import { useDict } from "@/lib/i18n/LocaleProvider";
import { usePinned } from "@/components/motion/usePinned";
import { ReactiveArt } from "@/components/graphics/ReactiveArt";
import { SpotSistem } from "@/components/graphics/PackArt";
import { SceneDecor } from "@/components/ui/SceneDecor";
import { ScenePanel } from "@/components/ui/ScenePanel";
import { ramp, revealItem } from "@/lib/reveal";

export function Sistem() {
  const dict = useDict();
  // Two locked stages: the month-ring centerpiece, then the rule cards.
  const { ref: stageRef, progress: p1 } = usePinned<HTMLDivElement>({ endVh: 150 });
  const { ref: rulesRef, progress: p2 } = usePinned<HTMLDivElement>({ endVh: 220 });

  const steps = dict.sistem.timeline;
  const ringP = ramp(p1, 0.2, 1);
  const active = Math.min(steps.length - 1, Math.floor(ringP * steps.length));

  return (
    <section id="sistem" className="relative overflow-hidden">
      <SceneDecor accent="var(--color-sui)" />
      <span
        className="font-display pointer-events-none absolute -right-10 top-10 select-none text-[24vw] leading-none"
        style={{ color: "transparent", WebkitTextStroke: "2px rgba(12,140,233,0.14)" }}
        aria-hidden
      >
        RULES
      </span>

      {/* Stage 1 - locked: kicker → title → rotating month-ring */}
      <div
        ref={stageRef}
        className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center"
      >
        <ReactiveArt
          parallax={0}
          className="pointer-events-none absolute left-[4%] top-1/2 hidden w-[clamp(180px,18vw,280px)] -translate-y-1/2 opacity-80 lg:block"
        >
          <SpotSistem />
        </ReactiveArt>
        <ScenePanel accent="var(--color-sui)" className="mx-auto max-w-2xl text-center" style={revealItem(p1, 0.02, 0.18, 0, 36)}>
          <p
            className="brutal-badge mb-4 inline-block px-3 py-1.5 text-xs"
            style={{ background: "var(--color-amber)", color: "var(--color-ink)", ...revealItem(p1, 0, 0.12, 0, 16) }}
          >
            {dict.sistem.kicker}
          </p>
          <h2
            className="font-display mx-auto max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl"
            style={revealItem(p1, 0.05, 0.2)}
          >
            {dict.sistem.title}
          </h2>
        </ScenePanel>

        {/* Brutalist scroll-driven stepper (square blocks, not a ring) */}
        <div className="my-8 w-full max-w-md" style={revealItem(p1, 0.1, 0.24, 0, 0)}>
          <div className="border-[4px] border-[var(--color-text)] bg-[var(--color-surface)] px-6 py-7 text-center brutal-shadow">
            <span className="tabular font-num text-6xl font-bold leading-none" style={{ color: "var(--color-sui)" }}>
              {steps[active].day}
            </span>
            <span className="mt-2 block text-sm uppercase tracking-wider text-[var(--color-muted)]">
              {steps[active].label}
            </span>
          </div>
          <div className="mt-4 flex gap-2">
            {steps.map((s, i) => (
              <div
                key={s.day}
                className="h-4 flex-1 border-[3px] border-[var(--color-text)]"
                style={{ background: i <= active ? "var(--color-sui)" : "var(--color-surface)" }}
                aria-hidden
              />
            ))}
          </div>
        </div>

        <div
          className="flex flex-wrap items-center justify-center gap-3"
          style={revealItem(p1, 0.15, 0.3)}
        >
          {steps.map((t, i) => (
            <div
              key={t.day}
              data-testid="timeline-step"
              className="rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-300"
              style={{
                borderColor: i === active ? "var(--color-sui)" : "rgba(10,10,10,0.2)",
                color: i === active ? "var(--color-text)" : "var(--color-muted)",
                opacity: i <= active ? 1 : 0.5,
              }}
            >
              <span className="tabular">{t.day}</span> · <span>{t.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stage 2 - locked: 9 rule cards reveal one by one */}
      <div
        ref={rulesRef}
        className="relative z-10 flex min-h-screen flex-col justify-center px-6 py-24"
      >
        <div className="mx-auto w-full max-w-[1000px]">
          <p
            className="mb-10 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-muted)]"
            style={revealItem(p2, 0, 0.1)}
          >
            {dict.sistem.body}
          </p>
          <ol className="grid gap-4 sm:grid-cols-2">
            {dict.sistem.rules.map((rule, i) => {
              const a = 0.08 + i * 0.085;
              return (
                <li
                  key={i}
                  data-testid="rule"
                  className="brutal-card flex gap-4 p-5 text-sm leading-relaxed"
                  style={revealItem(p2, a, a + 0.2, i % 2 === 0 ? -40 : 40, 30)}
                >
                  <span className="tabular font-num text-xl font-bold" style={{ color: "var(--color-sui)" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[var(--color-muted)]">{rule}</span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
