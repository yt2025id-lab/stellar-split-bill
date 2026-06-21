"use client";

import { useDict } from "@/lib/i18n/LocaleProvider";
import { LanguageSwitch } from "./LanguageSwitch";
import { Button } from "./Button";
import { SplitBillLogo } from "@/components/brand/SplitBillLogo";

export const DAPP_URL = "https://split-bill.vercel.app";

export function MiniNav() {
  const dict = useDict();
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-5 py-4 sm:px-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border-[3px] border-[#0a0a0a] bg-[#faf8f4]/95 px-5 py-3 shadow-[6px_6px_0_#0a0a0a] backdrop-blur-md">
        <a href="#hero" className="flex items-center gap-3" aria-label="Split Bill home" data-cursor>
          <span className="relative grid h-11 w-11 place-items-center rounded-xl border-[3px] border-[#0a0a0a] bg-gradient-to-br from-[#FFD700] via-[#d98200] to-[#e0140a] shadow-[3px_3px_0_#0a0a0a]">
            <SplitBillLogo size={26} priority className="relative z-10 h-6 w-6" />
          </span>
          <span className="flex flex-col items-start leading-none">
            <span className="bg-gradient-to-r from-[#d98200] via-[#e0140a] to-[#0a9d6e] bg-clip-text font-display text-2xl text-transparent">
              Split Bill
            </span>
            <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-[#d98200]">
              Stellar Protocol
            </span>
          </span>
        </a>
        <div className="flex items-center gap-3">
          <LanguageSwitch />
          <Button
            href={DAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border-[3px] border-[#0a0a0a] bg-[#0a9d6e] px-5 py-2.5 text-sm font-bold text-white shadow-[4px_4px_0_#0a0a0a] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#0dbb82] hover:shadow-[6px_6px_0_#0a0a0a] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_#0a0a0a]"
          >
            {dict.nav.launch} <span aria-hidden>→</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
