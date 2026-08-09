import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertOctagon,
  BadgeCheck,
  Brain,
  CheckCheck,
  Clipboard,
  Cpu,
  Fingerprint,
  Flag,
  Lightbulb,
  Radar,
  ShieldQuestion,
  Siren,
} from "lucide-react";

import { useLocale } from "../i18n/LocaleContext";
import { describe } from "../i18n/findings";
import { VECTORS } from "../lib/detect";
import { Chip, Meter, Panel } from "./ui/Primitives";
const VERDICT = {
  safe: { color: "safe", icon: BadgeCheck, key: "verdictSafe" },
  suspicious: { color: "warn", icon: ShieldQuestion, key: "verdictSuspicious" },
  critical: { color: "threat", icon: AlertOctagon, key: "verdictCritical" },
};

const VECTOR_LABEL = {
  EN: {
    domain: "Domain",
    lexical: "Lexical",
    urgency: "Urgency",
    credential: "Credential",
    infra: "Infra",
    reputation: "Reputation",
  },
  HI: {
    domain: "डोमेन",
    lexical: "भाषाई",
    urgency: "तात्कालिकता",
    credential: "क्रेडेंशियल",
    infra: "अधोसंरचना",
    reputation: "प्रतिष्ठा",
  },
  MR: {
    domain: "डोमेन",
    lexical: "भाषिक",
    urgency: "तातडी",
    credential: "क्रेडेंशियल",
    infra: "पायाभूत",
    reputation: "प्रतिष्ठा",
  },
};

/** Count-up number that eases toward the final score. */
function useCountUp(target, run) {
  const [n, setN] = useState(0);
  const raf = useRef();
  useEffect(() => {
    if (!run) return;
    const t0 = performance.now();
    const from = 0;
    const dur = 1100;
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(from + (target - from) * eased));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, run]);
  return run ? n : 0;
}

/** Radial safety gauge + linear bar. */
function Gauge({ score, color, verdictLabel, Icon }) {
  const shown = useCountUp(score, true);
  const R = 52;
  const C = 2 * Math.PI * R;
  return (
    <div className="flex items-center gap-5">
      <div className="relative h-[132px] w-[132px] shrink-0">
        <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
          <circle
            cx="64"
            cy="64"
            r={R}
            fill="none"
            stroke="rgb(var(--c-hair))"
            strokeWidth="7"
          />
          <circle
            cx="64"
            cy="64"
            r={R}
            fill="none"
            stroke={`rgb(var(--c-${color}))`}
            strokeWidth="7"
            strokeLinecap="butt"
            strokeDasharray={C}
            strokeDashoffset={C - (C * shown) / 100}
            style={{
              transition: "stroke-dashoffset .25s linear",
              filter: `drop-shadow(0 0 7px rgb(var(--c-${color})/.55))`,
            }}
          />
          {/* tick ring */}
          {Array.from({ length: 40 }).map((_, i) => (
            <line
              key={i}
              x1="64"
              y1="6"
              x2="64"
              y2="11"
              stroke="rgb(var(--c-faint))"
              strokeWidth="1"
              opacity={i % 5 === 0 ? 0.55 : 0.22}
              transform={`rotate(${i * 9} 64 64)`}
            />
          ))}
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <span className="block font-display text-4xl font-bold leading-none tabular-nums text-ink">
              {shown}
              <span className="align-top text-lg text-faint">%</span>
            </span>
            <Icon
              size={17}
              className={`mx-auto mt-1.5 text-${color}`}
              strokeWidth={2.5}
            />
          </div>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <p className="hud text-dim">{verdictLabel.indexLabel}</p>
        <p
          className={`mt-2 font-display text-2xl font-bold leading-tight text-${color}`}
        >
          {verdictLabel.verdict}
        </p>
        <div className="mt-3 h-[6px] w-full overflow-hidden bg-hair/70">
          <div
            className="h-full transition-[width] duration-1000 ease-out"
            style={{
              width: `${shown}%`,
              background: `linear-gradient(90deg, rgb(var(--c-${color})/.3), rgb(var(--c-${color})))`,
            }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between hud text-dim">
          <span>00</span>
          <span className="text-threat/70">40</span>
          <span className="text-warn/70">75</span>
          <span>100</span>
        </div>
      </div>
    </div>
  );
}

export default function AnalysisCard({
  result,
  scanning,
  onReport,
  onDna,
  onIncident,
}) {
  const { t, locale } = useLocale();
  const [copied, setCopied] = useState(false);

  const summary = useMemo(() => {
    if (!result) return "";
    const v = VERDICT[result.verdict];
    const lines = [
      `PhishNet — ${t("riskAssessment")}`,
      `${t("target")}: ${result.subject}`,
      `${t("typeBadge")}: ${result.kind}`,
      `${t("safetyIndex")}: ${result.score}% · ${t(v.key)}`,
      `${t("confidence")}: ${result.confidence}%`,
      "",
      `${t("neuralSummary")}:`,
      ...result.findings.map(
        (f) => `  ${f.weight > 0 ? "▲" : "▼"} ${describe(f, locale)}`,
      ),
      "",
      `${t("recommendationTitle")}: ${t("recommendationText")}`,
      `ID: ${result.id} · ${new Date(result.at).toLocaleString()}`,
    ];
    return lines.join("\n");
  }, [result, t, locale]);

  useEffect(() => setCopied(false), [result?.id]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = summary;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  /* ---------------- scanning state ---------------- */
  if (scanning) {
    return (
      <Panel
        title={t("riskAssessment")}
        icon={Brain}
        sub={t("telemetryHeader")}
      >
        <div className="flex flex-col items-center justify-center gap-4 py-14">
          <div className="relative h-24 w-24">
            <span className="absolute inset-0 rounded-full border border-threat/25" />
            <span className="absolute inset-[14%] rounded-full border border-threat/20" />
            <span className="absolute inset-[30%] rounded-full border border-threat/15" />
            <span
              className="absolute inset-0 animate-sweep rounded-full"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent 0deg 300deg, rgb(var(--c-threat)/.55) 360deg)",
                animationDuration: "1.1s",
                mask: "radial-gradient(circle, transparent 30%, #000 32%)",
                WebkitMask:
                  "radial-gradient(circle, transparent 30%, #000 32%)",
              }}
            />
            <Radar
              size={20}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-threat"
              strokeWidth={2.3}
            />
          </div>
          <p className="hud animate-pulse text-dim">{t("analyzingBtn")}</p>
          <div className="w-full max-w-xs space-y-2">
            {VECTORS.map((v, i) => (
              <div
                key={v}
                className="h-[3px] w-full overflow-hidden bg-hair/70"
              >
                <div
                  className="h-full bg-threat/70"
                  style={{
                    animation: `bar .5s ${i * 0.11}s ease-out both`,
                    width: `${35 + i * 11}%`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </Panel>
    );
  }

  /* ---------------- empty state ---------------- */
  if (!result) {
    return (
      <Panel
        title={t("riskAssessment")}
        icon={Brain}
        sub={t("telemetryHeader")}
      >
        <div className="flex flex-col items-center gap-4 px-4 py-14 text-center">
          <span className="relative grid h-16 w-16 place-items-center border border-hair bg-panel2">
            <Cpu size={24} className="text-faint" strokeWidth={1.8} />
            <span className="absolute inset-0 animate-flick border border-faint/20" />
          </span>
          <p className="max-w-sm text-md leading-relaxed text-ink">
            {t("noScanText")}
          </p>
          <p className="max-w-xs hud leading-relaxed text-faint">
            {t("noScanHint")}
          </p>
          <div className="mt-1 flex flex-wrap justify-center gap-2">
            <Chip color="safe">&gt; 75 {t("verdictSafe")}</Chip>
            <Chip color="warn">40–75 {t("verdictSuspicious")}</Chip>
            <Chip color="threat">&lt; 40 {t("verdictCritical")}</Chip>
          </div>
        </div>
      </Panel>
    );
  }

  /* ---------------- result ---------------- */
  const v = VERDICT[result.verdict];
  const vlabels = VECTOR_LABEL[locale] || VECTOR_LABEL.EN;

  return (
    <Panel
      title={t("riskAssessment")}
      icon={Brain}
      tone={
        result.highRisk
          ? "threat"
          : result.verdict === "safe"
            ? "safe"
            : undefined
      }
      sub={`${result.id} · ${new Date(result.at).toLocaleTimeString()}`}
      right={
        <Chip color={v.color} solid>
          <v.icon size={16} strokeWidth={2.6} />
          {t(v.key)}
        </Chip>
      }
      bodyClass="p-0"
    >
      {/* CRITICAL ALARM */}
      {result.highRisk && (
        <div className="relative overflow-hidden border-b border-threat/45 bg-threat/[0.11]">
          <div
            className="absolute inset-0 opacity-[0.16]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, rgb(var(--c-threat)) 0 12px, transparent 12px 24px)",
            }}
          />
          <div className="relative flex items-center gap-3 px-4 py-3">
            <Siren
              size={17}
              className="shrink-0 animate-pulse text-threat"
              strokeWidth={2.5}
            />
            <p className="font-display text-lg font-bold leading-snug text-threat text-glow sm:text-xl">
              {t("criticalWarning")}
            </p>
          </div>
          <span
            className="absolute inset-x-0 bottom-0 h-px animate-pulse"
            style={{ background: "rgb(var(--c-threat))" }}
          />
        </div>
      )}

      {/* Target shown in full rather than truncated — the domain is exactly
          what the reader needs to inspect character by character. */}
      <div className="flex items-start gap-2 border-b border-hair bg-panel2/40 px-4 py-3">
        <span className="hud mt-1 shrink-0 text-dim">{t("target")}</span>
        {/* `anywhere` rather than `break-all`: wraps at spaces first and only
            splits an unbroken string (a long URL) when it truly must, so words
            are never chopped mid-syllable. */}
        <code className="min-w-0 font-mono text-sm leading-relaxed text-ink [overflow-wrap:anywhere]">
          {result.subject}
        </code>
      </div>

      {/* gauge */}
      <div className="border-b border-hair p-4">
        <Gauge
          score={result.score}
          color={v.color}
          Icon={v.icon}
          verdictLabel={{ indexLabel: t("safetyIndex"), verdict: t(v.key) }}
        />
        <div className="mt-4 grid grid-cols-1 gap-3 border-t border-hair pt-3 min-[24em]:grid-cols-3">
          <div>
            <p className="hud text-dim">{t("confidence")}</p>
            <p className="mt-1 font-display text-lg font-semibold tabular-nums text-ink">
              {result.confidence}%
            </p>
          </div>
          <div>
            <p className="hud text-dim">{t("threatVectors")}</p>
            <p className="mt-1 font-display text-lg font-semibold tabular-nums text-ink">
              {String(result.signals).padStart(2, "0")}
            </p>
          </div>
          <div>
            <p className="hud text-dim">{t("typeBadge")}</p>
            <p className="mt-1 font-display text-lg font-semibold uppercase text-ink">
              {t(
                result.kind === "URL"
                  ? "typeUrl"
                  : result.kind === "SMS"
                    ? "typeSms"
                    : "typeScreenshot",
              )}
            </p>
          </div>
        </div>
      </div>

      {/* ML prediction */}
      <div className="border-b border-hair p-4">
        <div className="mb-3 flex items-center gap-2">
          <Cpu size={17} className="text-threat" strokeWidth={2.5} />
          <h3 className="hud text-dim">MACHINE LEARNING PREDICTION</h3>
        </div>

        <div className="grid grid-cols-1 gap-3 min-[30em]:grid-cols-3">
          <div className="border border-hair bg-panel2/40 p-3">
            <p className="hud text-dim">CLASSIFICATION</p>
            <p
              className={`mt-1 font-display text-lg font-bold ${
                result.prediction?.label?.toLowerCase() === "phishing"
                  ? "text-threat"
                  : "text-safe"
              }`}
            >
              {result.prediction?.label || "Unknown"}
            </p>
          </div>

          <div className="border border-hair bg-panel2/40 p-3">
            <p className="hud text-dim">CONFIDENCE</p>
            <p className="mt-1 font-display text-lg font-bold tabular-nums text-ink">
              {Number(
                result.prediction?.confidence ?? result.confidence,
              ).toFixed(1)}
              %
            </p>
          </div>

          <div className="border border-hair bg-panel2/40 p-3">
            <p className="hud text-dim">MODEL</p>
            <p className="mt-1 font-display text-lg font-bold text-ink">
              Logistic Regression
            </p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 min-[30em]:grid-cols-2">
          <div>
            <div className="mb-1 flex justify-between hud">
              <span className="text-dim">PHISHING PROBABILITY</span>
              <span className="text-threat">
                {Number(result.prediction?.phishing_probability ?? 0).toFixed(
                  1,
                )}
                %
              </span>
            </div>

            <div className="h-2 overflow-hidden bg-hair/70">
              <div
                className="h-full bg-threat transition-[width] duration-700"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(
                      0,
                      Number(result.prediction?.phishing_probability ?? 0),
                    ),
                  )}%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="mb-1 flex justify-between hud">
              <span className="text-dim">LEGITIMATE PROBABILITY</span>
              <span className="text-safe">
                {Number(result.prediction?.legitimate_probability ?? 0).toFixed(
                  1,
                )}
                %
              </span>
            </div>

            <div className="h-2 overflow-hidden bg-hair/70">
              <div
                className="h-full bg-safe transition-[width] duration-700"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(
                      0,
                      Number(result.prediction?.legitimate_probability ?? 0),
                    ),
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* neural summary */}
      <div className="border-b border-hair p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 hud text-dim">
            <Cpu size={17} className="text-threat" strokeWidth={2.5} />
            {t("neuralSummary")}
          </h3>
          <button
            onClick={copy}
            className={`btn-ghost !px-2 !py-1 ${copied ? "!border-safe/60 !text-safe" : ""}`}
          >
            {copied ? (
              <CheckCheck size={17} strokeWidth={2.6} />
            ) : (
              <Clipboard size={17} strokeWidth={2.4} />
            )}
            <span className="hidden sm:inline">
              {copied ? t("copied") : t("copySummary")}
            </span>
          </button>
        </div>

        <ul className="space-y-px stack-delay">
          {result.findings.map((f, i) => {
            const neg = f.weight < 0;
            const strong = f.weight >= 20;
            const c = neg
              ? "safe"
              : strong
                ? "threat"
                : f.weight >= 10
                  ? "warn"
                  : "dim";
            return (
              <li
                key={f.code + i}
                className="group flex items-start gap-3 border-l-2 bg-panel2/30 px-3 py-2 transition-colors hover:bg-panel2/70"
                style={{
                  borderColor: `rgb(var(--c-${c === "dim" ? "faint" : c})/.6)`,
                }}
              >
                <span
                  className={`mt-[3px] shrink-0 font-mono text-2xs leading-none text-${c}`}
                >
                  {neg ? "▼" : "▲"}
                </span>
                <span className="flex-1 text-base leading-relaxed text-ink">
                  {describe(f, locale)}
                </span>
                <span
                  className={`shrink-0 font-mono text-2xs tabular-nums leading-none text-${c} opacity-70`}
                >
                  {neg ? "" : "+"}
                  {f.weight}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* recommendation */}
      <div className="p-4">
        <div
          className={`flex items-start gap-3 border p-3.5 ${
            result.verdict === "safe"
              ? "border-safe/35 bg-safe/[0.05]"
              : "border-warn/40 bg-warn/[0.06]"
          }`}
        >
          <Lightbulb
            size={16}
            className={`mt-px shrink-0 ${result.verdict === "safe" ? "text-safe" : "text-warn"}`}
            strokeWidth={2.3}
          />
          <div>
            <p
              className={`hud ${result.verdict === "safe" ? "text-safe" : "text-warn"}`}
            >
              {t("recommendationTitle")}
            </p>
            <p className="mt-1.5 text-base leading-relaxed text-ink">
              {t("recommendationText")}
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={onReport}
            className="btn-ghost flex-1 hover:!border-threat/50 hover:!text-threat sm:flex-none"
          >
            <Flag size={15} strokeWidth={2.4} />
            {t("reportScam")}
          </button>

          <button
            onClick={onDna}
            className="btn-ghost flex-1 hover:!border-beam/50 hover:!text-beam sm:flex-none"
          >
            <Fingerprint size={15} strokeWidth={2.4} />
            {t("dnaFingerprint")}
          </button>

          <button
            onClick={onIncident}
            className="btn-ghost flex-1 border-warn/40 text-warn hover:!border-warn hover:!text-warn sm:flex-none"
          >
            <Siren size={15} strokeWidth={2.4} />
            Already Clicked?
          </button>
        </div>
      </div>
    </Panel>
  );
}
