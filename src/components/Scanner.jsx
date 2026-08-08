import { useCallback, useEffect, useRef, useState } from "react";
import {
  FileImage,
  Fingerprint,
  Flag,
  Image as ImageIcon,
  Link2,
  MessageSquare,
  Radar,
  ScanLine,
  Upload,
  X,
} from "lucide-react";
import { useLocale } from "../i18n/LocaleContext";
import { detectType } from "../lib/detect";
import { Chip, Panel } from "./ui/Primitives";

const MAX_BYTES = 8 * 1024 * 1024;
const OK_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

const SAMPLES = [
  { icon: Link2, text: "https://sbi-online-kyc-verify.top/netbanking/login?update=1" },
  {
    icon: MessageSquare,
    text: "Dear Customer, your electricity will be DISCONNECTED tonight at 9:30 PM as bill is pending. Update KYC immediately: http://bses-billpay.cyou/pay Call 8XXXXXXXXX",
  },
  { icon: Link2, text: "https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx" },
];

const fmtBytes = (b) => (b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(2)} MB`);

const TYPE_STYLE = {
  URL: { color: "beam", icon: Link2, key: "typeUrl" },
  SMS: { color: "node", icon: MessageSquare, key: "typeSms" },
  SCREENSHOT: { color: "safe", icon: ImageIcon, key: "typeScreenshot" },
};

export default function Scanner({ onScan, scanning, onReport, onDna, hasResult }) {
  const { t } = useLocale();
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [err, setErr] = useState("");
  const inputRef = useRef(null);
  const dragDepth = useRef(0);

  const type = detectType(text, file);

  // object URL lifecycle — revoked on replace/unmount to avoid leaks
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const takeFile = useCallback((f) => {
    if (!f) return;
    if (!OK_TYPES.includes(f.type)) {
      setErr(`Unsupported format — ${t("dragDropSub")}`);
      return;
    }
    if (f.size > MAX_BYTES) {
      setErr(`${fmtBytes(f.size)} exceeds the 8 MB limit`);
      return;
    }
    setErr("");
    setFile(f);
  }, [t]);

  /* window-level drag so the whole panel is a valid drop target */
  useEffect(() => {
    const over = (e) => {
      if (!e.dataTransfer?.types?.includes("Files")) return;
      e.preventDefault();
    };
    const enter = (e) => {
      if (!e.dataTransfer?.types?.includes("Files")) return;
      dragDepth.current++;
      setDragging(true);
    };
    const leave = () => {
      dragDepth.current = Math.max(0, dragDepth.current - 1);
      if (dragDepth.current === 0) setDragging(false);
    };
    const drop = (e) => {
      if (!e.dataTransfer?.types?.includes("Files")) return;
      e.preventDefault();
      dragDepth.current = 0;
      setDragging(false);
      takeFile(e.dataTransfer.files?.[0]);
    };
    window.addEventListener("dragover", over);
    window.addEventListener("dragenter", enter);
    window.addEventListener("dragleave", leave);
    window.addEventListener("drop", drop);
    return () => {
      window.removeEventListener("dragover", over);
      window.removeEventListener("dragenter", enter);
      window.removeEventListener("dragleave", leave);
      window.removeEventListener("drop", drop);
    };
  }, [takeFile]);

  const reset = () => {
    setText("");
    setFile(null);
    setErr("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const submit = (e) => {
    e?.preventDefault();
    if (!type || scanning) return;
    onScan({ text, file, type });
  };

  const badge = type ? TYPE_STYLE[type] : null;
  const BadgeIcon = badge?.icon ?? Radar;

  return (
    <Panel
      title={t("scanHeader")}
      sub={t("scanSub")}
      icon={ScanLine}
      tone={dragging ? "safe" : undefined}
      right={
        <Chip color={badge?.color ?? "faint"} solid={!!badge}>
          <BadgeIcon size={16} strokeWidth={2.6} />
          {t("typeBadge")}: {badge ? t(badge.key) : t("typeIdle")}
        </Chip>
      }
      bodyClass="p-0"
    >
      <form onSubmit={submit}>
        {/* ---------- text input ---------- */}
        <div className="relative border-b border-hair">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(e);
            }}
            rows={5}
            spellCheck={false}
            disabled={!!file}
            placeholder={t("scanPlaceholder")}
            aria-label={t("scanHeader")}
            className="w-full resize-y bg-transparent px-4 py-4 pr-12 font-mono text-base leading-relaxed text-ink outline-none transition-colors placeholder:text-faint/80 disabled:opacity-40"
          />
          {(text || file) && (
            <button
              type="button"
              onClick={reset}
              title={t("clear")}
              aria-label={t("clear")}
              className="absolute right-2.5 top-3 grid h-7 w-7 place-items-center border border-hair bg-panel2 text-faint transition-colors hover:border-threat/50 hover:text-threat"
            >
              <X size={16} strokeWidth={2.6} />
            </button>
          )}
          {scanning && (
            <span className="pointer-events-none absolute inset-x-0 top-0 h-full overflow-hidden">
              <span
                className="absolute inset-x-0 h-16 animate-scanline"
                style={{
                  background:
                    "linear-gradient(180deg, transparent, rgb(var(--c-threat)/.13), transparent)",
                  animationDuration: "1.1s",
                }}
              />
            </span>
          )}
        </div>

        {/* ---------- drop zone / preview ---------- */}
        <div className="border-b border-hair p-4">
          {!file ? (
            <label
              className={`group relative flex cursor-pointer items-center gap-4 border border-dashed p-4 transition-all duration-200 ${
                dragging
                  ? "border-safe bg-safe/[0.07]"
                  : "border-hair hover:border-faint/70 hover:bg-panel2/50"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept={OK_TYPES.join(",")}
                className="sr-only"
                onChange={(e) => takeFile(e.target.files?.[0])}
              />
              <span
                className={`grid h-11 w-11 shrink-0 place-items-center border transition-colors ${
                  dragging ? "border-safe/60 bg-safe/10 text-safe" : "border-hair bg-panel2 text-faint group-hover:text-dim"
                }`}
              >
                <Upload size={17} strokeWidth={2.2} className={dragging ? "animate-bounce" : ""} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-md font-bold leading-snug text-ink">
                  {t("dragDropText")}
                </span>
                <span className="mt-1 block hud text-dim">{t("dragDropSub")}</span>
              </span>
              <span className="btn-ghost shrink-0 !border-hair group-hover:!text-ink">
                <FileImage size={15} strokeWidth={2.4} />
                <span className="hidden sm:inline">{t("browseFiles")}</span>
              </span>
            </label>
          ) : (
            <div className="flex items-center gap-4 border border-safe/35 bg-safe/[0.05] p-3">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden border border-hair bg-panel2">
                {preview && <img src={preview} alt={file.name} className="h-full w-full object-cover" />}
                <span className="absolute inset-0 border border-safe/25" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-sm leading-snug text-ink [overflow-wrap:anywhere]">{file.name}</p>
                <p className="mt-1.5 flex flex-wrap items-center gap-2">
                  <Chip color="safe" solid>
                    <ImageIcon size={16} strokeWidth={2.6} />
                    {t("typeScreenshot")}
                  </Chip>
                  <span className="hud text-dim">
                    {fmtBytes(file.size)} · {file.type.replace("image/", "").toUpperCase()}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={reset}
                className="btn-ghost shrink-0 hover:!border-threat/50 hover:!text-threat"
              >
                <X size={15} strokeWidth={2.6} />
                <span className="hidden sm:inline">{t("removeFile")}</span>
              </button>
            </div>
          )}
          {err && (
            <p className="mt-2 font-mono text-xs text-threat" role="alert">
              ! {err}
            </p>
          )}
        </div>

        {/* ---------- samples ---------- */}
        <div className="flex flex-wrap items-center gap-2 border-b border-hair px-4 py-3">
          <span className="hud text-dim">{t("samples")}</span>
          {SAMPLES.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setFile(null);
                setErr("");
                setText(s.text);
              }}
              className="btn-ghost !px-2 !py-1"
              title={s.text.slice(0, 80)}
            >
              <s.icon size={17} strokeWidth={2.4} />
              {String(i + 1).padStart(2, "0")}
            </button>
          ))}
        </div>

        {/* ---------- actions ---------- */}
        <div className="flex flex-wrap items-center gap-2 p-4">
          <button type="submit" disabled={!type || scanning} className="btn-primary flex-1 sm:flex-none">
            {scanning ? (
              <>
                <Radar size={17} className="animate-sweep" strokeWidth={2.4} />
                {t("analyzingBtn")}
              </>
            ) : (
              <>
                <ScanLine size={17} strokeWidth={2.4} />
                {t("analyzeBtn")}
              </>
            )}
          </button>
          <button type="button" onClick={onReport} disabled={!hasResult} className="btn-ghost">
            <Flag size={15} strokeWidth={2.4} />
            <span className="hidden sm:inline">{t("reportScam")}</span>
          </button>
          <button type="button" onClick={onDna} disabled={!hasResult} className="btn-ghost">
            <Fingerprint size={15} strokeWidth={2.4} />
            <span className="hidden sm:inline">{t("dnaFingerprint")}</span>
          </button>
          <span className="ml-auto hidden hud text-dim lg:inline">⌘ / Ctrl + ⏎</span>
        </div>
      </form>
    </Panel>
  );
}
