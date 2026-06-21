"use client";

import { Zap, ArrowDown, Check, Users, Receipt, Wallet } from "lucide-react";
import { useDict } from "@/lib/i18n/LocaleProvider";
import { DAPP_URL } from "@/components/ui/MiniNav";
import { SplitBillLogo } from "@/components/brand/SplitBillLogo";

const COLORS = ["var(--color-stellar)", "var(--color-amber)", "var(--color-teal)", "var(--color-crack)"];

export function SceneHero({ active }: { active: boolean }) {
  const dict = useDict();
  const h = dict.hero;

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
            "linear-gradient(to right, rgba(10,10,10,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(10,10,10,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        aria-hidden
      />

      {/* Decorative blobs */}
      <div aria-hidden className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-[var(--color-stellar)]/8 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-[#FFD700]/10 blur-3xl" />

      {/* Floating blocks */}
      <div className="drift pointer-events-none absolute left-[8%] top-[20%] hidden h-14 w-14 rounded-xl border-[3px] border-[var(--color-text)] bg-[var(--color-stellar)] shadow-[4px_4px_0_#0a0a0a] lg:block" style={{ animationDelay: "0s" }} aria-hidden />
      <div className="drift pointer-events-none absolute right-[12%] top-[18%] hidden h-10 w-10 rotate-12 rounded-lg border-[3px] border-[var(--color-text)] bg-[#FFD700] shadow-[3px_3px_0_#0a0a0a] lg:block" style={{ animationDelay: "-2s" }} aria-hidden />
      <div className="drift pointer-events-none absolute bottom-[25%] left-[15%] hidden h-8 w-8 -rotate-12 rounded-lg border-[3px] border-[var(--color-text)] bg-[#0a9d6e] shadow-[3px_3px_0_#0a0a0a] lg:block" style={{ animationDelay: "-5s" }} aria-hidden />

      <div className="grid w-full max-w-6xl grid-cols-1 items-center gap-12 pt-24 pb-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        {/* ── Left: headline + story ── */}
        <div>
          {/* Badge */}
          <p
            className="scene-item inline-flex items-center gap-2 rounded-full border-[2px] border-[#0a0a0a] bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.15em] shadow-[3px_3px_0_#0a0a0a]"
            style={{ transitionDelay: "0ms" }}
          >
            <span className="flex h-2 w-2 animate-pulse rounded-full bg-[#0a9d6e]" />
            {h.badge}
          </p>

          {/* Main headline */}
          <h1 className="font-display mt-6 leading-[0.88]">
            <span className="scene-item block text-[15vw] sm:text-[7rem] lg:text-[8.5rem]" style={{ transitionDelay: "100ms" }}>
              {h.titleLine1}
            </span>
            <span className="scene-item block text-[15vw] sm:text-[7rem] lg:text-[8.5rem]" style={{ color: "var(--color-stellar)", transitionDelay: "180ms" }}>
              {h.titleLine2}
            </span>
            <span className="scene-item mt-2 flex flex-wrap items-center gap-3 text-[8vw] sm:text-[3rem] lg:text-[3.5rem]" style={{ transitionDelay: "260ms" }}>
              {h.titleLead}
              <span className="inline-block rounded-lg border-[3px] border-[#0a0a0a] bg-[#0a0a0a] px-4 py-1 text-[var(--color-stellar)] shadow-[4px_4px_0_#0a0a0a]">
                Stellar
              </span>
            </span>
          </h1>

          {/* Story line */}
          <div className="scene-item mt-7 max-w-lg" style={{ transitionDelay: "340ms" }}>
            <div className="rounded-xl border-[3px] border-[#0a0a0a] bg-gradient-to-r from-[#faf8f4] to-[#fff7ed] p-5 shadow-[4px_4px_0_#0a0a0a]">
              <p className="flex items-start gap-2 text-sm font-semibold leading-relaxed text-[#5b6470]">
                <span className="mt-0.5 shrink-0 text-lg">💬</span>
                <span>&ldquo;Bro, nanti gue transfer ya&rdquo; — 2 hari kemudian masih belum. Split Bill ubah janji lisan jadi <strong>kontrak on-chain yang nggak bisa diingkari.</strong></span>
              </p>
            </div>
          </div>

          {/* Features pills */}
          <div className="scene-item mt-5 flex flex-wrap gap-2" style={{ transitionDelay: "400ms" }}>
            {[
              { icon: <Receipt className="size-3.5" />, label: "Even Splits", bg: "#FFD700" },
              { icon: <Wallet className="size-3.5" />, label: "On-Chain Settlement", bg: "#0a9d6e" },
              { icon: <Users className="size-3.5" />, label: "Friend Invites", bg: "var(--color-stellar)" },
            ].map((f, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 rounded-full border-[2px] border-[#0a0a0a] px-3 py-1.5 text-[11px] font-bold shadow-[2px_2px_0_#0a0a0a]" style={{ background: f.bg }}>
                {f.icon} {f.label}
              </span>
            ))}
          </div>

          {/* CTAs */}
          <div className="scene-item mt-8 flex flex-wrap gap-4" style={{ transitionDelay: "480ms" }}>
            <a
              href={DAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor
              className="inline-flex items-center gap-2 rounded-xl border-[3px] border-[#0a0a0a] bg-[#0a9d6e] px-8 py-4 text-base font-black uppercase tracking-wider text-white shadow-[5px_5px_0_#0a0a0a] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#0ebd86] hover:shadow-[7px_7px_0_#0a0a0a] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_#0a0a0a]"
            >
              <Zap className="h-5 w-5 fill-white" strokeWidth={0} />
              {h.ctaPrimary}
            </a>
            <a
              href="#sistem"
              data-cursor
              className="inline-flex items-center gap-2 rounded-xl border-[3px] border-[#0a0a0a] bg-white px-8 py-4 text-base font-black uppercase tracking-wider text-[#0a0a0a] shadow-[5px_5px_0_#0a0a0a] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0_#0a0a0a] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_#0a0a0a]"
            >
              {h.ctaSecondary}
            </a>
          </div>
        </div>

        {/* ── Right: visual card ── */}
        <div className="flex flex-col gap-4">
          {/* Protocol card */}
          <div
            className="scene-item relative rounded-2xl border-[4px] border-[#0a0a0a] bg-white p-6 shadow-[8px_8px_0_#0a0a0a]"
            style={{ transitionDelay: "200ms" }}
          >
            <span className="absolute -top-3.5 right-6 rounded-full border-[3px] border-[#0a0a0a] bg-[var(--color-stellar)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-white shadow-[3px_3px_0_#0a0a0a]">
              {h.builtOn}
            </span>

            {/* Logo ring */}
            <div className="relative mx-auto mb-4 flex aspect-square w-full max-w-[180px] items-center justify-center">
              <svg className="spin-slow absolute inset-0 h-full w-full" viewBox="0 0 100 100" aria-hidden>
                <circle cx="50" cy="50" r="45" fill="none" stroke="var(--color-text)" strokeWidth="2" strokeDasharray="8 6" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="var(--color-stellar)" strokeWidth="1" strokeDasharray="4 8" opacity="0.4" />
              </svg>
              <div className="flex aspect-square w-[78%] items-center justify-center rounded-full border-[4px] border-[#0a0a0a] bg-[var(--color-stellar)] shadow-[4px_4px_0_#0a0a0a]">
                <span className="grid h-[75%] w-[75%] place-items-center rounded-full bg-white">
                  <SplitBillLogo size={120} className="h-[82%] w-[82%]" />
                </span>
              </div>
            </div>

            <p className="text-center font-mono text-[10px] font-black uppercase tracking-[0.25em] text-[#5b6470]">
              {h.cardTitle}
            </p>
          </div>

          {/* Stats grid */}
          <div className="scene-item grid grid-cols-3 gap-3" style={{ transitionDelay: "320ms" }}>
            {[
              { value: "Instant", label: "Settlement", color: "var(--color-stellar)" },
              { value: "Zero", label: "Disputes", color: "#0a9d6e" },
              { value: "Even", label: "Splits", color: "#FFD700" },
            ].map((s, i) => (
              <div key={i} className="rounded-xl border-[3px] border-[#0a0a0a] bg-white p-3 text-center shadow-[4px_4px_0_#0a0a0a]">
                <p className="font-display text-2xl" style={{ color: s.color }}>{s.value}</p>
                <p className="mt-0.5 text-[9px] font-black uppercase tracking-[0.15em] text-[#5b6470]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom ticker */}
      <div className="absolute inset-x-0 bottom-14 overflow-hidden border-y-[3px] border-[#0a0a0a] bg-[#0a0a0a] py-3 sm:bottom-0">
        <div className="marquee-x flex w-max items-center gap-10 whitespace-nowrap">
          {[...h.ticker, ...h.ticker].map((item, i) => (
            <span key={i} className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.15em] text-white">
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Scroll cue */}
      <div className="pointer-events-none absolute bottom-5 left-1/2 hidden -translate-x-1/2 sm:block">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border-[3px] border-[#0a0a0a] bg-white shadow-[4px_4px_0_#0a0a0a]">
          <ArrowDown className="h-6 w-6 animate-bounce text-[#0a0a0a]" strokeWidth={3} />
        </div>
      </div>
    </div>
  );
}
