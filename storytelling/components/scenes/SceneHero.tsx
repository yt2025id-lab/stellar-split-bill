"use client";

import Image from "next/image";
import { Zap, ArrowDown, Check } from "lucide-react";
import { useDict } from "@/lib/i18n/LocaleProvider";
import { DAPP_URL } from "@/components/ui/MiniNav";
import { SuivanLogo } from "@/components/brand/SuivanLogo";

const DOT = ["var(--color-sui)", "var(--color-amber)", "var(--color-teal)", "var(--color-sui)"];

export function SceneHero({ active }: { active: boolean }) {
  const dict = useDict();
  const h = dict.hero;
  const ticker = [...h.ticker, ...h.ticker];

  return (
    <div
      id="hero"
      className={`relative flex h-full w-full items-center justify-center overflow-hidden px-5 sm:px-8 ${active ? "is-active" : ""}`}
    >
      {/* Grid backdrop */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(10,10,10,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(10,10,10,0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
        aria-hidden
      />

      {/* Idle-drifting brutalist blocks (always moving + cross-fades with the scene) */}
      <div className="drift pointer-events-none absolute left-[6%] top-[22%] hidden h-12 w-12 border-[3px] border-[var(--color-sui)] bg-[var(--color-sui)] lg:block" style={{ animationDelay: "0s" }} aria-hidden />
      <div className="drift pointer-events-none absolute left-[44%] top-[12%] hidden h-8 w-8 rotate-45 border-[3px] border-[var(--color-amber)] bg-[var(--color-amber)] lg:block" style={{ animationDelay: "-3s" }} aria-hidden />
      <div className="drift pointer-events-none absolute bottom-[20%] left-[40%] hidden h-10 w-10 border-[3px] border-[var(--color-teal)] lg:block" style={{ animationDelay: "-6s" }} aria-hidden />

      {/* Floating 3D Split Bill art behind the card */}
      <div className="float-y pointer-events-none absolute right-[2%] top-[14%] -z-10 hidden w-[clamp(220px,22vw,360px)] opacity-20 lg:block" aria-hidden>
        <Image src="/stellar-logo.png" alt="" width={360} height={360} className="h-auto w-full object-contain" />
      </div>

      <div className="grid w-full max-w-5xl grid-cols-1 items-center gap-10 pt-24 pb-16 lg:grid-cols-[1.05fr_0.95fr]">
        {/* ── Left: copy ── */}
        <div>
          <p
            className="scene-item brutal-badge inline-flex items-center gap-2 px-3 py-1.5 text-[10px]"
            style={{ background: "var(--color-amber)", color: "var(--color-ink)", transitionDelay: "0ms" }}
          >
            <span className="inline-block h-2 w-2 rounded-full bg-[var(--color-ink)]" />
            {h.badge}
          </p>

          <h1 className="font-display mt-5 leading-[0.82]">
            <span className="scene-item block text-[13vw] sm:text-[5.5rem] lg:text-[7.5rem]" style={{ transitionDelay: "120ms" }}>
              {h.titleLine1}
            </span>
            <span
              className="scene-item block text-[13vw] sm:text-[5.5rem] lg:text-[7.5rem]"
              style={{ color: "var(--color-sui)", transitionDelay: "200ms" }}
            >
              {h.titleLine2}
            </span>
            <span className="scene-item mt-1 flex items-center gap-3 text-[9vw] sm:text-[3.5rem]" style={{ transitionDelay: "280ms" }}>
              <span>{h.titleLead}</span>
              <span className="inline-block border-[3px] border-[var(--color-text)] bg-[var(--color-text)] px-3 py-0.5 text-[var(--color-sui)] brutal-shadow">
                Sui
              </span>
            </span>
          </h1>

          <div className="scene-item mt-6 max-w-md border-l-[5px] border-[var(--color-sui)] pl-4" style={{ transitionDelay: "360ms" }}>
            <p className="text-base text-[var(--color-text)]">{h.lead}</p>
            <p className="mt-1 text-base font-bold text-[var(--color-text)]">{h.leadStrong}</p>
          </div>

          <p className="scene-item mt-4 text-sm font-semibold text-[var(--color-muted)]" style={{ transitionDelay: "420ms" }}>
            {h.features}
          </p>

          <div className="scene-item mt-7 flex flex-wrap gap-4" style={{ transitionDelay: "500ms" }}>
            <a
              href={DAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor
              className="brutal-btn bg-[var(--color-surface)] px-6 py-3 text-sm text-[var(--color-text)]"
            >
              <Zap className="h-4 w-4 text-[var(--color-amber)]" strokeWidth={3} />
              {h.ctaPrimary}
            </a>
            <a href="#sistem" data-cursor className="brutal-btn bg-[var(--color-base)] px-6 py-3 text-sm text-[var(--color-text)]">
              {h.ctaSecondary}
            </a>
          </div>
        </div>

        {/* ── Right: protocol card + stats ── */}
        <div className="flex flex-col gap-3">
          <div
            className="scene-item relative border-[4px] border-[var(--color-text)] bg-[var(--color-surface)] p-5 brutal-shadow"
            style={{ transitionDelay: "240ms" }}
          >
            <span className="absolute -top-3 right-5 border-[3px] border-[var(--color-text)] bg-[var(--color-sui)] px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-ink)]">
              {h.builtOn}
            </span>
            <p className="mb-3 text-center text-[10px] font-black uppercase tracking-[0.28em] text-[var(--color-muted)]">
              {h.cardTitle}
            </p>

            {/* Protocol emblem - logo only, with a continuously spinning ring */}
            <div className="relative mx-auto flex aspect-square w-full max-w-[230px] items-center justify-center">
              <svg className="spin-slow absolute inset-0 h-full w-full" viewBox="0 0 100 100" aria-hidden>
                <circle cx="50" cy="50" r="47" fill="none" stroke="var(--color-text)" strokeWidth="1.5" strokeDasharray="6 5" />
              </svg>
              <div className="flex aspect-square w-[88%] items-center justify-center rounded-full border-[4px] border-[var(--color-text)] bg-[var(--color-sui)]">
                <span className="grid h-[80%] w-[80%] place-items-center rounded-full bg-[var(--color-surface)]">
                  <SuivanLogo size={170} className="h-[88%] w-[88%]" />
                </span>
              </div>
            </div>

            <span className="brutal-badge absolute -bottom-3 right-6 inline-flex items-center gap-1 bg-[var(--color-amber)] px-2 py-1 text-[10px] text-[var(--color-ink)]">
              {h.live} <Check className="h-3 w-3" strokeWidth={4} />
            </span>
          </div>

          <div className="scene-item grid grid-cols-2 gap-3" style={{ transitionDelay: "360ms" }}>
            <div className="border-[3px] border-[var(--color-text)] bg-[var(--color-surface)] p-3 brutal-shadow">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-muted)]">{h.stats[0].label}</p>
              <p className="font-display text-2xl" style={{ color: "var(--color-sui)" }}>{h.stats[0].value}</p>
            </div>
            <div className="border-[3px] border-[var(--color-text)] bg-[var(--color-surface)] p-3 brutal-shadow">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-muted)]">{h.stats[1].label}</p>
              <p className="font-display text-2xl" style={{ color: "var(--color-crack)" }}>{h.stats[1].value}</p>
            </div>
          </div>

          <div className="scene-item border-[3px] border-[var(--color-text)] bg-[var(--color-text)] p-3 brutal-shadow" style={{ transitionDelay: "440ms" }}>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-muted)]">{h.stats[2].label}</p>
            <p className="text-sm font-black uppercase tracking-wide text-[var(--color-surface)]">
              <span style={{ color: "var(--color-sui)" }}>100%</span> {h.stats[2].value.replace("100% ", "")}
            </p>
          </div>
        </div>
      </div>

      {/* ── Bottom feature ticker - continuous marquee ── */}
      <div className="absolute inset-x-0 bottom-0 overflow-hidden border-t-[3px] border-[var(--color-text)] bg-[var(--color-text)] py-3">
        <div className="marquee-x flex w-max items-center gap-10 whitespace-nowrap">
          {ticker.map((item, i) => (
            <span key={i} className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[var(--color-surface)]">
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: DOT[i % DOT.length] }} />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── Scroll cue ── */}
      <div className="absolute bottom-14 left-1/2 hidden -translate-x-1/2 sm:block">
        <div className="flex h-10 w-10 items-center justify-center border-[3px] border-[var(--color-text)] bg-[var(--color-surface)] brutal-shadow">
          <ArrowDown className="h-5 w-5 animate-bounce text-[var(--color-text)]" strokeWidth={3} />
        </div>
      </div>
    </div>
  );
}
