import { useEffect, useMemo, useState } from "react";
import { CheckCheck, Clipboard, ExternalLink, Flag, Phone, ShieldAlert } from "lucide-react";
import { useLocale } from "../i18n/LocaleContext";
import { describe } from "../i18n/findings";
import { Chip, Modal } from "./ui/Primitives";

export default function ReportPanel({ open, onClose, result }) {
  const { t, locale } = useLocale();
  const [copied, setCopied] = useState(false);

  useEffect(() => setCopied(false), [open, result?.id]);

  const packet = useMemo(() => {
    if (!result) return "";
    return [
      "=== PHISHNET REPORT PACKET ===",
      `Reference : ${result.id}`,
      `Timestamp : ${new Date(result.at).toISOString()}`,
      `Artefact  : ${result.kind}`,
      `Subject   : ${result.subject}`,
      `Safety    : ${result.score}% (${result.verdict.toUpperCase()})`,
      `Signals   : ${result.signals}`,
      "",
      "Indicators:",
      ...result.findings.filter((f) => f.weight > 0).map((f, i) => `${String(i + 1).padStart(2, "0")}. ${describe(f, locale)}`),
      "",
      `DNA sig   : ${result.dna?.sig}`,
      `Entropy   : ${result.dna?.entropy}`,
      "",
      "File at https://cybercrime.gov.in or call 1930 (India).",
    ].join("\n");
  }, [result, locale]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(packet);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = packet;
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

  if (!result) return null;
  const tone = result.verdict === "safe" ? "safe" : result.verdict === "suspicious" ? "warn" : "threat";

  return (
    <Modal open={open} onClose={onClose} title={t("reportTitle")} sub={t("reportSub")} icon={Flag} closeLabel={t("close")}>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <Chip color={tone} solid>
            <ShieldAlert size={16} strokeWidth={2.6} />
            {result.kind} · {result.score}%
          </Chip>
          <span className="font-mono text-2xs text-faint">{result.id}</span>
        </div>

        <pre className="max-h-56 overflow-auto border border-hair bg-panel2/50 p-3 font-mono text-xs leading-relaxed text-dim">
          {packet}
        </pre>

        <div>
          <p className="mb-2 hud text-dim">{t("reportChannel")}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="btn-ghost !justify-start !px-3 !py-2.5 hover:!border-beam/50 hover:!text-beam"
            >
              <ExternalLink size={15} strokeWidth={2.4} />
              cybercrime.gov.in
            </a>
            <a
              href="tel:1930"
              className="btn-ghost !justify-start !px-3 !py-2.5 hover:!border-safe/50 hover:!text-safe"
            >
              <Phone size={15} strokeWidth={2.4} />
              1930 — {t("reportHelpline")}
            </a>
          </div>
        </div>

        <p className="border border-warn/35 bg-warn/[0.06] p-3 text-xs leading-relaxed text-dim">
          {t("reportNote")}
        </p>

        <button onClick={copy} className={`btn-primary w-full ${copied ? "!border-safe/70 !text-safe" : ""}`}>
          {copied ? <CheckCheck size={16} strokeWidth={2.6} /> : <Clipboard size={16} strokeWidth={2.4} />}
          {copied ? t("copied") : t("reportSubmit")}
        </button>
      </div>
    </Modal>
  );
}
