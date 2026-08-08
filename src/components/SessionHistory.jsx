import { History, Image as ImageIcon, Inbox, Link2, MessageSquare, Trash2 } from "lucide-react";
import { useLocale } from "../i18n/LocaleContext";
import { Chip, Panel } from "./ui/Primitives";

const KIND_ICON = { URL: Link2, SMS: MessageSquare, SCREENSHOT: ImageIcon };

const BADGE = {
  safe: { color: "safe", key: "badgeSafe" },
  suspicious: { color: "warn", key: "badgeSuspicious" },
  critical: { color: "threat", key: "badgeThreat" },
};

export default function SessionHistory({ history, onClear, onSelect, activeId }) {
  const { t } = useLocale();

  return (
    <Panel
      title={t("sessionHistory")}
      icon={History}
      sub={`${String(history.length).padStart(2, "0")} ${t("scans")}`}
      right={
        history.length > 0 && (
          <button onClick={onClear} className="btn-ghost !px-2 !py-1 hover:!border-threat/50 hover:!text-threat">
            <Trash2 size={17} strokeWidth={2.4} />
            <span className="hidden lg:inline">{t("clearHistory")}</span>
          </button>
        )
      }
      bodyClass="p-0"
    >
      {history.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
          <span className="grid h-12 w-12 place-items-center border border-hair bg-panel2">
            <Inbox size={19} className="text-faint" strokeWidth={1.9} />
          </span>
          <p className="hud leading-relaxed text-faint">{t("noSessionScans")}</p>
        </div>
      ) : (
        <ul className="max-h-[400px] divide-y divide-hair overflow-y-auto">
          {history.map((h) => {
            const Icon = KIND_ICON[h.kind] || Link2;
            const b = BADGE[h.verdict];
            return (
              <li key={h.id}>
                <button
                  onClick={() => onSelect(h)}
                  className={`group flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-panel2/70 ${
                    activeId === h.id ? "bg-panel2/60" : ""
                  }`}
                >
                  <span
                    className="mt-[3px] grid h-6 w-6 shrink-0 place-items-center border"
                    style={{
                      borderColor: `rgb(var(--c-${b.color})/.4)`,
                      background: `rgb(var(--c-${b.color})/.08)`,
                      color: `rgb(var(--c-${b.color}))`,
                    }}
                  >
                    <Icon size={17} strokeWidth={2.5} />
                  </span>
                  <span className="min-w-0 flex-1">
                    {/* Two lines rather than one truncated line: enough to
                        recognise the artefact without bloating the log. */}
                    <span className="line-clamp-2 font-mono text-xs leading-snug text-ink [overflow-wrap:anywhere]">
                      {h.subject}
                    </span>
                    <span className="mt-1.5 flex items-center gap-2">
                      <Chip color={b.color} solid className="!py-[2px]">
                        {t(b.key)}
                      </Chip>
                      <span className="hud text-dim">
                        {h.score}% · {new Date(h.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </span>
                  </span>
                  <span
                    className="mt-1 h-8 w-[3px] shrink-0"
                    style={{
                      background: `linear-gradient(to top, rgb(var(--c-${b.color})) ${h.score}%, rgb(var(--c-hair)) ${h.score}%)`,
                    }}
                    aria-hidden="true"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
