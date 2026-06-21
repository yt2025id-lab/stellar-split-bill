"use client";

import { useDict } from "@/lib/i18n/LocaleProvider";
import { useHorizontalScroll } from "@/components/motion/useHorizontalScroll";
import { FeatureArt } from "@/components/graphics/PackArt";
import { GhostWord } from "@/components/ui/GhostWord";
import { SceneDecor } from "@/components/ui/SceneDecor";
import { ScenePanel } from "@/components/ui/ScenePanel";

const ACCENTS = [
  "var(--color-sui)",
  "var(--color-teal)",
  "var(--color-amber)",
  "var(--color-crack)",
  "var(--color-sui)",
];

export function Galeri() {
  const dict = useDict();
  const { sectionRef, trackRef } = useHorizontalScroll<HTMLElement>();

  return (
    <section ref={sectionRef} id="galeri" className="relative overflow-hidden md:h-screen">
      <SceneDecor accent="var(--color-sui)" />
      <GhostWord
        text="STACK"
        stroke="rgba(12,140,233,0.12)"
        className="right-[2%] top-[6%] text-[20vw]"
      />
      <div className="relative z-10 flex flex-col justify-center py-24 md:h-screen md:py-0">
        <div className="mb-10 px-6">
          <ScenePanel accent="var(--color-sui)" className="max-w-2xl">
            <p
              className="brutal-badge mb-4 inline-block px-3 py-1.5 text-xs"
              style={{ background: "var(--color-amber)", color: "var(--color-ink)" }}
            >
              {dict.galeri.kicker}
            </p>
            <h2 className="font-display max-w-3xl text-4xl leading-[1.02] sm:text-6xl">
              {dict.galeri.title}
            </h2>
          </ScenePanel>
        </div>

        <div
          ref={trackRef}
          className="flex w-full flex-col gap-6 px-6 md:w-max md:flex-row md:gap-8"
        >
          {dict.galeri.items.map((item, i) => {
            const accent = ACCENTS[i % ACCENTS.length];
            return (
              <div
                key={item.name}
                className="brutal-card-lg flex w-full shrink-0 flex-col md:w-[400px]"
              >
                <div
                  className="flex items-center justify-between border-b-[4px] px-6 py-5"
                  style={{ background: accent, borderColor: "var(--color-text)" }}
                >
                  <span
                    className="font-display text-3xl"
                    style={{ color: "var(--color-ink)" }}
                  >
                    {item.name}
                  </span>
                  <span
                    className="font-num text-2xl font-bold"
                    style={{ color: "var(--color-ink)" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="flex items-center justify-center px-6 pt-8">
                  <FeatureArt name={item.name} className="h-36 w-36" />
                </div>
                <p className="px-6 pb-6 pt-6 text-base leading-relaxed text-[var(--color-text)]">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
