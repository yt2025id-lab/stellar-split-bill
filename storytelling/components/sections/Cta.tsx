"use client";

import { ArrowUpRight } from "lucide-react";
import { useDict } from "@/lib/i18n/LocaleProvider";
import { useMagnetic } from "@/components/motion/useMagnetic";
import { Button } from "@/components/ui/Button";
import { GhostWord } from "@/components/ui/GhostWord";
import { SplitBillLogo } from "@/components/brand/SplitBillLogo";
import { DAPP_URL } from "@/components/ui/MiniNav";

const EXPLORER_URL =
  "https://stellar.expert/explorer/testnet/contract/CCRVTPOVHJZ7KLANM2AEPIQPLSDWIDK2M66GJQHFEHJVJPHGDCKQOGJ3";

export function Cta() {
  const dict = useDict();
  const f = dict.landing.footer;
  const magnet = useMagnetic<HTMLSpanElement>(0.5);

  return (
    <section
      id="cta"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 py-24 sm:px-8"
    >
      <GhostWord text="JOIN" stroke="rgba(10,157,110,0.1)" className="left-1/2 top-[6%] -translate-x-1/2 text-[24vw]" />

      {/* Decorative blobs */}
      <div aria-hidden className="pointer-events-none absolute -left-20 top-1/4 h-64 w-64 rounded-full bg-[#FFD700]/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-20 bottom-1/3 h-72 w-72 rounded-full bg-[#e0140a]/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute left-1/3 bottom-0 h-48 w-48 rounded-full bg-[#0a9d6e]/10 blur-3xl" />

      {/* Headline + CTA */}
      <div className="relative z-10 flex flex-col items-center text-center">
        <span className="mb-4 inline-block rounded-full border-[2px] border-[#0a0a0a] bg-[#FFD700] px-4 py-1.5 font-mono text-[10px] font-black uppercase tracking-[0.2em] shadow-[3px_3px_0_#0a0a0a]">
          🟠 Orange Belt
        </span>
        <h2 className="font-display max-w-3xl text-5xl font-bold leading-[1.02] tracking-tight sm:text-7xl">
          <span className="bg-gradient-to-r from-[#d98200] via-[#e0140a] to-[#0a9d6e] bg-clip-text text-transparent">
            {dict.cta.title}
          </span>
        </h2>
        <span ref={magnet} className="mt-10 inline-block">
          <Button
            href={DAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl border-[3px] border-[#0a0a0a] bg-gradient-to-r from-[#0a9d6e] to-[#14b8a6] px-10 py-5 text-lg font-bold text-white shadow-[6px_6px_0_#0a0a0a] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_#0a0a0a] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[3px_3px_0_#0a0a0a]"
          >
            {dict.cta.button} <ArrowUpRight className="ml-2 inline size-5" />
          </Button>
        </span>
      </div>

      {/* Footer block */}
      <div className="relative z-10 mt-24 w-full max-w-5xl">
        {/* Top accent strip */}
        <div className="flex h-2 w-full overflow-hidden rounded-t-2xl">
          <div className="flex-1 bg-[#FFD700]" />
          <div className="flex-1 bg-[#d98200]" />
          <div className="flex-1 bg-[#e0140a]" />
          <div className="flex-1 bg-[#0a9d6e]" />
        </div>

        <div className="rounded-b-2xl border-[3px] border-t-0 border-[#0a0a0a] bg-[#faf8f4] p-7 shadow-[6px_6px_0_#0a0a0a] sm:p-10">
          <div className="grid gap-10">
            {/* Brand */}
            <div className="mx-auto max-w-md text-center">
              <div className="mb-3 flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-xl border-[3px] border-[#0a0a0a] bg-gradient-to-br from-[#FFD700] via-[#d98200] to-[#e0140a] shadow-[3px_3px_0_#0a0a0a]">
                  <SplitBillLogo size={30} className="relative z-10 h-7 w-7" />
                </span>
                <div>
                  <span className="font-display block text-xl text-[#0a0a0a]">Split Bill</span>
                  <span className="bg-gradient-to-r from-[#d98200] to-[#e0140a] bg-clip-text font-display text-[10px] uppercase tracking-[0.18em] text-transparent">
                    {f.tagline}
                  </span>
                </div>
              </div>
              <p className="max-w-xs text-sm font-medium leading-7 text-[#5b6470]">{f.blurb}</p>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 flex flex-col gap-3 rounded-xl border-[3px] border-[#0a0a0a] bg-[#0a9d6e]/5 px-5 py-4 text-xs font-semibold text-[#5b6470] md:flex-row md:items-center md:justify-between">
            <span>{f.rights}</span>
            <a
              href="https://stellar.org"
              target="_blank"
              rel="noopener noreferrer"
              data-cursor
              className="inline-flex items-center gap-1.5 rounded-lg border-[2px] border-[#0a9d6e] px-3 py-1.5 font-display text-sm text-[#0a9d6e] transition hover:bg-[#0a9d6e] hover:text-white"
            >
              {f.event}
              <ArrowUpRight className="size-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
