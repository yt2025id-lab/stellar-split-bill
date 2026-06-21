"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";

export function LanguageSwitch() {
  const { locale, toggle } = useLocale();
  return (
    <button
      onClick={toggle}
      aria-label="Switch language"
      data-cursor
      className="brutal-btn bg-[var(--color-surface)] px-3.5 py-2 text-xs text-[var(--color-text)]"
    >
      {locale === "en" ? "ID" : "EN"}
    </button>
  );
}
