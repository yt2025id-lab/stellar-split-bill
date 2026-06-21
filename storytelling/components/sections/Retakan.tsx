"use client";

import { useDict } from "@/lib/i18n/LocaleProvider";
import { usePinned } from "@/components/motion/usePinned";
import { ReactiveArt } from "@/components/graphics/ReactiveArt";
import { SpotRetakan } from "@/components/graphics/PackArt";
import { SceneDecor } from "@/components/ui/SceneDecor";
import { ScenePanel } from "@/components/ui/ScenePanel";
import { revealItem } from "@/lib/reveal";

export function Retakan() {
  const dict = useDict();
  const { ref, progress } = usePinned<HTMLElement>({ endVh: 130 });

  return (
    <section ref={ref} id="retakan" className="relative min-h-screen overflow-hidden">
      <SceneDecor accent="var(--color-crack)" />
      <span
        className="font-display pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none text-[30vw] leading-none"
        style={{ color: "transparent", WebkitTextStroke: "2px rgba(232,24,10,0.18)" }}
        aria-hidden
      >
        TRUST
      </span>
      <ReactiveArt className="pointer-events-none absolute right-[4%] top-1/2 hidden w-[clamp(220px,26vw,360px)] -translate-y-1/2 md:block">
        <SpotRetakan />
      </ReactiveArt>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[900px] flex-col justify-center px-6 py-28">
        <ScenePanel accent="var(--color-crack)" style={revealItem(progress, 0.02, 0.2, 0, 40)}>
          <p
            className="brutal-badge mb-5 inline-block px-3 py-1.5 text-xs"
            style={{ background: "var(--color-amber)", color: "var(--color-ink)", ...revealItem(progress, 0, 0.12, 0, 16) }}
          >
            {dict.retakan.kicker}
          </p>
          <h2
            className="font-display text-4xl leading-[1.02] tracking-tight sm:text-6xl"
            style={revealItem(progress, 0.05, 0.28)}
          >
            {dict.retakan.title}
          </h2>
          <p
            className="mt-7 max-w-2xl border-l-[5px] border-[var(--color-crack)] pl-4 text-lg leading-relaxed text-[var(--color-muted)]"
            style={revealItem(progress, 0.38, 0.58)}
          >
            {dict.retakan.body}
          </p>
        </ScenePanel>
      </div>
    </section>
  );
}
