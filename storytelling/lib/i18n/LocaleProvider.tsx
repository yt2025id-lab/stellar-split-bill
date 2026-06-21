"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Dict, Locale } from "./types";
import { dictionaries } from "./dictionaries";

interface LocaleContextValue {
  locale: Locale;
  dict: Dict;
  setLocale: (l: Locale) => void;
  toggle: () => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      dict: dictionaries[locale],
      setLocale,
      toggle: () => setLocale((l) => (l === "en" ? "id" : "en")),
    }),
    [locale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}

export function useDict(): Dict {
  return useLocale().dict;
}
