"use client";

import { useDict } from "@/lib/i18n/LocaleProvider";
import { LanguageSwitch } from "./LanguageSwitch";
import { Button } from "./Button";
import { SuivanLogo } from "@/components/brand/SuivanLogo";

export const DAPP_URL = "https://split-bill.vercel.app";

export function MiniNav() {
  const dict = useDict();
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-4 sm:px-8">
      <a href="#hero" className="flex items-center gap-3" aria-label="Split Bill home" data-cursor>
        <span className="grid h-10 w-10 place-items-center border-[3px] border-[var(--color-text)] bg-[var(--color-surface)] brutal-shadow">
          <SuivanLogo size={28} priority className="h-7 w-7" />
        </span>
        <span className="flex flex-col items-start leading-none">
          <span className="font-display text-2xl">Split Bill</span>
          <span className="text-[8px] font-semibold uppercase tracking-[0.3em]" style={{ color: "var(--color-muted)" }}>
            Split Protocol
          </span>
        </span>
      </a>
      <div className="flex items-center gap-3">
        <LanguageSwitch />
        <Button href={DAPP_URL} target="_blank" rel="noopener noreferrer" className="px-4 py-2">
          {dict.nav.launch} <span aria-hidden>→</span>
        </Button>
      </div>
    </header>
  );
}
