import { useCallback, useState } from "react";
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

const API_BASE = "http://127.0.0.1:5000";

function Marquee() {
  const { t } = useLocale();

  const items = [
    t("telemetryLive"),
    "OTP -+ CVV -+ UPI PIN GÇö NEVER SHARE",
    "cybercrime.gov.in -+ 1930",
    t("appSubtitle"),
    "APK SIDELOAD = MALWARE",
  ];

  const strip = [...items, ...items];

  return (
    <div className="overflow-hidden border-y border-hair bg-panel2/30">
      <div className="flex w-max animate-marquee">
        {strip.map((s, i) => (
          <span
            key={i}
            className="flex items-center gap-3 whitespace-nowrap px-5 py-2 hud text-dim"
          >
            {s}
            <span className="text-threat">Gùå</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Convert the Flask backend response into the result structure
 * expected by the existing frontend components.
 */
function mapBackendResult(data, { text, file, type }) {
  const analysis = data?.analysis || {};
  const prediction = analysis?.prediction || {};
  const risk = analysis?.risk || {};
  const rules = analysis?.rules || {};
  const explanation = analysis?.explanation || {};

  const label = prediction?.label || "Legitimate";

  const phishingProbability = Number(prediction?.phishing_probability ?? 0);

  const legitimateProbability = Number(prediction?.legitimate_probability ?? 0);

  const confidence = Number(prediction?.confidence ?? 0);

  const riskScore = Number(
    risk?.score ??
      (label.toLowerCase() === "phishing"
        ? phishingProbability
        : legitimateProbability),
  );

  /*
   * Existing UI uses:
   * safe       = legitimate / low risk
   * suspicious = phishing but below critical threshold
   * critical   = high phishing risk
   */
  let verdict = "safe";

  if (label.toLowerCase() === "phishing") {
    verdict = riskScore >= 75 ? "critical" : "suspicious";
  }

  /*
   * Existing AnalysisCard expects these six vector values.
   *
   * The backend currently provides rule signals rather than the
   * frontend's old vector structure, so we preserve the UI shape
   * without inventing ML values.
   */
  const vectors = {
    domain: 0,
    lexical: 0,
    urgency: 0,
    credential: 0,
    infra: 0,
    reputation: 0,
  };

  /*
   * Convert backend explanation reasons into the existing
   * frontend findings structure.
   */
  const reasons = Array.isArray(explanation?.reasons)
    ? explanation.reasons
    : [];

  const findings = reasons.map((reason, index) => ({
    code: `backend-${index}`,
    weight: 10,
    message:
      typeof reason === "string"
        ? reason
        : reason?.message || reason?.reason || String(reason),
  }));

  /*
   * If explanation reasons aren't available, use rule signals
   * as findings so the existing UI still has useful information.
   */
  if (findings.length === 0 && Array.isArray(rules?.signals)) {
    rules.signals.forEach((signal, index) => {
      findings.push({
        code: `rule-${index}`,
        weight: 10,
        message:
          typeof signal === "string"
            ? signal
            : signal?.message || signal?.name || String(signal),
      });
    });
  }

  const extractedText = data?.extracted_text || "";

  const subject = extractedText || text || file?.name || "Analyzed message";

  const result = {
    id: `scan-${Date.now()}`,
    subject,
    kind: file ? "SCREENSHOT" : type || "SMS",

    /*
     * Existing gauge uses result.score.
     * Backend risk.score is used here.
     */
    score: Math.max(0, Math.min(100, riskScore)),

    verdict,

    confidence,

    signals: Array.isArray(rules?.signals) ? rules.signals.length : 0,

    vectors,

    findings,

    highRisk: verdict === "critical",

    at: new Date().toISOString(),

    /*
     * Keep backend data on the result so other existing panels
     * can access it without another API request.
     */
    backend: data,

    extractedText,

    prediction: {
      label,
      confidence,
      phishing_probability: phishingProbability,
      legitimate_probability: legitimateProbability,
    },

    risk: {
      score: risk?.score,
      level: risk?.level,
      method: risk?.method,
      ml_available: risk?.ml_available,
      components: {
        rule_weight: risk?.components?.rule_weight,
        ml_weight: risk?.components?.ml_weight,
      },
    },

    rules: {
      signals: rules?.signals || [],
      suspicious_urls: rules?.suspicious_urls || [],
    },

    explanation: {
      summary: explanation?.summary || "",
      reasons,
    },

    recommendedActions: analysis?.recommended_actions || [],
  };

  return result;
}

function Dashboard() {
  const { t } = useLocale();

  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [dnaOpen, setDnaOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  /**
   * Real backend analysis.
   *
   * Text:
   * POST /api/analyze/text
   *
   * Image:
   * POST /api/analyze/image
   */
  const handleScan = useCallback(async ({ text, file, type }) => {
    setScanning(true);
    setResult(null);

    try {
      let response;

      /*
       * IMAGE ANALYSIS
       */
      if (file) {
        const formData = new FormData();

        formData.append("image", file);

        response = await fetch(`${API_BASE}/api/analyze/image`, {
          method: "POST",
          body: formData,
        });
      } else {

      /*
       * TEXT ANALYSIS
       */
        response = await fetch(`${API_BASE}/api/analyze/text`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
          }),
        });
      }

      /*
       * Try to parse the backend response.
       */
      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          `Backend returned an invalid response (${response.status}).`,
        );
      }

      /*
       * Handle HTTP/API errors.
       */
      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.error ||
            data?.message ||
            `Analysis failed with status ${response.status}.`,
        );
      }

      /*
       * Convert backend response into the structure
       * expected by the existing UI.
       */
      const frontendResult = mapBackendResult(data, {
        text,
        file,
        type,
      });

      setResult(frontendResult);

      /*
       * Add successful scan to existing session history.
       */
      setHistory((h) =>
        [
          {
            id: frontendResult.id,
            subject: frontendResult.subject,
            kind: frontendResult.kind,
            score: frontendResult.score,
            verdict: frontendResult.verdict,
            at: frontendResult.at,
            full: frontendResult,
          },
          ...h,
        ].slice(0, 40),
      );
    } catch (error) {
      console.error("PhishNet analysis error:", error);

      /*
       * Clear the previous result when the request fails.
       */
      setResult(null);

      /*
       * For now use the browser's existing alert mechanism.
       * We can replace this with the existing UI's error styling
       * later if the project already has a suitable error component.
       */
      window.alert(
        error instanceof Error ? error.message : "Unable to analyze the input.",
      );
    } finally {
      setScanning(false);
    }
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg text-ink">
      {/* atmosphere */}

      <div
        className="absolute -left-1/4 -top-1/3 h-[70vh] w-[70vw]"
        style={{
          background:
            "radial-gradient(circle, rgb(var(--c-threat)/.09), transparent 62%)",
        }}
      />

      <div
        className="absolute -right-1/4 top-1/4 h-[60vh] w-[60vw]"
        style={{
          background:
            "radial-gradient(circle, rgb(var(--c-beam)/.08), transparent 62%)",
        }}
      />

      <Header scanCount={history.length} />

      <Marquee />

      <main className="mx-auto max-w-[1560px] px-4 py-5 lg:px-6 lg:py-7">
        {/* Breakpoints are deliberately late: at the larger type scale
            (and under browser zoom) columns must collapse before text
            is crushed. */}

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

                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }}
            />

            <TrendingScams />
          </aside>
        </div>

        <footer className="mt-7 flex flex-col items-center gap-2 border-t border-hair py-6 text-center">
          <span className="flex items-center gap-2 font-display text-base font-semibold uppercase tracking-widest text-dim">
            <ShieldAlert size={13} className="text-threat" strokeWidth={2.4} />
            {t("appTitle")} GÇö {t("tagline")}
          </span>

          <span className="max-w-md hud leading-relaxed text-faint">
            {t("footerNote")}
          </span>
        </footer>
      </main>

      <DnaPanel
        open={dnaOpen}
        onClose={() => setDnaOpen(false)}
        result={result}
      />

      <ReportPanel
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        result={result}
      />
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
