import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { LOCALES, translations } from "./translations";

const LocaleContext = createContext(null);

export function LocaleProvider({ children }) {
  const [locale, setLocale] = useState(() => {
    const saved = typeof localStorage !== "undefined" && localStorage.getItem("pn:locale");
    return saved && translations[saved] ? saved : "EN";
  });

  useEffect(() => {
    localStorage.setItem("pn:locale", locale);
    document.documentElement.lang = { EN: "en", HI: "hi", MR: "mr" }[locale] ?? "en";
  }, [locale]);

  // t() falls back to English, then to the raw key — never renders "undefined"
  const t = useCallback(
    (key) => translations[locale]?.[key] ?? translations.EN[key] ?? key,
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t, locales: LOCALES }), [locale, t]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside <LocaleProvider>");
  return ctx;
}
