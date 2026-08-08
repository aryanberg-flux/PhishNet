import { useCallback, useRef, useState } from "react";
import { ShieldAlert } from "lucide-react";
import "leaflet/dist/leaflet.css";

import Header from "./components/Header";
import Scanner from "./components/Scanner";
import AnalysisCard from "./components/AnalysisCard";
import IndiaHeatmap from "./components/IndiaHeatmap";
import SessionHistory from "./components/SessionHistory";
import TrendingScams from "./components/TrendingScams";
import DnaPanel from "./components/DnaPanel";
import ReportPanel from "./components/ReportPanel";
import { LocaleProvider, useLocale } from "./i18n/LocaleContext";
import { ThemeProvider } from "./theme/ThemeContext";
import { analyze } from "./lib/detect";

function Marquee() {
  const { t } = useLocale();
  const items = [
    t("telemetryLive"),
    "OTP · CVV · UPI PIN — NEVER SHARE",
    "cybercrime.gov.in · 1930",
    t("appSubtitle"),
    "APK SIDELOAD = MALWARE",
  ];
  const strip = [...items, ...items];
  return (
    <div className="relative overflow-hidden border-b border-hair bg-panel2/40">
      <div className="flex w-max animate-marquee gap-8 py-1.5">
        {strip.map((s, i) => (
          <span key={i} className="flex shrink-0 items-center gap-8 hud text-dim">
            {s}
            <span className="text-threat/60">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Dashboard() {
  const { t } = useLocale();
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [dnaOpen, setDnaOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const timer = useRef(null);

  /** Mock neural pipeline: evaluate → score → flag highRisk → log to history. */
  const handleScan = useCallback(({ text, file, type }) => {
    setScanning(true);
    setResult(null);
    clearTimeout(timer.current);

    // simulated inference latency
    timer.current = setTimeout(() => {
      const r = analyze({ text, file, type });
      setResult(r);
      setHistory((h) =>
        [
          { id: r.id, subject: r.subject, kind: r.kind, score: r.score, verdict: r.verdict, at: r.at, full: r },
          ...h,
        ].slice(0, 40),
      );
      setScanning(false);
    }, 1150);
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* atmosphere */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 grid-bg" />
        <div
          className="absolute -left-1/4 -top-1/3 h-[70vh] w-[70vw]"
          style={{ background: "radial-gradient(circle, rgb(var(--c-threat)/.09), transparent 62%)" }}
        />
        <div
          className="absolute -right-1/4 top-1/4 h-[60vh] w-[60vw]"
          style={{ background: "radial-gradient(circle, rgb(var(--c-beam)/.08), transparent 62%)" }}
        />
        <div className="absolute inset-0 noise opacity-[0.028] mix-blend-overlay" />
      </div>

      <Header scanCount={history.length} />
      <Marquee />

      <main className="mx-auto max-w-[1560px] px-4 py-5 lg:px-6 lg:py-7">
        {/* Breakpoints are deliberately late: at the larger type scale (and
            under browser zoom) columns must collapse before text is crushed. */}
        <div className="grid grid-cols-1 gap-5 min-[94em]:grid-cols-[minmax(0,1fr)_400px]">
          {/* ---------- primary column ---------- */}
          <div className="min-w-0 space-y-5">
            <div className="grid grid-cols-1 gap-5 min-[72em]:grid-cols-2">
              <Scanner
                onScan={handleScan}
                scanning={scanning}
                hasResult={!!result}
                onReport={() => result && setReportOpen(true)}
                onDna={() => result && setDnaOpen(true)}
              />
              <AnalysisCard
                result={result}
                scanning={scanning}
                onReport={() => result && setReportOpen(true)}
                onDna={() => result && setDnaOpen(true)}
              />
            </div>
            <IndiaHeatmap />
          </div>

          {/* ---------- sidebar ---------- */}
          <aside className="min-w-0 space-y-5">
            <SessionHistory
              history={history}
              activeId={result?.id}
              onClear={() => setHistory([])}
              onSelect={(h) => {
                setResult(h.full);
                setScanning(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
            <TrendingScams />
          </aside>
        </div>

        <footer className="mt-7 flex flex-col items-center gap-2 border-t border-hair py-6 text-center">
          <span className="flex items-center gap-2 font-display text-base font-semibold uppercase tracking-widest text-dim">
            <ShieldAlert size={13} className="text-threat" strokeWidth={2.4} />
            {t("appTitle")} — {t("tagline")}
          </span>
          <span className="max-w-md hud leading-relaxed text-faint">{t("footerNote")}</span>
        </footer>
      </main>

      <DnaPanel open={dnaOpen} onClose={() => setDnaOpen(false)} result={result} />
      <ReportPanel open={reportOpen} onClose={() => setReportOpen(false)} result={result} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <Dashboard />
      </LocaleProvider>
    </ThemeProvider>
  );
}
