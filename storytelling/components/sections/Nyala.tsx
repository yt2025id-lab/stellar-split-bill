"use client";

import { useDict } from "@/lib/i18n/LocaleProvider";
import { usePinned } from "@/components/motion/usePinned";
import { ReactiveArt } from "@/components/graphics/ReactiveArt";
import { SpotNyala } from "@/components/graphics/PackArt";
import { SceneDecor } from "@/components/ui/SceneDecor";
import { ScenePanel } from "@/components/ui/ScenePanel";

export function Nyala() {
  const dict = useDict();
  const { ref, progress } = usePinned<HTMLElement>({ endVh: 170 });

  // Linear 0→1 ramp between two progress points.
  const s = (a: number, b: number) => Math.max(0, Math.min(1, (progress - a) / (b - a)));
  // Eased pop for the merged-yield card.
  const pop = (a: number, b: number) => {
    const t = s(a, b);
    return t * t * (3 - 2 * t); // smoothstep
  };

  const item = (t: number, fromX = 0, fromY = 24) => ({
    opacity: t,
    transform: `translate(${fromX * (1 - t)}px, ${fromY * (1 - t)}px)`,
  });

  return (
    <section ref={ref} id="nyala" className="relative min-h-screen overflow-hidden">
      <SceneDecor accent="var(--color-teal)" />
      <span
        className="font-display pointer-events-none absolute -left-8 top-10 select-none text-[26vw] leading-none"
        style={{ color: "transparent", WebkitTextStroke: "2px rgba(10,157,110,0.15)" }}
        aria-hidden
      >
        YIELD
      </span>
      <ReactiveArt className="pointer-events-none absolute right-[3%] top-[12%] hidden w-[clamp(220px,24vw,340px)] lg:block">
        <SpotNyala />
      </ReactiveArt>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[960px] flex-col justify-center px-6 py-24">
        <ScenePanel accent="var(--color-teal)" style={item(s(0.02, 0.22), 0, 40)}>
          <p
            className="brutal-badge mb-5 inline-block px-3 py-1.5 text-xs"
            style={{ background: "var(--color-amber)", color: "var(--color-ink)", ...item(s(0, 0.12), 0, 16) }}
          >
            {dict.nyala.kicker}
          </p>
          <h2
            className="font-display text-4xl leading-[1.02] sm:text-6xl"
            style={item(s(0.05, 0.25))}
          >
            {dict.nyala.title}
          </h2>
          <p
            className="mt-7 max-w-2xl border-l-[5px] border-[var(--color-teal)] pl-4 text-lg leading-relaxed text-[var(--color-muted)]"
            style={item(s(0.15, 0.35))}
          >
            {dict.nyala.body}
          </p>
        </ScenePanel>

        <div className="mt-14 flex flex-col items-stretch gap-6 sm:flex-row sm:items-center">
          <div className="flex flex-1 flex-col gap-4">
            <div
              className="brutal-card px-6 py-5 text-base font-semibold text-black"
              style={item(s(0.2, 0.34), -60)}
            >
              {dict.nyala.streamCollateral}
            </div>
            <div
              className="brutal-card px-6 py-5 text-base font-semibold text-black"
              style={item(s(0.3, 0.44), -60)}
            >
              {dict.nyala.streamDues}
            </div>
          </div>

          <span
            aria-hidden
            className="font-display self-center rotate-90 text-5xl sm:rotate-0"
            style={{ color: "var(--color-teal)", opacity: s(0.42, 0.5) }}
          >
            →
          </span>

          <div
            className="font-display flex-1 border-[3px] px-6 py-10 text-center text-3xl"
            style={{
              background: "var(--color-teal)",
              color: "var(--color-ink)",
              borderColor: "var(--color-text)",
              boxShadow: "10px 10px 0 var(--color-text)",
              opacity: s(0.48, 0.62),
              transform: `scale(${0.6 + 0.4 * pop(0.48, 0.66)})`,
            }}
          >
            {dict.nyala.streamYield}
          </div>
        </div>
      </div>
    </section>
  );
}
