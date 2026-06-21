"use client";

import { useDict } from "@/lib/i18n/LocaleProvider";
import { usePinned } from "@/components/motion/usePinned";
import { ReactiveArt } from "@/components/graphics/ReactiveArt";
import { SpotBukti } from "@/components/graphics/PackArt";
import { GhostWord } from "@/components/ui/GhostWord";
import { SceneDecor } from "@/components/ui/SceneDecor";
import { ScenePanel } from "@/components/ui/ScenePanel";
import { revealItem } from "@/lib/reveal";

const ACCENTS = [
  "var(--color-teal)",
  "var(--color-stellar)",
  "var(--color-amber)",
  "var(--color-crack)",
];

export function Bukti() {
  const dict = useDict();
  const { ref, progress } = usePinned<HTMLElement>({ endVh: 150 });

  return (
    <section ref={ref} id="bukti" className="relative min-h-screen overflow-hidden">
      <SceneDecor accent="var(--color-teal)" />
      <GhostWord
        text="PROOF"
        stroke="rgba(10,157,110,0.13)"
        className="left-[2%] bottom-[6%] text-[20vw]"
      />
      <ReactiveArt className="pointer-events-none absolute right-[4%] top-[14%] hidden w-[clamp(200px,22vw,320px)] md:block">
        <SpotBukti />
      </ReactiveArt>
      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1000px] flex-col justify-center px-6 py-28">
        <ScenePanel accent="var(--color-teal)" className="max-w-2xl" style={revealItem(progress, 0.02, 0.22, 0, 40)}>
          <p
            className="brutal-badge mb-4 inline-block px-3 py-1.5 text-xs"
            style={{ background: "var(--color-amber)", color: "var(--color-ink)", ...revealItem(progress, 0, 0.12, 0, 16) }}
          >
            {dict.bukti.kicker}
          </p>
          <h2
            className="font-display text-4xl leading-[1.02] sm:text-6xl"
            style={revealItem(progress, 0.05, 0.25)}
          >
            {dict.bukti.title}
          </h2>
        </ScenePanel>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {dict.bukti.stats.map((stat, i) => {
            const accent = ACCENTS[i % ACCENTS.length];
            const a = 0.3 + i * 0.13;
            return (
              <div
                key={stat.label}
                className="brutal-card flex flex-col p-6"
                style={revealItem(progress, a, a + 0.2, 0, 36)}
              >
                <span
                  className="font-num text-5xl font-bold leading-none"
                  style={{ color: accent }}
                >
                  {stat.value}
                </span>
                <span className="mt-4 text-sm uppercase leading-snug tracking-wider text-[var(--color-muted)]">
                  {stat.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
