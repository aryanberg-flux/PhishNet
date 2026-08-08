import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Languages, Moon, ShieldAlert, Sun } from "lucide-react";
import { useLocale } from "../i18n/LocaleContext";
import { useTheme } from "../theme/ThemeContext";
import { LiveBadge } from "./ui/Primitives";

function LanguageSelector() {
  const { locale, setLocale, locales, t } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="btn-ghost gap-2"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("language")}
      >
        <Languages size={16} strokeWidth={2.3} />
        <span className="text-ink">{locale}</span>
        <ChevronDown size={15} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul
          role="listbox"
          className="panel cut absolute right-0 z-50 mt-1 w-44 animate-rise border-hair shadow-panel"
        >
          <li className="border-b border-hair px-3 py-2">
            <span className="hud text-dim">{t("language")}</span>
          </li>
          {locales.map((l) => (
            <li key={l.code}>
              <button
                role="option"
                aria-selected={l.code === locale}
                onClick={() => {
                  setLocale(l.code);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left transition-colors hover:bg-hair/50 ${
                  l.code === locale ? "bg-hair/30" : ""
                }`}
              >
                <span className="flex flex-col gap-0.5">
                  <span className="text-base leading-none text-ink">{l.native}</span>
                  <span className="hud text-dim">{l.code}</span>
                </span>
                {l.code === locale && <Check size={16} className="text-safe" strokeWidth={2.6} />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ThemeToggle() {
  const { isDark, toggle } = useTheme();
  const { t } = useLocale();
  return (
    <button
      onClick={toggle}
      className="btn-ghost gap-2"
      aria-label={`${t("theme")}: ${isDark ? t("themeDark") : t("themeLight")}`}
      title={isDark ? t("themeLight") : t("themeDark")}
    >
      {isDark ? <Moon size={16} strokeWidth={2.3} /> : <Sun size={16} strokeWidth={2.3} />}
      <span className="hidden text-ink sm:inline">{isDark ? t("themeDark") : t("themeLight")}</span>
    </button>
  );
}

export default function Header({ scanCount = 0 }) {
  const { t } = useLocale();
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const utc = clock.toISOString().slice(11, 19);

  return (
    <header className="sticky top-0 z-[900] border-b border-hair bg-base/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1560px] items-center gap-3 px-4 py-3 lg:px-6">
        {/* logo */}
        <div className="flex min-w-0 items-center gap-3">
          <span className="relative grid h-10 w-10 shrink-0 place-items-center border border-threat/40 bg-threat/[0.08]">
            <ShieldAlert size={19} className="text-threat" strokeWidth={2.3} />
            <span className="absolute inset-0 animate-flick border border-threat/25" />
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-bold uppercase leading-none tracking-[0.06em] text-ink">
              {t("appTitle")}
              <span className="ml-1.5 align-super font-mono text-2xs font-medium tracking-normal text-threat">
                v2.4
              </span>
            </h1>
            {/* Wraps instead of truncating: at a large root font size the
                tagline would otherwise be clipped to "Threat Detection & In…" */}
            <p className="mt-1 hud text-dim">{t("appSubtitle")}</p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* telemetry cluster — desktop */}
          <div className="mr-1 hidden items-center gap-4 border-r border-hair pr-4 xl:flex">
            <div className="flex flex-col items-end gap-1">
              <span className="hud text-dim">{t("telemetryHeader")}</span>
              <span className="font-mono text-xs tabular-nums leading-none text-dim">
                {utc}Z · {String(scanCount).padStart(3, "0")} {t("scans")}
              </span>
            </div>
          </div>
          <div className="hidden sm:block">
            <LiveBadge label={t("telemetryLive")} />
          </div>
          <LanguageSelector />
          <ThemeToggle />
        </div>
      </div>
      <div className="h-[2px] w-full ticks opacity-60" />
    </header>
  );
}
